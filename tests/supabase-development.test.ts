import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toMarketListingRow } from "../lib/repositories/market-row-mapper.ts";
import { createSupabaseMarketSyncStore } from "../lib/repositories/supabase-market-sync-store.ts";
import {
  checkSupabaseMarketDatabase,
} from "../lib/supabase/connectivity.ts";
import { createSupabaseMarketDatabaseAdapter } from "../lib/supabase/database-adapter.ts";
import {
  DEFAULT_MARKET_SYNC_LOCK_TIMEOUT_SECONDS,
  getMarketSyncStaleBefore,
  resolveMarketSyncLockTimeoutSeconds,
} from "../lib/supabase/market-sync-lock.ts";
import {
  getSupabaseServerConfig,
  SupabaseConfigurationError,
} from "../lib/supabase/server-config.ts";
import { SUPABASE_SERVER_CLIENT_OPTIONS } from "../lib/supabase/server-options.ts";
import type { NormalizedMarketListing } from "../types/data-provider.ts";
import type {
  MarketCacheStateWriteRow,
  MarketDatabaseTable,
  MarketListingRow,
} from "../types/market-database.ts";
import type { MarketSyncStatus } from "../types/market-sync.ts";
import type { SkinRadarSupabaseDatabase } from "../types/supabase-database.ts";

const CURRENT_TIME = "2026-08-11T12:00:00.000Z";
const listing: NormalizedMarketListing = {
  externalId: "supabase-listing-001",
  provider: "csfloat",
  marketHashName: "AWP | Supabase Test (Minimal Wear)",
  weapon: "AWP",
  skinName: "Supabase Test",
  exterior: "Minimal Wear",
  price: 123.45,
  currency: "CAD",
  floatValue: 0.08,
  listingUrl: null,
  observedAt: CURRENT_TIME,
};
const listingRow: MarketListingRow = {
  ...toMarketListingRow(listing),
  id: "database-listing-001",
  created_at: CURRENT_TIME,
  updated_at: CURRENT_TIME,
};
const metadata: MarketCacheStateWriteRow = {
  cache_key: "market:listings",
  source: "csfloat",
  fetched_at: CURRENT_TIME,
  expires_at: "2026-08-11T12:05:00.000Z",
  fallback: false,
};

type FakeResult = {
  readonly data: unknown;
  readonly error: { readonly message: string } | null;
};

type FakeOperation = {
  readonly kind: "select" | "update" | "rpc";
  readonly target: string;
  readonly payload?: unknown;
};

type FakeSyncRun = {
  id: string;
  provider: string;
  startedAt: string;
  completedAt: string | null;
  status: MarketSyncStatus;
  errorCode: string | null;
};

type FakeBuilder = {
  select(columns: string): FakeBuilder;
  update(values: Record<string, unknown>): FakeBuilder;
  eq(column: string, value: unknown): FakeBuilder;
  maybeSingle(): Promise<FakeResult>;
  limit(count: number): Promise<FakeResult>;
};

type FakeSupabaseOptions = {
  readonly tableFailures?: readonly MarketDatabaseTable[];
  readonly syncRuns?: readonly FakeSyncRun[];
};

