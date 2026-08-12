import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mockSkins } from "../data/mock-skins.ts";
import {
  DEFAULT_MARKET_CACHE_TTL_SECONDS,
  getMarketCacheExpiresAt,
  getMarketCacheTtlSeconds,
  isMarketCacheFresh,
  resolveMarketCacheTtlSeconds,
} from "../lib/cache/market-cache.ts";
import { MarketProviderError } from "../lib/providers/errors.ts";
import { mockMarketDataProvider } from "../lib/providers/mock-market-provider.ts";
import { normalizeExternalMarketListings } from "../lib/providers/normalizers/market.ts";
import { createMemoryMarketRepository } from "../lib/repositories/memory-market-repository.ts";
import { createMarketDataService } from "../lib/services/market-data-service.ts";
import type {
  MarketDataProvider,
  MarketDataProviderName,
  NormalizedMarketListing,
} from "../types/data-provider.ts";
import type { MarketProviderErrorCode } from "../lib/providers/errors.ts";

const FETCHED_AT = "2026-08-11T08:00:00.000Z";
const FRESH_TIME = new Date("2026-08-11T08:04:59.999Z");
const EXPIRES_AT = "2026-08-11T08:05:00.000Z";
const STALE_TIME = new Date("2026-08-11T08:05:00.000Z");

const normalizedListing: NormalizedMarketListing = {
  externalId: "internal-listing-001",
  marketHashName: "M4A4 | Test Skin (Factory New)",
  weapon: "M4A4",
  skinName: "Test Skin",
  exterior: "Factory New",
  price: 125,
  currency: "UNSPECIFIED",
  floatValue: 0.02,
  listingUrl: null,
  provider: "csfloat",
  observedAt: FETCHED_AT,
};

function createProvider(
  name: MarketDataProviderName,
  getListings: MarketDataProvider["getListings"],
): MarketDataProvider {
  return {
    name,
    getListings,
    async getSkinByExternalId() {
      return undefined;
    },
    async healthCheck() {
      return { provider: name, available: true };
    },
  };
}

function createFailingProvider(
  code: MarketProviderErrorCode,
  message = "provider failed",
) {
  return createProvider("csfloat", async () => {
    throw new MarketProviderError(code, "csfloat", message);
  });
}

function createSeededRepository(
  currentTime: Date,
  listing: NormalizedMarketListing = normalizedListing,
) {
  return createMemoryMarketRepository({
    ttlSeconds: 300,
    now: () => currentTime,
    initialCache: {
      data: [listing],
      source: listing.provider,
      fetchedAt: FETCHED_AT,
      fallback: false,
    },
  });
}

test("Memory Repository starts empty without initial cache", async () => {
  const repository = createMemoryMarketRepository({ now: () => FRESH_TIME });

  assert.equal(await repository.getListings(), null);
  assert.equal(await repository.getMetadata(), null);
});

test("Memory Repository initializes a complete cache envelope", async () => {
  const cache = await createSeededRepository(FRESH_TIME).getListings();

  assert.equal(cache?.data.length, 1);
  assert.equal(cache?.source, "csfloat");
  assert.equal(cache?.expiresAt, EXPIRES_AT);
  assert.equal(cache?.stale, false);
});

test("getListings does not expose the internal array or listing objects", async () => {
  const repository = createSeededRepository(FRESH_TIME);
  const first = await repository.getListings();
  const second = await repository.getListings();

  assert.notStrictEqual(first?.data, second?.data);
  assert.notStrictEqual(first?.data[0], second?.data[0]);
});

test("replaceListings does not mutate its input", async () => {
  const repository = createMemoryMarketRepository({ now: () => FRESH_TIME });
  const input = {
    data: [normalizedListing],
    source: "csfloat",
    fetchedAt: FETCHED_AT,
    fallback: false,
  } as const;
  const snapshot = JSON.stringify(input);

  await repository.replaceListings(input);

  assert.equal(JSON.stringify(input), snapshot);
});

test("replaceListings makes the replacement readable", async () => {
  const repository = createMemoryMarketRepository({ now: () => FRESH_TIME });

  await repository.replaceListings({
    data: [normalizedListing],
    source: "csfloat",
    fetchedAt: FETCHED_AT,
    fallback: false,
  });

  assert.equal((await repository.getListings())?.data[0].externalId, normalizedListing.externalId);
});

test("getListingById reads an internal normalized listing", async () => {
  const listing = await createSeededRepository(FRESH_TIME).getListingById(
    normalizedListing.externalId,
  );

  assert.deepEqual(listing, normalizedListing);
});

test("getListingById returns undefined for an unknown id", async () => {
  const listing = await createSeededRepository(FRESH_TIME).getListingById(
    "missing-listing",
  );

  assert.equal(listing, undefined);
});

test("Repository metadata contains the provider source", async () => {
  const metadata = await createSeededRepository(FRESH_TIME).getMetadata();

  assert.equal(metadata?.source, "csfloat");
});

