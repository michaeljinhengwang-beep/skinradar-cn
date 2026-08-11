import type {
  ExternalMarketListing,
  MarketDataProvider,
  MarketDataProviderName,
  MarketListingsQuery,
} from "../../types/data-provider.ts";
import type { MarketProviderErrorCode } from "./errors.ts";
import { MarketProviderError } from "./errors.ts";
import { mockMarketDataProvider } from "./mock-market-provider.ts";

export type MarketListingsSource = MarketDataProviderName | "none";

export type MarketListingsFailure = {
  readonly provider: MarketDataProviderName;
  readonly code: MarketProviderErrorCode;
};

export type MarketListingsResult = {
  readonly data: readonly ExternalMarketListing[];
  readonly source: MarketListingsSource;
  readonly stale: boolean;
  readonly fallback: boolean;
  readonly error?: MarketListingsFailure;
};

type SafeMarketListingsOptions = {
  readonly provider: MarketDataProvider;
  readonly query?: MarketListingsQuery;
  readonly fallbackProvider?: MarketDataProvider;
};

const FALLBACK_ERROR_CODES = new Set<MarketProviderErrorCode>([
  "AUTH_REQUIRED",
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
]);

function toFailure(
  error: unknown,
  provider: MarketDataProviderName,
): MarketListingsFailure {
  if (error instanceof MarketProviderError) {
    return { provider: error.provider, code: error.code };
  }

  return { provider, code: "PROVIDER_UNAVAILABLE" };
}

export async function getMarketListingsSafely({
  provider,
  query,
  fallbackProvider = mockMarketDataProvider,
}: SafeMarketListingsOptions): Promise<MarketListingsResult> {
  try {
    const data = await provider.getListings(query);
    return {
      data,
      source: provider.name,
      stale: false,
      fallback: false,
    };
  } catch (error) {
    const failure = toFailure(error, provider.name);

    if (
      provider.name !== "mock" &&
      FALLBACK_ERROR_CODES.has(failure.code)
    ) {
      try {
        const data = await fallbackProvider.getListings(query);
        return {
          data,
          source: fallbackProvider.name,
          stale: false,
          fallback: true,
          error: failure,
        };
      } catch {
        return {
          data: [],
          source: "none",
          stale: false,
          fallback: false,
          error: failure,
        };
      }
    }

    return {
      data: [],
      source: "none",
      stale: false,
      fallback: false,
      error: failure,
    };
  }
}
