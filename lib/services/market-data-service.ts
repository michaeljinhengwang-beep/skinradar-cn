import type {
  MarketDataProvider,
  MarketListingsQuery,
} from "../../types/data-provider.ts";
import type {
  MarketCacheEnvelope,
  MarketDataResult,
  MarketRepository,
} from "../../types/market-repository.ts";
import type { MarketProviderErrorCode } from "../providers/errors.ts";
import { MarketProviderError } from "../providers/errors.ts";
import { mockMarketDataProvider } from "../providers/mock-market-provider.ts";
import { normalizeExternalMarketListings } from "../providers/normalizers/market.ts";

type MarketDataServiceOptions = {
  readonly repository: MarketRepository;
  readonly provider: MarketDataProvider;
  readonly fallbackProvider?: MarketDataProvider;
  readonly now?: () => Date;
};

const FALLBACK_ERROR_CODES = new Set<MarketProviderErrorCode>([
  "AUTH_REQUIRED",
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
]);

function resultFromCache(
  cache: MarketCacheEnvelope,
  errorCode?: MarketProviderErrorCode,
): MarketDataResult {
  return {
    data: cache.data,
    source: cache.source,
    fetchedAt: cache.fetchedAt,
    expiresAt: cache.expiresAt,
    stale: cache.stale,
    fallback: cache.fallback,
    ...(errorCode ? { errorCode } : {}),
  };
}

function getErrorCode(error: unknown): MarketProviderErrorCode {
  return error instanceof MarketProviderError
    ? error.code
    : "PROVIDER_UNAVAILABLE";
}

export function createMarketDataService({
  repository,
  provider,
  fallbackProvider = mockMarketDataProvider,
  now = () => new Date(),
}: MarketDataServiceOptions) {
  async function refreshFromProvider(
    selectedProvider: MarketDataProvider,
    query?: MarketListingsQuery,
    fallback = false,
  ) {
    const externalListings = await selectedProvider.getListings(query);
    const data = normalizeExternalMarketListings(externalListings);
    return repository.replaceListings({
      data,
      source: selectedProvider.name,
      fetchedAt: now().toISOString(),
      fallback,
    });
  }

  return {
    async getListings(query?: MarketListingsQuery): Promise<MarketDataResult> {
      const cached = await repository.getListings();

      if (cached && !cached.stale) {
        return resultFromCache(cached);
      }

      try {
        const refreshed = await refreshFromProvider(provider, query);
        return resultFromCache(refreshed);
      } catch (error) {
        const errorCode = getErrorCode(error);

        if (cached) {
          return resultFromCache({ ...cached, stale: true }, errorCode);
        }

        if (
          provider.name !== "mock" &&
          FALLBACK_ERROR_CODES.has(errorCode)
        ) {
          try {
            const fallbackCache = await refreshFromProvider(
              fallbackProvider,
              query,
              true,
            );
            return resultFromCache(fallbackCache, errorCode);
          } catch {
            return {
              data: [],
              source: "none",
              fetchedAt: null,
              expiresAt: null,
              stale: false,
              fallback: false,
              errorCode,
            };
          }
        }

        return {
          data: [],
          source: "none",
          fetchedAt: null,
          expiresAt: null,
          stale: false,
          fallback: false,
          errorCode,
        };
      }
    },
  };
}