test("Repository metadata contains fetchedAt", async () => {
  const metadata = await createSeededRepository(FRESH_TIME).getMetadata();

  assert.equal(metadata?.fetchedAt, FETCHED_AT);
});

test("Repository metadata contains the calculated expiry", async () => {
  const metadata = await createSeededRepository(FRESH_TIME).getMetadata();

  assert.equal(metadata?.expiresAt, EXPIRES_AT);
});

test("market cache TTL defaults to 300 seconds", () => {
  assert.equal(DEFAULT_MARKET_CACHE_TTL_SECONDS, 300);
  assert.equal(getMarketCacheTtlSeconds({}), 300);
});

test("missing TTL safely uses the default", () => {
  assert.equal(resolveMarketCacheTtlSeconds(undefined), 300);
  assert.equal(resolveMarketCacheTtlSeconds(""), 300);
});

test("invalid TTL values safely use the default", () => {
  assert.equal(resolveMarketCacheTtlSeconds("not-a-number"), 300);
  assert.equal(resolveMarketCacheTtlSeconds("0"), 300);
  assert.equal(resolveMarketCacheTtlSeconds("-10"), 300);
  assert.equal(resolveMarketCacheTtlSeconds("2.5"), 300);
});

test("valid server TTL configuration is accepted", () => {
  assert.equal(
    getMarketCacheTtlSeconds({ MARKET_CACHE_TTL_SECONDS: "600" }),
    600,
  );
});

test("cache is fresh immediately before its TTL boundary", () => {
  assert.equal(isMarketCacheFresh(FETCHED_AT, 300, FRESH_TIME), true);
});

test("cache is stale exactly at its TTL boundary", () => {
  assert.equal(isMarketCacheFresh(FETCHED_AT, 300, STALE_TIME), false);
});

test("cache remains stale after its TTL boundary", () => {
  const afterExpiry = new Date("2026-08-11T08:05:01.000Z");

  assert.equal(isMarketCacheFresh(FETCHED_AT, 300, afterExpiry), false);
});

test("invalid freshness timestamps are safely stale", () => {
  assert.equal(isMarketCacheFresh("invalid", 300, FRESH_TIME), false);
  assert.equal(isMarketCacheFresh(FETCHED_AT, 300, new Date("invalid")), false);
});

test("cache expiry calculation is deterministic", () => {
  assert.equal(getMarketCacheExpiresAt(FETCHED_AT, 300), EXPIRES_AT);
});

test("Repository current time can be injected and advanced", async () => {
  let currentTime = FRESH_TIME;
  const repository = createMemoryMarketRepository({
    ttlSeconds: 300,
    now: () => currentTime,
    initialCache: {
      data: [normalizedListing],
      source: "csfloat",
      fetchedAt: FETCHED_AT,
      fallback: false,
    },
  });

  assert.equal((await repository.getListings())?.stale, false);
  currentTime = STALE_TIME;
  assert.equal((await repository.getListings())?.stale, true);
});

test("fresh cache prevents Provider calls", async () => {
  let providerCalls = 0;
  const provider = createProvider("csfloat", async () => {
    providerCalls += 1;
    return [];
  });
  const service = createMarketDataService({
    repository: createSeededRepository(FRESH_TIME),
    provider,
    now: () => FRESH_TIME,
  });

  const result = await service.getListings();

  assert.equal(providerCalls, 0);
  assert.equal(result.stale, false);
});

test("stale cache triggers a Provider call", async () => {
  let providerCalls = 0;
  const provider = createProvider("csfloat", async () => {
    providerCalls += 1;
    return [{ ...normalizedListing, price: 130 }];
  });
  const service = createMarketDataService({
    repository: createSeededRepository(STALE_TIME),
    provider,
    now: () => STALE_TIME,
  });

  await service.getListings();

  assert.equal(providerCalls, 1);
});

test("successful Provider refresh replaces Repository data", async () => {
  const repository = createSeededRepository(STALE_TIME);
  const provider = createProvider("csfloat", async () => [
    { ...normalizedListing, externalId: "refreshed", price: 130 },
  ]);
  const service = createMarketDataService({
    repository,
    provider,
    now: () => STALE_TIME,
  });

  await service.getListings();

  assert.equal((await repository.getListings())?.data[0].externalId, "refreshed");
});

test("successful refresh keeps Provider source traceable", async () => {
  const provider = createProvider("csfloat", async () => [normalizedListing]);
  const service = createMarketDataService({
    repository: createMemoryMarketRepository({ now: () => FRESH_TIME }),
    provider,
    now: () => FRESH_TIME,
  });

  const result = await service.getListings();

  assert.equal(result.source, "csfloat");
  assert.equal(result.fallback, false);
});