function createFakeSupabaseClient({
  tableFailures = [],
  syncRuns = [],
}: FakeSupabaseOptions = {}) {
  const operations: FakeOperation[] = [];
  const runs = syncRuns.map((run) => ({ ...run }));
  const failedTables = new Set(tableFailures);
  let nextRunId = 1;

  const runtimeClient = {
    from(table: string) {
      const filters = new Map<string, unknown>();
      let updateValues: Record<string, unknown> | null = null;
      const builder: FakeBuilder = {
        select(columns) {
          operations.push({ kind: "select", target: table, payload: columns });
          return builder;
        },
        update(values) {
          updateValues = values;
          operations.push({ kind: "update", target: table, payload: values });
          return builder;
        },
        eq(column, value) {
          filters.set(column, value);
          return builder;
        },
        async maybeSingle() {
          if (table === "market_cache_state") {
            return { data: { ...metadata, updated_at: CURRENT_TIME }, error: null };
          }
          if (table === "market_sync_runs" && updateValues) {
            const run = runs.find(
              (candidate) =>
                candidate.id === filters.get("id") &&
                candidate.status === filters.get("status"),
            );
            if (!run) {
              return { data: null, error: null };
            }
            run.status = updateValues.status as MarketSyncStatus;
            run.completedAt = updateValues.completed_at as string;
            run.errorCode = updateValues.error_code as string | null;
            return { data: { id: run.id }, error: null };
          }
          return { data: null, error: null };
        },
        async limit() {
          return failedTables.has(table as MarketDatabaseTable)
            ? { data: null, error: { message: "table unavailable" } }
            : { data: [], error: null };
        },
      };
      return builder;
    },
    async rpc(name: string, args: Record<string, unknown>): Promise<FakeResult> {
      operations.push({ kind: "rpc", target: name, payload: args });
      if (name === "read_market_listings") {
        return { data: [listingRow], error: null };
      }
      if (name === "read_market_listing") {
        return args.p_external_id === listing.externalId
          ? { data: [listingRow], error: null }
          : { data: [], error: null };
      }
      if (name === "upsert_market_cache") {
        const rows = args.p_listings;
        return {
          data: Array.isArray(rows) ? rows.length : null,
          error: null,
        };
      }
      if (name === "try_start_market_sync") {
        const provider = String(args.p_provider);
        const startedAt = String(args.p_started_at);
        const staleBefore = Date.parse(String(args.p_stale_before));
        for (const run of runs) {
          if (
            run.provider === provider &&
            run.status === "running" &&
            Date.parse(run.startedAt) <= staleBefore
          ) {
            run.status = "failed";
            run.completedAt = startedAt;
            run.errorCode = "STALE_SYNC_RECOVERED";
          }
        }
        if (
          runs.some(
            (run) => run.provider === provider && run.status === "running",
          )
        ) {
          return { data: null, error: null };
        }
        const id = `new-run-${nextRunId}`;
        nextRunId += 1;
        runs.push({
          id,
          provider,
          startedAt,
          completedAt: null,
          status: "running",
          errorCode: null,
        });
        return { data: id, error: null };
      }
      return { data: null, error: { message: "unknown operation" } };
    },
  };

  return {
    client: runtimeClient as unknown as SupabaseClient<SkinRadarSupabaseDatabase>,
    operations,
    runs,
  };
}

test("SUPABASE_SECRET_KEY takes priority over legacy service role", () => {
  const config = getSupabaseServerConfig({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "preferred-secret-placeholder",
    SUPABASE_SERVICE_ROLE_KEY: "legacy-placeholder",
  });

  assert.equal(config.secretKey, "preferred-secret-placeholder");
  assert.equal(config.keySource, "secret");
});

test("legacy service role remains a compatibility fallback", () => {
  const config = getSupabaseServerConfig({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "legacy-placeholder",
  });

  assert.equal(config.secretKey, "legacy-placeholder");
  assert.equal(config.keySource, "legacy-service-role");
});

test("missing secret and legacy keys produce an initialization error", () => {
  assert.throws(
    () => getSupabaseServerConfig({ SUPABASE_URL: "https://example.supabase.co" }),
    SupabaseConfigurationError,
  );
});

test("invalid URL errors do not disclose the selected secret", () => {
  const secret = "sensitive-placeholder";

  assert.throws(
    () =>
      getSupabaseServerConfig({
        SUPABASE_URL: "invalid",
        SUPABASE_SECRET_KEY: secret,
      }),
    (error: unknown) =>
      error instanceof SupabaseConfigurationError &&
      !error.message.includes(secret),
  );
});

test("server client configuration disables auth session behavior", () => {
  assert.deepEqual(SUPABASE_SERVER_CLIENT_OPTIONS.auth, {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  });
});

