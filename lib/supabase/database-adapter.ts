import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MarketDatabaseTable,
  SupabaseMarketConnectivityClient,
  SupabaseMarketDatabaseClient,
} from "../../types/market-database.ts";
import type { SupabaseMarketSyncDatabaseClient } from "../../types/market-sync.ts";
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
  SupabaseMarketConnectivityClient;

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

async function checkTable(
  client: SupabaseClient<SkinRadarSupabaseDatabase>,
  table: MarketDatabaseTable,
) {
  if (table === "market_cache_state") {
    const { error } = await client
      .from(table)
      .select("cache_key")
      .limit(1);
    assertNoError(error, `connectivity check for ${table}`);
    return;
  }

  const { error } = await client.from(table).select("id").limit(1);
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
    checkMarketTable(table) {
      return checkTable(client, table);
    },
  };
}
