import type {
  MarketCacheStateWriteRow,
  MarketListingRow,
  MarketListingWriteRow,
} from "./market-database.ts";
import type {
  CompleteMarketSyncInput,
  MarketSyncStatus,
} from "./market-sync.ts";

type Relationships = [];

export type MarketCacheStateRow = MarketCacheStateWriteRow & {
  readonly updated_at: string;
};

export type MarketSyncRunRow = {
  readonly id: string;
  readonly provider: "mock" | "csfloat";
  readonly started_at: string;
  readonly completed_at: string | null;
  readonly status: MarketSyncStatus;
  readonly listings_received: number;
  readonly listings_written: number;
  readonly error_code: string | null;
  readonly created_at: string;
};

export type SkinRadarSupabaseDatabase = {
  public: {
    Tables: {
      market_listings: {
        Row: MarketListingRow;
        Insert: MarketListingWriteRow;
        Update: Partial<MarketListingWriteRow>;
        Relationships: Relationships;
      };
      market_cache_state: {
        Row: MarketCacheStateRow;
        Insert: MarketCacheStateWriteRow;
        Update: Partial<MarketCacheStateWriteRow>;
        Relationships: Relationships;
      };
      market_sync_runs: {
        Row: MarketSyncRunRow;
        Insert: Omit<MarketSyncRunRow, "id" | "created_at">;
        Update: Partial<Omit<MarketSyncRunRow, "id" | "created_at">>;
        Relationships: Relationships;
      };
    };
    Views: Record<never, never>;
    Functions: {
      read_market_listings: {
        Args: { p_provider: string };
        Returns: MarketListingRow[];
      };
      read_market_listing: {
        Args: { p_provider: string; p_external_id: string };
        Returns: MarketListingRow[];
      };
      upsert_market_cache: {
        Args: {
          p_listings: readonly MarketListingWriteRow[];
          p_cache_key: string;
          p_source: string;
          p_fetched_at: string;
          p_expires_at: string;
          p_fallback: boolean;
        };
        Returns: number;
      };
      try_start_market_sync: {
        Args: {
          p_provider: string;
          p_started_at: string;
          p_stale_before: string;
        };
        Returns: string | null;
      };
    };
  };
};

export function toMarketSyncRunUpdate(input: CompleteMarketSyncInput) {
  return {
    completed_at: input.completedAt,
    status: input.status,
    listings_received: input.listingsReceived,
    listings_written: input.listingsWritten,
    error_code: input.errorCode,
  } satisfies Partial<MarketSyncRunRow>;
}
