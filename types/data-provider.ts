export const MARKET_DATA_PROVIDER_NAMES = ["mock", "csfloat"] as const;

export type MarketDataProviderName =
  (typeof MARKET_DATA_PROVIDER_NAMES)[number];

export type ProviderCurrencyCode = "CAD" | "USD";

export type ExternalMarketListing = {
  readonly externalId: string;
  readonly marketHashName: string;
  readonly weapon: string;
  readonly skinName: string;
  readonly exterior: string;
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
  readonly weapon: string;
  readonly skinName: string;
  readonly exterior: string;
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
  getListings(): Promise<readonly ExternalMarketListing[]>;
  getSkinByExternalId(
    externalId: string,
  ): Promise<ExternalMarketListing | undefined>;
  healthCheck(): Promise<MarketDataProviderHealth>;
}
