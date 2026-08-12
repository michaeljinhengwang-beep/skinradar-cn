import { getMarketDataFreshness } from "../config/market-data-freshness.ts";
import type {
  MarketDisplayListing,
  Skin,
} from "../../types/market.ts";

export const MARKET_PAGE_LISTINGS_LIMIT = 100;

export type MarketCurrencyStatus =
  | "confirmed"
  | "unconfirmed"
  | "mixed";

export type MarketDisplayCache = {
  readonly data: readonly MarketDisplayListing[];
  readonly source: "csfloat";
  readonly fallback: false;
  readonly fetchedAt: string;
};

export type MarketPageRealData = {
  readonly data: readonly MarketDisplayListing[];
  readonly source: "csfloat";
  readonly fallback: false;
  readonly stale: boolean;
  readonly fetchedAt: string;
  readonly currencyStatus: MarketCurrencyStatus;
};

export type MarketPageFallbackData = {
  readonly data: readonly Skin[];
  readonly source: "mock";
  readonly fallback: true;
  readonly stale: false;
  readonly fetchedAt: null;
  readonly currencyStatus: "confirmed";
};

export type MarketPageData =
  | MarketPageRealData
  | MarketPageFallbackData;

export class MarketReadDataAccessError extends Error {
  readonly code = "MARKET_READ_UNAVAILABLE" as const;

  constructor() {
    super("Market page data is unavailable.");
    this.name = "MarketReadDataAccessError";
  }
}

type ReadMarketPageDataOptions = {
  readonly readCache: () => Promise<MarketDisplayCache | null>;
  readonly mockData: readonly Skin[];
  readonly now?: Date;
  readonly staleAfterSeconds?: number;
};

function createFallback(
  mockData: readonly Skin[],
): MarketPageFallbackData {
  return {
    data: mockData,
    source: "mock",
    fallback: true,
    stale: false,
    fetchedAt: null,
    currencyStatus: "confirmed",
  };
}

function getCurrencyStatus(
  data: readonly MarketDisplayListing[],
): MarketCurrencyStatus {
  const unconfirmedCount = data.filter(
    ({ currency }) => currency === "UNSPECIFIED",
  ).length;

  if (unconfirmedCount === 0) {
    return "confirmed";
  }
  return unconfirmedCount === data.length ? "unconfirmed" : "mixed";
}

export async function readMarketPageData({
  readCache,
  mockData,
  now = new Date(),
  staleAfterSeconds,
}: ReadMarketPageDataOptions): Promise<MarketPageData> {
  try {
    const cache = await readCache();
    if (!cache || cache.data.length === 0) {
      return createFallback(mockData);
    }

    const data = cache.data.slice(0, MARKET_PAGE_LISTINGS_LIMIT);
    const freshness = getMarketDataFreshness(cache.fetchedAt, {
      now,
      ...(staleAfterSeconds === undefined ? {} : { staleAfterSeconds }),
    });

    if (freshness === "unknown") {
      throw new MarketReadDataAccessError();
    }

    return {
      data,
      source: "csfloat",
      fallback: false,
      stale: freshness === "stale",
      fetchedAt: cache.fetchedAt,
      currencyStatus: getCurrencyStatus(data),
    };
  } catch (error) {
    if (error instanceof MarketReadDataAccessError) {
      return createFallback(mockData);
    }
    throw error;
  }
}
