import type { MarketDataProviderName } from "../../types/data-provider.ts";

export const MARKET_PROVIDER_ERROR_CODES = [
  "PROVIDER_UNAVAILABLE",
  "AUTH_REQUIRED",
  "RATE_LIMITED",
  "INVALID_RESPONSE",
  "NORMALIZATION_ERROR",
] as const;

export type MarketProviderErrorCode =
  (typeof MARKET_PROVIDER_ERROR_CODES)[number];

export class MarketProviderError extends Error {
  readonly code: MarketProviderErrorCode;
  readonly provider: MarketDataProviderName;
  readonly receivedListings: number;

  constructor(
    code: MarketProviderErrorCode,
    provider: MarketDataProviderName,
    message: string,
    receivedListings = 0,
  ) {
    super(message);
    this.name = "MarketProviderError";
    this.code = code;
    this.provider = provider;
    this.receivedListings = receivedListings;
  }
}
