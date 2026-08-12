import type { MarketDataProviderName } from "../../types/data-provider.ts";
import type {
  MarketCacheStateWriteRow,
  SupabaseMarketDatabaseClient,
} from "../../types/market-database.ts";
import type {
  MarketCacheEnvelope,
  MarketCacheMetadata,
  MarketRepository,
} from "../../types/market-repository.ts";
import {
  getMarketCacheExpiresAt,
  getMarketCacheTtlSeconds,
  resolveMarketCacheTtlSeconds,
} from "../cache/market-cache.ts";
import { MARKET_DATA_PROVIDER_NAMES } from "../../types/data-provider.ts";
import {
  fromMarketListingRow,
  toMarketListingRow,
} from "./market-row-mapper.ts";
import {
  getSupabaseServerConfig,
} from "../supabase/server-config.ts";
import type {
  SupabaseServerEnvironment,
} from "../supabase/server-config.ts";

type SupabaseMarketRepositoryOptions = {
  readonly client: SupabaseMarketDatabaseClient;
  readonly environment?: SupabaseServerEnvironment;
  readonly cacheKey?: string;
  readonly maxListings?: number;
  readonly ttlSeconds?: number;
  readonly now?: () => Date;
};

type ParsedCacheMetadata = Omit<MarketCacheMetadata, "stale">;

const PROVIDERS = new Set<string>(MARKET_DATA_PROVIDER_NAMES);
const DEFAULT_MAX_LISTINGS = 100;

export class SupabaseMarketRepositoryMappingError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseMarketRepositoryMappingError";
  }
}

function resolveMaxListings(value: number) {
  return Number.isInteger(value) && value > 0
    ? Math.min(value, DEFAULT_MAX_LISTINGS)
    : DEFAULT_MAX_LISTINGS;
}

function parseMetadata(input: unknown): ParsedCacheMetadata {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new SupabaseMarketRepositoryMappingError(
      "Market cache metadata must be an object.",
    );
  }

  const row = input as Record<string, unknown>;
  if (typeof row.source !== "string" || !PROVIDERS.has(row.source)) {
    throw new SupabaseMarketRepositoryMappingError(
      "Market cache metadata source is invalid.",
    );
  }
  if (
    typeof row.fetched_at !== "string" ||
    !Number.isFinite(Date.parse(row.fetched_at)) ||
    typeof row.expires_at !== "string" ||
    !Number.isFinite(Date.parse(row.expires_at)) ||
    typeof row.fallback !== "boolean"
  ) {
    throw new SupabaseMarketRepositoryMappingError(
      "Market cache metadata timestamps are invalid.",
    );
  }

  return {
    source: row.source as MarketDataProviderName,
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    fallback: row.fallback,
  };
}

function withFreshness(
  metadata: ParsedCacheMetadata,
  currentTime: Date,
): MarketCacheMetadata {
  return {
    ...metadata,
    stale: currentTime.getTime() >= Date.parse(metadata.expiresAt),
  };
}

export function createSupabaseMarketRepository({
  client,
  environment = process.env,
  cacheKey = "market:listings",
  maxListings = DEFAULT_MAX_LISTINGS,
  ttlSeconds = getMarketCacheTtlSeconds(),
  now = () => new Date(),
}: SupabaseMarketRepositoryOptions): MarketRepository {
  getSupabaseServerConfig(environment);
  const cacheTtlSeconds = resolveMarketCacheTtlSeconds(ttlSeconds);
  const listingsLimit = resolveMaxListings(maxListings);

  async function getMetadata(): Promise<MarketCacheMetadata | null> {
    const row = await client.getMarketCacheMetadata(cacheKey);
    return row ? withFreshness(parseMetadata(row), now()) : null;
  }

  return {
    async getListings() {
      const metadata = await getMetadata();
      if (!metadata) {
        return null;
      }

      const rows = (
        await client.getMarketListings(metadata.source, listingsLimit)
      ).slice(0, listingsLimit);
      const data = rows.map(fromMarketListingRow);
      if (data.some(({ provider }) => provider !== metadata.source)) {
        throw new SupabaseMarketRepositoryMappingError(
          "Market cache contains a mismatched provider.",
        );
      }

      return { data, ...metadata };
    },
    async getListingById(id) {
      const metadata = await getMetadata();
      if (!metadata) {
        return undefined;
      }

      const row = await client.getMarketListing(metadata.source, id);
      return row ? fromMarketListingRow(row) : undefined;
    },
    async replaceListings(input) {
      const expiresAt = getMarketCacheExpiresAt(
        input.fetchedAt,
        cacheTtlSeconds,
      );
      const metadata: MarketCacheStateWriteRow = {
        cache_key: cacheKey,
        source: input.source,
        fetched_at: input.fetchedAt,
        expires_at: expiresAt,
        fallback: input.fallback,
      };
      const rows = input.data.map(toMarketListingRow);

      await client.upsertMarketCache({
        listings: rows,
        metadata,
        conflictTarget: "provider,external_id",
      });

      return {
        data: rows.map(fromMarketListingRow),
        source: input.source,
        fetchedAt: input.fetchedAt,
        expiresAt,
        stale: now().getTime() >= Date.parse(expiresAt),
        fallback: input.fallback,
      } satisfies MarketCacheEnvelope;
    },
    getMetadata,
  };
}
