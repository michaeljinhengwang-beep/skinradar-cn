import type {
  ExternalMarketListing,
  MarketDataProvider,
  MarketListingsQuery,
} from "../../types/data-provider.ts";
import type { CSFloatListingResponse } from "../../types/csfloat.ts";
import { parseCSFloatMarketHashName } from "./csfloat-market-name.ts";
import { parseCSFloatListingsResponse } from "./csfloat-response.ts";
import { MarketProviderError } from "./errors.ts";
import { normalizeExternalMarketListings } from "./normalizers/market.ts";

export const CSFLOAT_LISTINGS_ENDPOINT =
  "https://csfloat.com/api/v1/listings";
export const DEFAULT_CSFLOAT_LISTINGS_LIMIT = 10;
export const MAX_CSFLOAT_LISTINGS_LIMIT = 50;
const DEFAULT_TIMEOUT_MS = 8_000;

export type CSFloatFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

type CsfloatMarketProviderConfig = {
  readonly apiKey?: string;
  readonly fetchImplementation?: CSFloatFetch;
  readonly timeoutMs?: number;
};

function normalizeLimit(limit?: number) {
  if (limit === undefined) {
    return DEFAULT_CSFLOAT_LISTINGS_LIMIT;
  }

  if (!Number.isFinite(limit)) {
    return DEFAULT_CSFLOAT_LISTINGS_LIMIT;
  }

  return Math.min(
    MAX_CSFLOAT_LISTINGS_LIMIT,
    Math.max(1, Math.floor(limit)),
  );
}

export function buildCSFloatListingsUrl(options: MarketListingsQuery = {}) {
  const url = new URL(CSFLOAT_LISTINGS_ENDPOINT);
  url.searchParams.set("limit", String(normalizeLimit(options.limit)));

  const marketHashName = options.marketHashName?.trim();
  if (marketHashName) {
    url.searchParams.set("market_hash_name", marketHashName);
  }

  if (options.sortBy) {
    url.searchParams.set("sort_by", options.sortBy);
  }

  return url;
}

function mapStatusError(status: number): MarketProviderError {
  if (status === 401 || status === 403) {
    return new MarketProviderError(
      "AUTH_REQUIRED",
      "csfloat",
      "CSFloat rejected the request credentials or access context.",
    );
  }

  if (status === 429) {
    return new MarketProviderError(
      "RATE_LIMITED",
      "csfloat",
      "CSFloat rate limited the read-only listings request.",
    );
  }

  if (status >= 500) {
    return new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "csfloat",
      "CSFloat listings service is currently unavailable.",
    );
  }

  return new MarketProviderError(
    "INVALID_RESPONSE",
    "csfloat",
    "CSFloat rejected the read-only listings request.",
  );
}

function toExternalListing(
  listing: CSFloatListingResponse,
): ExternalMarketListing {
  const parsedName = parseCSFloatMarketHashName(
    listing.item.market_hash_name,
    listing.item.item_name,
    listing.item.wear_name,
  );

  return {
    externalId: listing.id,
    marketHashName: listing.item.market_hash_name,
    weapon: parsedName.weapon,
    skinName: parsedName.skinName,
    exterior: parsedName.exterior,
    price: listing.price / 100,
    currency: "UNSPECIFIED",
    floatValue: listing.item.float_value,
    listingUrl: null,
    provider: "csfloat",
    observedAt: listing.created_at,
  };
}

export function createCsfloatMarketProvider({
  apiKey,
  fetchImplementation = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: CsfloatMarketProviderConfig): MarketDataProvider {
  const normalizedApiKey = apiKey?.trim();

  return {
    name: "csfloat",
    async getListings(options = {}) {
      const controller = new AbortController();
      const abortFromCaller = () => controller.abort(options.signal?.reason);
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      options.signal?.addEventListener("abort", abortFromCaller, { once: true });
      if (options.signal?.aborted) {
        abortFromCaller();
      }

      try {
        const headers = new Headers({ Accept: "application/json" });
        if (normalizedApiKey) {
          headers.set("Authorization", normalizedApiKey);
        }

        let response: Response;
        try {
          response = await fetchImplementation(buildCSFloatListingsUrl(options), {
            method: "GET",
            headers,
            signal: controller.signal,
          });
        } catch {
          throw new MarketProviderError(
            "PROVIDER_UNAVAILABLE",
            "csfloat",
            "CSFloat read-only listings request failed or was aborted.",
          );
        }

        if (!response.ok) {
          throw mapStatusError(response.status);
        }

        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new MarketProviderError(
            "INVALID_RESPONSE",
            "csfloat",
            "CSFloat listings response was not valid JSON.",
          );
        }

        const listings = parseCSFloatListingsResponse(payload).map(
          toExternalListing,
        );
        return normalizeExternalMarketListings(listings);
      } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener("abort", abortFromCaller);
      }
    },
    async getSkinByExternalId(externalId) {
      void externalId;
      return undefined;
    },
    async healthCheck() {
      return { provider: "csfloat", available: true };
    },
  };
}
