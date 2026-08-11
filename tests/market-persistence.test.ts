import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mockMarketDataProvider } from "../lib/providers/mock-market-provider.ts";
import { MarketProviderError } from "../lib/providers/errors.ts";
import {
  fromMarketListingRow,
  toMarketListingRow,
} from "../lib/repositories/market-row-mapper.ts";
import { createMemoryMarketRepository } from "../lib/repositories/memory-market-repository.ts";
import { createSupabaseMarketRepository } from "../lib/repositories/supabase-market-repository.ts";
import { createSupabaseMarketSyncStore } from "../lib/repositories/supabase-market-sync-store.ts";
import {
  createMarketSyncService,
  SyncAlreadyRunningError,
} from "../lib/services/market-sync-service.ts";
import {
  getSupabaseServerConfig,
  SupabaseConfigurationError,
} from "../lib/supabase/server-config.ts";
import type {
  MarketDataProvider,
  MarketDataProviderName,
  NormalizedMarketListing,
} from "../types/data-provider.ts";
import type {
  MarketCacheStateWriteRow,
  MarketListingRow,
  MarketListingWriteRow,
  SupabaseMarketCacheWrite,
  SupabaseMarketDatabaseClient,
} from "../types/market-database.ts";
import type {
  CompleteMarketSyncInput,
  StartMarketSyncInput,
  SupabaseMarketSyncDatabaseClient,
} from "../types/market-sync.ts";

const SUPABASE_TEST_ENV = {
  SUPABASE_URL: "https://skinradar-test.supabase.co",
  SUPABASE_SECRET_KEY: "test-only-placeholder",
} as const;
const FETCHED_AT = "2026-08-11T08:00:00.000Z";
const NOW = new Date("2026-08-11T08:01:00.000Z");
const normalizedListing: NormalizedMarketListing = {
  externalId: "listing-001",
  provider: "csfloat",
  marketHashName: "AK-47 | Persistence Test (Factory New)",
  weapon: "AK-47",
  skinName: "Persistence Test",
  exterior: "Factory New",
  price: 2600.01,
  currency: "CAD",
  floatValue: 0.012345678,
  listingUrl: null,
  observedAt: FETCHED_AT,
};

type FakeDatabaseState = {
  rows: MarketListingRow[];
  metadata: MarketCacheStateWriteRow | null;
  operations: string[];
};

function materializeRow(
  row: MarketListingWriteRow,
  index: number,
): MarketListingRow {
  return {
    ...row,
    id: `database-row-${index}`,
    created_at: FETCHED_AT,
    updated_at: FETCHED_AT,
  };
}

function createFakeDatabaseClient(
  initialRows: readonly MarketListingWriteRow[] = [],
  initialMetadata: MarketCacheStateWriteRow | null = null,
) {
  const state: FakeDatabaseState = {
    rows: initialRows.map(materializeRow),
    metadata: initialMetadata ? { ...initialMetadata } : null,
    operations: [],
  };

  const client: SupabaseMarketDatabaseClient = {
    async getMarketCacheMetadata(cacheKey) {
      state.operations.push("select-metadata");
      return state.metadata?.cache_key === cacheKey
        ? { ...state.metadata }
        : null;
    },
    async getMarketListings(provider) {
      state.operations.push("select-listings");
      return state.rows
        .filter((row) => row.provider === provider)
        .map((row) => ({ ...row }));
    },
    async getMarketListing(provider, externalId) {
      state.operations.push("select-listing");
      const row = state.rows.find(
        (candidate) =>
          candidate.provider === provider &&
          candidate.external_id === externalId,
      );
      return row ? { ...row } : null;
    },
    async upsertMarketCache(input: SupabaseMarketCacheWrite) {
      state.operations.push("upsert-cache");
      for (const listing of input.listings) {
        const existingIndex = state.rows.findIndex(
          (row) =>
            row.provider === listing.provider &&
            row.external_id === listing.external_id,
        );
        if (existingIndex >= 0) {
          state.rows[existingIndex] = materializeRow(
            listing,
            existingIndex,
          );
        } else {
          state.rows.push(materializeRow(listing, state.rows.length));
        }
      }
      state.metadata = { ...input.metadata };
      return { written: input.listings.length };
    },
  };

  return { client, state };
}

function createProvider(
  name: MarketDataProviderName,
  getListings: MarketDataProvider["getListings"],
): MarketDataProvider {
  return {
    name,
    getListings,
    async getSkinByExternalId() {
      return undefined;
    },
    async healthCheck() {
      return { provider: name, available: true };
    },
  };
}

