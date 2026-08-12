import type {
  ExternalMarketListing,
  MarketDataProvider,
  MarketListingsQuery,
} from "../../types/data-provider.ts";
import type {
  CSFloatListingResponse,
  CSFloatListingsPageResponse,
} from "../../types/csfloat.ts";
import { parseCSFloatMarketHashName } from "./csfloat-market-name.ts";
import { parseCSFloatListingsPageResponse } from "./csfloat-response.ts";
import { MarketProviderError } from "./errors.ts";
import { normalizeExternalMarketListings } from "./normalizers/market.ts";

export const CSFLOAT_LISTINGS_ENDPOINT =
  "https://csfloat.com/api/v1/listings";
export const DEFAULT_CSFLOAT_LISTINGS_LIMIT = 10;
export const MAX_CSFLOAT_LISTINGS_LIMIT = 50;
export const MAX_SYNC_LISTINGS = 500;
export const MAX_CSFLOAT_PAGES = 10;
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

function normalizePageLimit(limit?: number) {
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

function normalizeTargetListings(options: MarketListingsQuery) {
  const targetListings = options.targetListings ?? options.limit;
  if (targetListings === undefined || !Number.isFinite(targetListings)) {
    return DEFAULT_CSFLOAT_LISTINGS_LIMIT;
  }

  return Math.min(MAX_SYNC_LISTINGS, Math.max(1, Math.floor(targetListings)));
}

export function buildCSFloatListingsUrl(options: MarketListingsQuery = {}) {
  const url = new URL(CSFLOAT_LISTINGS_ENDPOINT);
  url.searchParams.set("limit", String(normalizePageLimit(options.limit)));

  const cursor = options.cursor?.trim();
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  const marketHashName = options.marketHashName?.trim();
  if (marketHashName) {
    url.searchParams.set("market_hash_name", marketHashName);
  }

  if (options.sortBy) {
    url.searchParams.set("sort_by", options.sortBy);
  }

  return url;
}

function mapStatusError(
  status: number,
  receivedListings: number,
): MarketProviderError {
  if (status === 401 || status === 403) {
    return new MarketProviderError(
      "AUTH_REQUIRED",
      "csfloat",
      "CSFloat rejected the request credentials or access context.",
      receivedListings,
    );
  }

  if (status === 429) {
    return new MarketProviderError(
      "RATE_LIMITED",
      "csfloat",
      "CSFloat rate limited the read-only listings request.",
      receivedListings,
    );
  }

  if (status >= 500) {
    return new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "csfloat",
      "CSFloat listings service is currently unavailable.",
      receivedListings,
    );
  }

  return new MarketProviderError(
    "INVALID_RESPONSE",
    "csfloat",
    "CSFloat rejected the read-only listings request.",
    receivedListings,
  );
}

function preservePartialCount(error: unknown, receivedListings: number) {
  if (error instanceof MarketProviderError) {
    return new MarketProviderError(
      error.code,
      error.provider,
      error.message,
      Math.max(error.receivedListings, receivedListings),
    );
  }

  return error;
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
      let timeout: ReturnType<typeof setTimeout> | undefined;
      options.signal?.addEventListener("abort", abortFromCaller, { once: true });
      if (options.signal?.aborted) {
        abortFromCaller();
      }

      try {
        const headers = new Headers({ Accept: "application/json" });
        if (normalizedApiKey) {
          headers.set("Authorization", normalizedApiKey);
        }

        const targetListings = normalizeTargetListings(options);
        const listingsByExternalId = new Map<string, ExternalMarketListing>();
        const seenCursors = new Set<string>();
        let cursor: string | undefined;
        let pageCount = 0;

        while (listingsByExternalId.size < targetListings) {
          if (pageCount >= MAX_CSFLOAT_PAGES) {
            throw new MarketProviderError(
              "INVALID_RESPONSE",
              "csfloat",
              "CSFloat pagination exceeded the configured page limit.",
              listingsByExternalId.size,
            );
          }

          const pageLimit = Math.min(
            MAX_CSFLOAT_LISTINGS_LIMIT,
            targetListings - listingsByExternalId.size,
          );
          timeout = setTimeout(() => controller.abort(), timeoutMs);
          let response: Response;
          try {
            response = await fetchImplementation(
              buildCSFloatListingsUrl({
                ...options,
                cursor,
                limit: pageLimit,
              }),
              {
                method: "GET",
                headers,
                signal: controller.signal,
              },
            );
          } catch {
            throw new MarketProviderError(
              "PROVIDER_UNAVAILABLE",
              "csfloat",
              "CSFloat read-only listings request failed or was aborted.",
              listingsByExternalId.size,
            );
          }
          pageCount += 1;

          if (!response.ok) {
            clearTimeout(timeout);
            timeout = undefined;
            throw mapStatusError(response.status, listingsByExternalId.size);
          }

          let payload: unknown;
          try {
            payload = await response.json();
          } catch {
            throw new MarketProviderError(
              "INVALID_RESPONSE",
              "csfloat",
              "CSFloat listings response was not valid JSON.",
              listingsByExternalId.size,
            );
          }
          clearTimeout(timeout);
          timeout = undefined;

          let page: CSFloatListingsPageResponse;
          try {
            page = parseCSFloatListingsPageResponse(payload);
          } catch (error) {
            throw preservePartialCount(error, listingsByExternalId.size);
          }

          if (page.cursor !== null && seenCursors.has(page.cursor)) {
            throw new MarketProviderError(
              "INVALID_RESPONSE",
              "csfloat",
              "CSFloat pagination returned a duplicate cursor.",
              listingsByExternalId.size,
            );
          }

          for (const listing of page.data) {
            if (listingsByExternalId.size >= targetListings) {
              break;
            }

            if (!listingsByExternalId.has(listing.id)) {
              listingsByExternalId.set(listing.id, toExternalListing(listing));
            }
          }

          if (
            listingsByExternalId.size >= targetListings ||
            page.cursor === null ||
            page.data.length === 0
          ) {
            break;
          }

          seenCursors.add(page.cursor);
          cursor = page.cursor;
        }

        return normalizeExternalMarketListings([
          ...listingsByExternalId.values(),
        ]);
      } finally {
        if (timeout !== undefined) {
          clearTimeout(timeout);
        }
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
