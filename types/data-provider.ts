export const MARKET_DATA_PROVIDER_NAMES = ["mock", "csfloat"] as const;

export type MarketDataProviderName =
  (typeof MARKET_DATA_PROVIDER_NAMES)[number];

export const MARKET_LISTING_SORT_OPTIONS = [
  "lowest_price",
  "highest_price",
  "most_recent",
  "expires_soon",
  "lowest_float",
  "highest_float",
  "best_deal",
  "highest_discount",
  "float_rank",
  "num_bids",
] as const;

export type MarketListingSortOption =
  (typeof MARKET_LISTING_SORT_OPTIONS)[number];

export type ProviderCurrencyCode = "CAD" | "USD" | "UNSPECIFIED";

export type MarketListingsQuery = {
  readonly limit?: number;
  readonly marketHashName?: string;
  readonly sortBy?: MarketListingSortOption;
  readonly signal?: AbortSignal;
};

export type ExternalMarketListing = {
  readonly externalId: string;
  readonly marketHashName: string;
  readonly weapon: string | null;
  readonly skinName: string | null;
  readonly exterior: string | null;
  readonly price: number;
  readonly currency: ProviderCurrencyCode;
  readonly floatValue: number | null;
  readonly listingUrl: string | null;
  readonly provider: MarketDataProviderName;
  readonly observedAt: string;
};

export type NormalizedMarketListing = {
  readonly externalId: string;
  readonly marketHashName: string;
  readonly weapon: string | null;
  readonly skinName: string | null;
  readonly exterior: string | null;
  readonly price: number;
  readonly currency: ProviderCurrencyCode;
  readonly floatValue: number | null;
  readonly listingUrl: string | null;
  readonly provider: MarketDataProviderName;
  readonly observedAt: string;
};

export type MarketDataProviderHealth = {
  readonly provider: MarketDataProviderName;
  readonly available: boolean;
};

export interface MarketDataProvider {
  readonly name: MarketDataProviderName;
  getListings(
    options?: MarketListingsQuery,
  ): Promise<readonly ExternalMarketListing[]>;
  getSkinByExternalId(
    externalId: string,
  ): Promise<ExternalMarketListing | undefined>;
  healthCheck(): Promise<MarketDataProviderHealth>;
}