test("server client module is explicitly server-only", () => {
  const source = readFileSync(
    new URL("../lib/supabase/server.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /import "server-only"/u);
  assert.doesNotMatch(source, /NEXT_PUBLIC_/u);
});

test("Supabase database adapter reads listing collections", async () => {
  const { client } = createFakeSupabaseClient();
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  assert.deepEqual(await adapter.getMarketListings("csfloat"), [listingRow]);
});

test("Supabase database adapter reads one listing by external id", async () => {
  const { client } = createFakeSupabaseClient();
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  assert.deepEqual(
    await adapter.getMarketListing("csfloat", listing.externalId),
    listingRow,
  );
});

test("Supabase database adapter uses the atomic cache upsert RPC", async () => {
  const { client, operations } = createFakeSupabaseClient();
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  const result = await adapter.upsertMarketCache({
    listings: [toMarketListingRow(listing)],
    metadata,
    conflictTarget: "provider,external_id",
  });

  assert.equal(result.written, 1);
  assert.ok(operations.some(({ target }) => target === "upsert_market_cache"));
});

test("Supabase sync adapter inserts and completes a sync run", async () => {
  const { client, runs } = createFakeSupabaseClient();
  const adapter = createSupabaseMarketDatabaseAdapter(client);
  const store = createSupabaseMarketSyncStore(adapter);
  const runId = await store.tryStartSync({
    provider: "csfloat",
    startedAt: CURRENT_TIME,
  });

  assert.ok(runId);
  await store.completeSync({
    runId,
    completedAt: "2026-08-11T12:01:00.000Z",
    status: "success",
    listingsReceived: 1,
    listingsWritten: 1,
    errorCode: null,
  });
  assert.equal(runs[0]?.status, "success");
});

test("connectivity check reports all three tables available", async () => {
  const { client } = createFakeSupabaseClient();
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  const result = await checkSupabaseMarketDatabase(adapter);

  assert.equal(result.ok, true);
  assert.ok(Object.values(result.tables).every(Boolean));
});

test("connectivity check reports an unavailable table without raw errors", async () => {
  const { client } = createFakeSupabaseClient({
    tableFailures: ["market_sync_runs"],
  });
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  const result = await checkSupabaseMarketDatabase(adapter);

  assert.equal(result.ok, false);
  assert.equal(result.tables.market_sync_runs, false);
  assert.equal(result.errorCode, "TABLE_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(result), /table unavailable/u);
});

test("connectivity check performs only select operations", async () => {
  const { client, operations } = createFakeSupabaseClient();
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  await checkSupabaseMarketDatabase(adapter);

  assert.ok(operations.length === 3);
  assert.ok(operations.every(({ kind }) => kind === "select"));
});

test("sync lock timeout defaults to fifteen minutes", () => {
  assert.equal(DEFAULT_MARKET_SYNC_LOCK_TIMEOUT_SECONDS, 900);
  assert.equal(resolveMarketSyncLockTimeoutSeconds(undefined), 900);
  assert.equal(resolveMarketSyncLockTimeoutSeconds("invalid"), 900);
});

test("stale sync threshold is derived from the configured timeout", () => {
  assert.equal(
    getMarketSyncStaleBefore(CURRENT_TIME, 900),
    "2026-08-11T11:45:00.000Z",
  );
});

test("an active running sync still rejects concurrent acquisition", async () => {
  const activeRun: FakeSyncRun = {
    id: "active-run",
    provider: "csfloat",
    startedAt: "2026-08-11T11:55:00.000Z",
    completedAt: null,
    status: "running",
    errorCode: null,
  };
  const { client, runs } = createFakeSupabaseClient({ syncRuns: [activeRun] });
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  const result = await adapter.tryInsertMarketSyncRun({
    provider: "csfloat",
    startedAt: CURRENT_TIME,
  });

  assert.equal(result, null);
  assert.equal(runs[0]?.status, "running");
});

test("a stale running sync is failed and replaced without deletion", async () => {
  const staleRun: FakeSyncRun = {
    id: "stale-run",
    provider: "csfloat",
    startedAt: "2026-08-11T11:30:00.000Z",
    completedAt: null,
    status: "running",
    errorCode: null,
  };
  const { client, runs } = createFakeSupabaseClient({ syncRuns: [staleRun] });
  const adapter = createSupabaseMarketDatabaseAdapter(client);

  const newRunId = await adapter.tryInsertMarketSyncRun({
    provider: "csfloat",
    startedAt: CURRENT_TIME,
  });

  assert.ok(newRunId);
  assert.equal(runs.length, 2);
  assert.equal(runs[0]?.status, "failed");
  assert.equal(runs[0]?.errorCode, "STALE_SYNC_RECOVERED");
  assert.equal(runs[0]?.completedAt, CURRENT_TIME);
});

test("database migration keeps the unique lock as the final race guarantee", () => {
  const sql = readFileSync(
    new URL(
      "../supabase/migrations/20260811000000_create_market_tables.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(sql, /unique index market_sync_runs_one_running_per_provider/iu);
  assert.match(sql, /error_code = 'STALE_SYNC_RECOVERED'/u);
  assert.match(sql, /when unique_violation then[\s\S]+return null/iu);
  assert.doesNotMatch(sql, /delete\s+from|truncate|drop\s+database/iu);
});