for (const errorCode of [
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
  "AUTH_REQUIRED",
] as const) {
  test(`${errorCode} with stale cache returns the stale cache`, async () => {
    const service = createMarketDataService({
      repository: createSeededRepository(STALE_TIME),
      provider: createFailingProvider(errorCode),
      now: () => STALE_TIME,
    });

    const result = await service.getListings();

    assert.equal(result.source, "csfloat");
    assert.equal(result.stale, true);
    assert.equal(result.errorCode, errorCode);
  });
}

test("timeout-style failure with stale cache returns stale data", async () => {
  const service = createMarketDataService({
    repository: createSeededRepository(STALE_TIME),
    provider: createFailingProvider(
      "PROVIDER_UNAVAILABLE",
      "request aborted",
    ),
    now: () => STALE_TIME,
  });

  const result = await service.getListings();

  assert.equal(result.stale, true);
  assert.equal(result.source, "csfloat");
});

test("Provider failure without cache uses explicit mock fallback", async () => {
  const service = createMarketDataService({
    repository: createMemoryMarketRepository({ now: () => FRESH_TIME }),
    provider: createFailingProvider("RATE_LIMITED"),
    now: () => FRESH_TIME,
  });

  const result = await service.getListings();

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, true);
  assert.equal(result.data.length, mockSkins.length);
});

test("mock fallback listings retain mock as their item Provider", async () => {
  const service = createMarketDataService({
    repository: createMemoryMarketRepository({ now: () => FRESH_TIME }),
    provider: createFailingProvider("PROVIDER_UNAVAILABLE"),
    now: () => FRESH_TIME,
  });

  const result = await service.getListings();

  assert.ok(result.data.every(({ provider }) => provider === "mock"));
  assert.equal(result.source, "mock");
});

test("stale CSFloat cache is never relabeled as mock", async () => {
  const service = createMarketDataService({
    repository: createSeededRepository(STALE_TIME),
    provider: createFailingProvider("RATE_LIMITED"),
    now: () => STALE_TIME,
  });

  const result = await service.getListings();

  assert.equal(result.source, "csfloat");
  assert.equal(result.fallback, false);
});

test("INVALID_RESPONSE does not overwrite valid stale cache", async () => {
  const repository = createSeededRepository(STALE_TIME);
  const before = await repository.getListings();
  const service = createMarketDataService({
    repository,
    provider: createFailingProvider("INVALID_RESPONSE"),
    now: () => STALE_TIME,
  });

  const result = await service.getListings();
  const after = await repository.getListings();

  assert.deepEqual(after?.data, before?.data);
  assert.equal(result.errorCode, "INVALID_RESPONSE");
});

test("INVALID_RESPONSE without cache cannot masquerade as success", async () => {
  const service = createMarketDataService({
    repository: createMemoryMarketRepository({ now: () => FRESH_TIME }),
    provider: createFailingProvider("INVALID_RESPONSE"),
    now: () => FRESH_TIME,
  });

  const result = await service.getListings();

  assert.deepEqual(result.data, []);
  assert.equal(result.source, "none");
  assert.equal(result.fallback, false);
});

test("secret-bearing Provider messages never enter service results", async () => {
  const secret = "repository-secret-test-value";
  const service = createMarketDataService({
    repository: createMemoryMarketRepository({ now: () => FRESH_TIME }),
    provider: createFailingProvider(
      "PROVIDER_UNAVAILABLE",
      `failed with ${secret}`,
    ),
    now: () => FRESH_TIME,
  });

  const result = await service.getListings();

  assert.ok(!JSON.stringify(result).includes(secret));
});

test("Repository strips unrecognized third-party raw fields", async () => {
  const listingWithRawFields: NormalizedMarketListing & {
    seller: { steam_id: string };
  } = {
    ...normalizedListing,
    seller: { steam_id: "anonymous-test-id" },
  };
  const repository = createSeededRepository(FRESH_TIME, listingWithRawFields);
  const cached = await repository.getListings();

  assert.equal("seller" in (cached?.data[0] ?? {}), false);
});

test("Repository initialization from existing mock adapter does not mutate mockSkins", async () => {
  const snapshot = JSON.stringify(mockSkins);
  const mockListings = normalizeExternalMarketListings(
    await mockMarketDataProvider.getListings(),
  );
  const repository = createMemoryMarketRepository({
    now: () => FRESH_TIME,
    initialCache: {
      data: mockListings,
      source: "mock",
      fetchedAt: FETCHED_AT,
      fallback: false,
    },
  });

  await repository.getListings();

  assert.equal(JSON.stringify(mockSkins), snapshot);
});

test("market list uses the read-only service while mock detail stays isolated", () => {
  const marketPage = readFileSync(
    new URL("../app/market/page.tsx", import.meta.url),
    "utf8",
  );
  const detailPage = readFileSync(
    new URL("../app/market/[id]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.ok(marketPage.includes("market-read-server"));
  assert.ok(detailPage.includes("mockSkins"));
  assert.ok(!marketPage.includes("market-data-service"));
  assert.ok(!detailPage.includes("market-data-service"));
});
