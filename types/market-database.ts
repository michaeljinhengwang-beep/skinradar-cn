import type {
  MarketDataProviderName,
  ProviderCurrencyCode,
} from "./data-provider.ts";

export type MarketListingWriteRow = {
  readonly external_id: string;
  readonly provider: MarketDataProviderName;
  readonly market_hash_name: string;
  readonly weapon: string | null;
  readonly skin_name: string | null;
  readonly exterior: string | null;
  readonly price_amount: string;
  readonly currency: ProviderCurrencyCode;
  readonly float_value: string | null;
  readonly listing_url: string | null;
  readonly observed_at: string;
};

export type MarketListingRow = MarketListingWriteRow & {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
};

export type MarketCacheStateWriteRow = {
  readonly cache_key: string;
  readonly source: MarketDataProviderName;
  readonly fetched_at: string;
  readonly expires_at: string;
  readonly fallback: boolean;
};

export type SupabaseMarketCacheWrite = {
  readonly listings: readonly MarketListingWriteRow[];
  readonly metadata: MarketCacheStateWriteRow;
  readonly conflictTarget: "provider,external_id";
};

export interface SupabaseMarketDatabaseClient {
  getMarketCacheMetadata(
    cacheKey: string,
  ): Promise<unknown | null>;
  getMarketListings(
    provider: MarketDataProviderName,
    limit?: number,
  ): Promise<readonly unknown[]>;
  getMarketListing(
    provider: MarketDataProviderName,
    externalId: string,
  ): Promise<unknown | null>;
  upsertMarketCache(input: SupabaseMarketCacheWrite): Promise<{
    readonly written: number;
  }>;
}

export const MARKET_DATABASE_TABLES = [
  "market_listings",
  "market_cache_state",
  "market_sync_runs",
] as const;

export type MarketDatabaseTable = (typeof MARKET_DATABASE_TABLES)[number];

export interface SupabaseMarketConnectivityClient {
  checkMarketTable(table: MarketDatabaseTable): Promise<void>;
}
