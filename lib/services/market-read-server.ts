import "server-only";

import { mockSkins } from "../../data/mock-skins.ts";
import type { NormalizedMarketListing } from "../../types/data-provider.ts";
import type { MarketDisplayListing } from "../../types/market.ts";
import { getMarketDataStaleAfterSeconds } from "../config/market-data-freshness.ts";
import { MarketProviderError } from "../providers/errors.ts";
import {
  createSupabaseMarketRepository,
  SupabaseMarketRepositoryMappingError,
} from "../repositories/supabase-market-repository.ts";
import {
  createSupabaseMarketDatabaseAdapter,
  SupabaseMarketDatabaseError,
} from "../supabase/database-adapter.ts";
import { createSupabaseServerClient } from "../supabase/server.ts";
import { SupabaseConfigurationError } from "../supabase/server-config.ts";
import {
  MARKET_PAGE_LISTINGS_LIMIT,
  MarketReadDataAccessError,
  readMarketPageData,
  type MarketDisplayCache,
} from "./market-read-service.ts";

const CSFLOAT_CACHE_KEY = "market:listings:csfloat";

function toDisplayListing(
  listing: NormalizedMarketListing,
): MarketDisplayListing {
  if (listing.provider !== "csfloat") {
    throw new MarketReadDataAccessError();
  }

  return {
    id: listing.externalId,
    externalId: listing.externalId,
    provider: "csfloat",
    marketHashName: listing.marketHashName,
    weapon: listing.weapon,
    skinName: listing.skinName,
    exterior: listing.exterior,
    price: listing.price,
    currency: listing.currency,
    floatValue: listing.floatValue,
    observedAt: listing.observedAt,
  };
}

function isKnownDataAccessError(error: unknown) {
  return (
    error instanceof SupabaseConfigurationError ||
    error instanceof SupabaseMarketDatabaseError ||
    error instanceof SupabaseMarketRepositoryMappingError ||
    error instanceof MarketReadDataAccessError ||
    (error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE")
  );
}

async function readCsfloatCache(): Promise<MarketDisplayCache | null> {
  try {
    const client = createSupabaseServerClient();
    const database = createSupabaseMarketDatabaseAdapter(client);
    const repository = createSupabaseMarketRepository({
      client: database,
      cacheKey: CSFLOAT_CACHE_KEY,
      maxListings: MARKET_PAGE_LISTINGS_LIMIT,
    });
    const cache = await repository.getListings();

    if (!cache || cache.source !== "csfloat" || cache.fallback) {
      return null;
    }

    return {
      data: cache.data.map(toDisplayListing),
      source: "csfloat",
      fallback: false,
      fetchedAt: cache.fetchedAt,
    };
  } catch (error) {
    if (isKnownDataAccessError(error)) {
      throw new MarketReadDataAccessError();
    }
    throw error;
  }
}

export function getMarketPageData() {
  return readMarketPageData({
    readCache: readCsfloatCache,
    mockData: mockSkins,
    staleAfterSeconds: getMarketDataStaleAfterSeconds(),
  });
}
