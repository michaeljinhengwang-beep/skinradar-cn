import type { NormalizedMarketListing } from "../../types/data-provider.ts";
import type {
  MarketCacheEnvelope,
  MarketCacheMetadata,
  MarketRepository,
  ReplaceMarketListingsInput,
} from "../../types/market-repository.ts";
import {
  getMarketCacheExpiresAt,
  getMarketCacheTtlSeconds,
  isMarketCacheFresh,
  resolveMarketCacheTtlSeconds,
} from "../cache/market-cache.ts";

type MemoryMarketRepositoryOptions = {
  readonly initialCache?: ReplaceMarketListingsInput;
  readonly ttlSeconds?: number;
  readonly now?: () => Date;
};

function copyListing(
  listing: NormalizedMarketListing,
): NormalizedMarketListing {
  return {
    externalId: listing.externalId,
    marketHashName: listing.marketHashName,
    weapon: listing.weapon,
    skinName: listing.skinName,
    exterior: listing.exterior,
    price: listing.price,
    currency: listing.currency,
    floatValue: listing.floatValue,
    listingUrl: listing.listingUrl,
    provider: listing.provider,
    observedAt: listing.observedAt,
  };
}

function copyEnvelope(envelope: MarketCacheEnvelope): MarketCacheEnvelope {
  return {
    data: envelope.data.map(copyListing),
    source: envelope.source,
    fetchedAt: envelope.fetchedAt,
    expiresAt: envelope.expiresAt,
    stale: envelope.stale,
    fallback: envelope.fallback,
  };
}

function copyMetadata(envelope: MarketCacheEnvelope): MarketCacheMetadata {
  return {
    source: envelope.source,
    fetchedAt: envelope.fetchedAt,
    expiresAt: envelope.expiresAt,
    stale: envelope.stale,
    fallback: envelope.fallback,
  };
}

export function createMemoryMarketRepository({
  initialCache,
  ttlSeconds = getMarketCacheTtlSeconds(),
  now = () => new Date(),
}: MemoryMarketRepositoryOptions = {}): MarketRepository {
  const cacheTtlSeconds = resolveMarketCacheTtlSeconds(ttlSeconds);
  let cache: MarketCacheEnvelope | null = initialCache
    ? {
        data: initialCache.data.map(copyListing),
        source: initialCache.source,
        fetchedAt: initialCache.fetchedAt,
        expiresAt: getMarketCacheExpiresAt(
          initialCache.fetchedAt,
          cacheTtlSeconds,
        ),
        stale: !isMarketCacheFresh(
          initialCache.fetchedAt,
          cacheTtlSeconds,
          now(),
        ),
        fallback: initialCache.fallback,
      }
    : null;

  function getCurrentEnvelope(): MarketCacheEnvelope | null {
    if (!cache) {
      return null;
    }

    cache = {
      ...cache,
      stale: !isMarketCacheFresh(cache.fetchedAt, cacheTtlSeconds, now()),
    };
    return copyEnvelope(cache);
  }

  return {
    async getListings() {
      return getCurrentEnvelope();
    },
    async getListingById(id) {
      const envelope = getCurrentEnvelope();
      const listing = envelope?.data.find(
        ({ externalId }) => externalId === id,
      );
      return listing ? copyListing(listing) : undefined;
    },
    async replaceListings(input) {
      cache = {
        data: input.data.map(copyListing),
        source: input.source,
        fetchedAt: input.fetchedAt,
        expiresAt: getMarketCacheExpiresAt(
          input.fetchedAt,
          cacheTtlSeconds,
        ),
        stale: !isMarketCacheFresh(
          input.fetchedAt,
          cacheTtlSeconds,
          now(),
        ),
        fallback: input.fallback,
      };
      return copyEnvelope(cache);
    },
    async getMetadata() {
      const envelope = getCurrentEnvelope();
      return envelope ? copyMetadata(envelope) : null;
    },
  };
}