function createFakeSyncDatabaseClient(running = false) {
  const starts: StartMarketSyncInput[] = [];
  const completions: CompleteMarketSyncInput[] = [];
  let isRunning = running;

  const client: SupabaseMarketSyncDatabaseClient = {
    async tryInsertMarketSyncRun(input) {
      if (isRunning) {
        return null;
      }
      isRunning = true;
      starts.push({ ...input });
      return `sync-run-${starts.length}`;
    },
    async updateMarketSyncRun(input) {
      completions.push({ ...input });
      isRunning = false;
    },
  };

  return { client, starts, completions };
}

function createPersistentRepository(
  client: SupabaseMarketDatabaseClient,
) {
  return createSupabaseMarketRepository({
    client,
    environment: SUPABASE_TEST_ENV,
    ttlSeconds: 300,
    now: () => NOW,
  });
}

test("ordinary modules work without Supabase server configuration", async () => {
  const repository = createMemoryMarketRepository({ now: () => NOW });

  assert.equal(await repository.getListings(), null);
});

test("Supabase Repository initialization requires server configuration", () => {
  const { client } = createFakeDatabaseClient();

  assert.throws(
    () => createSupabaseMarketRepository({ client, environment: {} }),
    SupabaseConfigurationError,
  );
});

test("Supabase configuration errors never include the service role value", () => {
  const secret = "never-echo-this-service-role";

  assert.throws(
    () =>
      getSupabaseServerConfig({
        SUPABASE_URL: "not-a-url",
        SUPABASE_SERVICE_ROLE_KEY: secret,
      }),
    (error: unknown) =>
      error instanceof SupabaseConfigurationError &&
      !error.message.includes(secret),
  );
});

test("valid Supabase server configuration is parsed", () => {
  const config = getSupabaseServerConfig(SUPABASE_TEST_ENV);

  assert.equal(config.url, "https://skinradar-test.supabase.co/");
  assert.equal(config.secretKey, "test-only-placeholder");
  assert.equal(config.keySource, "secret");
});

test("row mapper converts an internal listing to snake_case", () => {
  const row = toMarketListingRow(normalizedListing);

  assert.equal(row.external_id, normalizedListing.externalId);
  assert.equal(row.market_hash_name, normalizedListing.marketHashName);
  assert.equal(row.observed_at, normalizedListing.observedAt);
});

test("row mapper does not mutate its input", () => {
  const snapshot = JSON.stringify(normalizedListing);

  toMarketListingRow(normalizedListing);

  assert.equal(JSON.stringify(normalizedListing), snapshot);
});

test("money is persisted as an eight-decimal NUMERIC string", () => {
  const row = toMarketListingRow(normalizedListing);

  assert.equal(row.price_amount, "2600.01000000");
  assert.equal(fromMarketListingRow(row).price, 2600.01);
});

test("row mapper safely round-trips nullable fields", () => {
  const listing = {
    ...normalizedListing,
    weapon: null,
    skinName: null,
    exterior: null,
    floatValue: null,
    listingUrl: null,
  };

  assert.deepEqual(fromMarketListingRow(toMarketListingRow(listing)), listing);
});

test("database row mapper rejects an unsupported provider", () => {
  const row = { ...toMarketListingRow(normalizedListing), provider: "unknown" };

  assert.throws(() => fromMarketListingRow(row), /provider is not supported/u);
});

test("database row mapper rejects an invalid timestamp", () => {
  const row = {
    ...toMarketListingRow(normalizedListing),
    observed_at: "invalid-date",
  };

  assert.throws(() => fromMarketListingRow(row), /valid timestamp/u);
});

test("Supabase Repository maps getListings rows", async () => {
  const row = toMarketListingRow(normalizedListing);
  const { client } = createFakeDatabaseClient([row], {
    cache_key: "market:listings",
    source: "csfloat",
    fetched_at: FETCHED_AT,
    expires_at: "2026-08-11T08:05:00.000Z",
    fallback: false,
  });

  const result = await createPersistentRepository(client).getListings();

  assert.deepEqual(result?.data, [normalizedListing]);
  assert.equal(result?.stale, false);
});

test("Supabase Repository maps getListingById", async () => {
  const row = toMarketListingRow(normalizedListing);
  const { client } = createFakeDatabaseClient([row], {
    cache_key: "market:listings",
    source: "csfloat",
    fetched_at: FETCHED_AT,
    expires_at: "2026-08-11T08:05:00.000Z",
    fallback: false,
  });

  const result = await createPersistentRepository(client).getListingById(
    normalizedListing.externalId,
  );

  assert.deepEqual(result, normalizedListing);
});

