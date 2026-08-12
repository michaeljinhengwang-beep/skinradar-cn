import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MarketDatabaseTable,
  SupabaseMarketConnectivityClient,
  SupabaseMarketDatabaseClient,
} from "../../types/market-database.ts";
import type {
  MarketSyncErrorCode,
  MarketSyncHealthRun,
  MarketSyncHealthStore,
  SupabaseMarketSyncDatabaseClient,
} from "../../types/market-sync.ts";
import type { SkinRadarSupabaseDatabase } from "../../types/supabase-database.ts";
import { toMarketSyncRunUpdate } from "../../types/supabase-database.ts";
import {
  getMarketSyncLockTimeoutSeconds,
  getMarketSyncStaleBefore,
  resolveMarketSyncLockTimeoutSeconds,
} from "./market-sync-lock.ts";
import type { SupabaseServerEnvironment } from "./server-config.ts";

export class SupabaseMarketDatabaseError extends Error {
  readonly code = "DATABASE_ERROR" as const;

  constructor(operation: string) {
    super(`Supabase market database ${operation} failed.`);
    this.name = "SupabaseMarketDatabaseError";
  }
}

type SupabaseMarketAdapter = SupabaseMarketDatabaseClient &
  SupabaseMarketSyncDatabaseClient &
  SupabaseMarketConnectivityClient &
  MarketSyncHealthStore;

type SupabaseMarketDatabaseAdapterOptions = {
  readonly environment?: SupabaseServerEnvironment;
  readonly lockTimeoutSeconds?: number;
};

function databaseError(operation: string): never {
  throw new SupabaseMarketDatabaseError(operation);
}

function assertNoError(error: unknown, operation: string) {
  if (error) {
    databaseError(operation);
  }
}

type MarketSyncHealthRow = Pick<
  SkinRadarSupabaseDatabase["public"]["Tables"]["market_sync_runs"]["Row"],
  | "provider"
  | "started_at"
  | "completed_at"
  | "status"
  | "listings_received"
  | "listings_written"
  | "error_code"
>;

const HEALTH_ERROR_CODES = new Set<MarketSyncErrorCode>([
  "PROVIDER_UNAVAILABLE",
  "AUTH_REQUIRED",
  "RATE_LIMITED",
  "INVALID_RESPONSE",
  "NORMALIZATION_ERROR",
  "SYNC_WRITE_FAILED",
  "STALE_SYNC_RECOVERED",
  "TIMEOUT",
]);

function toMarketSyncHealthRun(
  row: MarketSyncHealthRow,
): MarketSyncHealthRun {
  if (
    (row.status !== "success" && row.status !== "failed") ||
    row.completed_at === null ||
    !Number.isFinite(Date.parse(row.started_at)) ||
    !Number.isFinite(Date.parse(row.completed_at)) ||
    !Number.isInteger(row.listings_received) ||
    row.listings_received < 0 ||
    !Number.isInteger(row.listings_written) ||
    row.listings_written < 0
  ) {
    databaseError("sync health result validation");
  }

  const errorCode =
    row.error_code === null
      ? null
      : HEALTH_ERROR_CODES.has(row.error_code as MarketSyncErrorCode)
        ? (row.error_code as MarketSyncErrorCode)
        : "UNKNOWN";

  return {
    provider: row.provider,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
    received: row.listings_received,
    written: row.listings_written,
    errorCode,
  };
}

async function checkTable(
  client: SupabaseClient<SkinRadarSupabaseDatabase>,
  table: MarketDatabaseTable,
) {
  const primaryKeyColumn =
    table === "market_cache_state" ? "cache_key" : "id";
  const { error } = await client
    .from(table)
    .select(primaryKeyColumn)
    .limit(1);
  assertNoError(error, `connectivity check for ${table}`);
}

export function createSupabaseMarketDatabaseAdapter(
  client: SupabaseClient<SkinRadarSupabaseDatabase>,
  {
    environment = process.env,
    lockTimeoutSeconds = getMarketSyncLockTimeoutSeconds(environment),
  }: SupabaseMarketDatabaseAdapterOptions = {},
): SupabaseMarketAdapter {
  const syncLockTimeout = resolveMarketSyncLockTimeoutSeconds(
    lockTimeoutSeconds,
  );

  return {
    async getMarketCacheMetadata(cacheKey) {
      const { data, error } = await client
        .from("market_cache_state")
        .select("*")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      assertNoError(error, "cache metadata read");
      return data;
    },
    async getMarketListings(provider) {
      const { data, error } = await client.rpc("read_market_listings", {
        p_provider: provider,
      });
      assertNoError(error, "listing read");
      return data ?? [];
    },
    async getMarketListing(provider, externalId) {
      const { data, error } = await client.rpc("read_market_listing", {
        p_provider: provider,
        p_external_id: externalId,
      });
      assertNoError(error, "single listing read");
      return data?.[0] ?? null;
    },
    async upsertMarketCache(input) {
      const { data, error } = await client.rpc("upsert_market_cache", {
        p_listings: input.listings,
        p_cache_key: input.metadata.cache_key,
        p_source: input.metadata.source,
        p_fetched_at: input.metadata.fetched_at,
        p_expires_at: input.metadata.expires_at,
        p_fallback: input.metadata.fallback,
      });
      assertNoError(error, "atomic cache upsert");
      if (typeof data !== "number" || !Number.isInteger(data) || data < 0) {
        databaseError("atomic cache upsert result validation");
      }
      return { written: data };
    },
    async tryInsertMarketSyncRun(input) {
      const { data, error } = await client.rpc("try_start_market_sync", {
        p_provider: input.provider,
        p_started_at: input.startedAt,
        p_stale_before: getMarketSyncStaleBefore(
          input.startedAt,
          syncLockTimeout,
        ),
      });
      assertNoError(error, "sync lock acquisition");
      if (data !== null && typeof data !== "string") {
        databaseError("sync lock result validation");
      }
      return data;
    },
    async updateMarketSyncRun(input) {
      const { data, error } = await client
        .from("market_sync_runs")
        .update(toMarketSyncRunUpdate(input))
        .eq("id", input.runId)
        .eq("status", "running")
        .select("id")
        .maybeSingle();
      assertNoError(error, "sync run completion");
      if (!data) {
        databaseError("sync run completion result validation");
      }
    },
    async getLatestMarketSyncRun(provider, status) {
      const { data, error } = await client
        .from("market_sync_runs")
        .select(
          "provider,started_at,completed_at,status,listings_received,listings_written,error_code",
        )
        .eq("provider", provider)
        .eq("status", status)
        .order("started_at", { ascending: false })
        .limit(1);
      assertNoError(error, "sync health read");
      return data?.[0] ? toMarketSyncHealthRun(data[0]) : null;
    },
    checkMarketTable(table) {
      return checkTable(client, table);
    },
  };
}
