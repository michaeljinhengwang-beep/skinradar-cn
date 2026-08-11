import type {
  MarketDataProviderName,
  NormalizedMarketListing,
} from "./data-provider.ts";
import type { MarketProviderErrorCode } from "../lib/providers/errors.ts";

export type MarketCacheMetadata = {
  readonly source: MarketDataProviderName;
  readonly fetchedAt: string;
  readonly expiresAt: string;
  readonly stale: boolean;
  readonly fallback: boolean;
};

export type MarketCacheEnvelope = MarketCacheMetadata & {
  readonly data: readonly NormalizedMarketListing[];
};

export type ReplaceMarketListingsInput = {
  readonly data: readonly NormalizedMarketListing[];
  readonly source: MarketDataProviderName;
  readonly fetchedAt: string;
  readonly fallback: boolean;
};

export interface MarketRepository {
  getListings(): Promise<MarketCacheEnvelope | null>;
  getListingById(id: string): Promise<NormalizedMarketListing | undefined>;
  replaceListings(
    input: ReplaceMarketListingsInput,
  ): Promise<MarketCacheEnvelope>;
  getMetadata(): Promise<MarketCacheMetadata | null>;
}

export type MarketDataResult = {
  readonly data: readonly NormalizedMarketListing[];
  readonly source: MarketDataProviderName | "none";
  readonly fetchedAt: string | null;
  readonly expiresAt: string | null;
  readonly stale: boolean;
  readonly fallback: boolean;
  readonly errorCode?: MarketProviderErrorCode;
};