test("Supabase Repository upserts by provider and external id", async () => {
  const { client, state } = createFakeDatabaseClient();

  await createPersistentRepository(client).replaceListings({
    data: [normalizedListing],
    source: "csfloat",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.equal(state.rows.length, 1);
  assert.equal(state.operations.includes("upsert-cache"), true);
});

test("Supabase Repository updates the same logical listing without a duplicate", async () => {
  const smokeListing: NormalizedMarketListing = {
    ...normalizedListing,
    externalId: "skinradar-smoke-test-listing-001",
    provider: "mock",
    price: 123.45,
    currency: "UNSPECIFIED",
  };
  const { client, state } = createFakeDatabaseClient();
  const repository = createSupabaseMarketRepository({
    client,
    environment: SUPABASE_TEST_ENV,
    cacheKey: "skinradar-smoke-test",
    now: () => NOW,
  });

  await repository.replaceListings({
    data: [smokeListing],
    source: "mock",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });
  await repository.replaceListings({
    data: [{ ...smokeListing, price: 124.56 }],
    source: "mock",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.equal(state.rows.length, 1);
  assert.equal(state.rows[0]?.price_amount, "124.56000000");
});

test("Supabase Repository keeps smoke cache state on its isolated key", async () => {
  const { client, state } = createFakeDatabaseClient();
  const repository = createSupabaseMarketRepository({
    client,
    environment: SUPABASE_TEST_ENV,
    cacheKey: "skinradar-smoke-test",
    now: () => NOW,
  });

  await repository.replaceListings({
    data: [
      {
        ...normalizedListing,
        externalId: "skinradar-smoke-test-listing-001",
        provider: "mock",
      },
    ],
    source: "mock",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.equal(state.metadata?.cache_key, "skinradar-smoke-test");
  assert.equal(state.metadata?.source, "mock");
  assert.equal((await repository.getMetadata())?.source, "mock");
});

test("a Provider upsert does not overwrite another Provider", async () => {
  const mockRow = toMarketListingRow({
    ...normalizedListing,
    provider: "mock",
  });
  const { client, state } = createFakeDatabaseClient([mockRow]);

  await createPersistentRepository(client).replaceListings({
    data: [normalizedListing],
    source: "csfloat",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.equal(state.rows.length, 2);
  assert.deepEqual(
    new Set(state.rows.map(({ provider }) => provider)),
    new Set(["mock", "csfloat"]),
  );
});

test("replaceListings never invokes a delete operation", async () => {
  const { client, state } = createFakeDatabaseClient();

  await createPersistentRepository(client).replaceListings({
    data: [normalizedListing],
    source: "csfloat",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.ok(state.operations.every((operation) => !operation.includes("delete")));
});

test("successful sync completes its persistent run", async () => {
  const { client: databaseClient } = createFakeDatabaseClient();
  const syncDatabase = createFakeSyncDatabaseClient();
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => [normalizedListing]),
    repository: createPersistentRepository(databaseClient),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  const result = await service.sync();

  assert.equal(result.status, "success");
  assert.equal(syncDatabase.starts.length, 1);
  assert.equal(syncDatabase.completions[0]?.status, "success");
});

test("failed sync completes its run as failed", async () => {
  const { client: databaseClient } = createFakeDatabaseClient();
  const syncDatabase = createFakeSyncDatabaseClient();
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => {
      throw new MarketProviderError(
        "PROVIDER_UNAVAILABLE",
        "csfloat",
        "provider unavailable",
      );
    }),
    repository: createPersistentRepository(databaseClient),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  const result = await service.sync();

  assert.equal(result.status, "failed");
  assert.equal(syncDatabase.completions[0]?.status, "failed");
});

test("sync persists only a sanitized Provider error code", async () => {
  const secret = "private-provider-key";
  const { client: databaseClient } = createFakeDatabaseClient();
  const syncDatabase = createFakeSyncDatabaseClient();
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => {
      throw new MarketProviderError(
        "AUTH_REQUIRED",
        "csfloat",
        `Authorization failed for ${secret}`,
      );
    }),
    repository: createPersistentRepository(databaseClient),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  const result = await service.sync();
  const persisted = JSON.stringify(syncDatabase.completions);

  assert.equal(result.errorCode, "AUTH_REQUIRED");
  assert.ok(!persisted.includes(secret));
  assert.ok(!persisted.includes("Authorization failed"));
});

test("sync does not persist third-party raw response fields", async () => {
  const { client: databaseClient, state } = createFakeDatabaseClient();
  const syncDatabase = createFakeSyncDatabaseClient();
  const listingWithRawField = {
    ...normalizedListing,
    seller: { steam_id: "raw-user-id" },
  };
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => [listingWithRawField]),
    repository: createPersistentRepository(databaseClient),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  await service.sync();

  assert.ok(!JSON.stringify(state.rows).includes("steam_id"));
  assert.ok(!JSON.stringify(state.rows).includes("raw-user-id"));
});

test("sync does not persist configuration secrets", async () => {
  const secretEnvironment = {
    ...SUPABASE_TEST_ENV,
    SUPABASE_SECRET_KEY: "database-secret-placeholder",
  };
  const { client, state } = createFakeDatabaseClient();
  const repository = createSupabaseMarketRepository({
    client,
    environment: secretEnvironment,
    now: () => NOW,
  });
  const syncDatabase = createFakeSyncDatabaseClient();
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => [normalizedListing]),
    repository,
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  await service.sync();

  assert.ok(!JSON.stringify(state).includes(secretEnvironment.SUPABASE_SECRET_KEY));
  assert.ok(!JSON.stringify(syncDatabase).includes(secretEnvironment.SUPABASE_SECRET_KEY));
});

test("concurrent sync is rejected before calling the Provider", async () => {
  let providerCalls = 0;
  const { client: databaseClient } = createFakeDatabaseClient();
  const syncDatabase = createFakeSyncDatabaseClient(true);
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => {
      providerCalls += 1;
      return [normalizedListing];
    }),
    repository: createPersistentRepository(databaseClient),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  await assert.rejects(() => service.sync(), SyncAlreadyRunningError);
  assert.equal(providerCalls, 0);
});

test("Provider failure leaves previously persisted listings untouched", async () => {
  const existingRow = toMarketListingRow(normalizedListing);
  const { client, state } = createFakeDatabaseClient([existingRow]);
  const before = JSON.stringify(state.rows);
  const syncDatabase = createFakeSyncDatabaseClient();
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => {
      throw new MarketProviderError(
        "PROVIDER_UNAVAILABLE",
        "csfloat",
        "offline",
      );
    }),
    repository: createPersistentRepository(client),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  await service.sync();

  assert.equal(JSON.stringify(state.rows), before);
  assert.ok(!state.operations.includes("upsert-cache"));
});

test("invalid Provider response never writes over persisted listings", async () => {
  const existingRow = toMarketListingRow(normalizedListing);
  const { client, state } = createFakeDatabaseClient([existingRow]);
  const before = JSON.stringify(state.rows);
  const syncDatabase = createFakeSyncDatabaseClient();
  const invalidListing = { ...normalizedListing, marketHashName: "   " };
  const service = createMarketSyncService({
    provider: createProvider("csfloat", async () => [invalidListing]),
    repository: createPersistentRepository(client),
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  const result = await service.sync();

  assert.equal(result.errorCode, "NORMALIZATION_ERROR");
  assert.equal(JSON.stringify(state.rows), before);
  assert.ok(!state.operations.includes("upsert-cache"));
});

test("mock Provider can drive the Sync Service without network access", async () => {
  const repository = createMemoryMarketRepository({ now: () => NOW });
  const syncDatabase = createFakeSyncDatabaseClient();
  const service = createMarketSyncService({
    provider: mockMarketDataProvider,
    repository,
    syncStore: createSupabaseMarketSyncStore(syncDatabase.client),
    now: () => NOW,
  });

  const result = await service.sync();

  assert.equal(result.status, "success");
  assert.ok(result.written > 0);
  assert.equal((await repository.getListings())?.source, "mock");
});

test("Memory Repository remains replaceable behind MarketRepository", async () => {
  const repository = createMemoryMarketRepository({ now: () => NOW });

  await repository.replaceListings({
    data: [normalizedListing],
    source: "csfloat",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.deepEqual(
    await repository.getListingById(normalizedListing.externalId),
    normalizedListing,
  );
});

test("migration uses server-only RLS and avoids destructive full-table writes", () => {
  const sql = readFileSync(
    new URL(
      "../supabase/migrations/20260811000000_create_market_tables.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(sql, /enable row level security/iu);
  assert.match(sql, /grant select, insert, update[\s\S]+service_role/iu);
  assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)/iu);
  assert.doesNotMatch(sql, /delete\s+from|truncate/iu);
});

test("market pages continue to use mockSkins directly", () => {
  const marketPage = readFileSync(
    new URL("../app/market/page.tsx", import.meta.url),
    "utf8",
  );
  const detailPage = readFileSync(
    new URL("../app/market/[id]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(marketPage, /mockSkins/u);
  assert.match(detailPage, /mockSkins/u);
  assert.doesNotMatch(marketPage, /supabase/iu);
  assert.doesNotMatch(detailPage, /supabase/iu);
});
