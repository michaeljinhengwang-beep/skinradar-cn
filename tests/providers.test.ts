import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mockSkins } from "../data/mock-skins.ts";
import { createCsfloatMarketProvider } from "../lib/providers/csfloat-market-provider.ts";
import { MarketProviderError } from "../lib/providers/errors.ts";
import {
  getMarketDataProvider,
  resolveMarketDataProviderName,
} from "../lib/providers/market-provider.ts";
import { mockMarketDataProvider } from "../lib/providers/mock-market-provider.ts";
import { normalizeExternalMarketListing } from "../lib/providers/normalizers/market.ts";
import type { ExternalMarketListing } from "../types/data-provider.ts";

const validListing: ExternalMarketListing = {
  externalId: "external-demo-1",
  marketHashName: "AK-47 | Demo Finish",
  weapon: "AK-47",
  skinName: "Demo Finish",
  exterior: "Minimal Wear",
  price: 125.5,
  currency: "CAD",
  floatValue: 0.12,
  listingUrl: null,
  provider: "mock",
  observedAt: "2026-08-01T12:00:00Z",
};

test("Mock Provider exposes the mock name", () => {
  assert.equal(mockMarketDataProvider.name, "mock");
});

test("Mock Provider reads every existing mock skin", async () => {
  const listings = await mockMarketDataProvider.getListings();

  assert.equal(listings.length, mockSkins.length);
  assert.deepEqual(
    listings.map(({ externalId }) => externalId),
    mockSkins.map(({ id }) => id),
  );
});

test("Mock Provider does not mutate mockSkins", async () => {
  const snapshot = JSON.stringify(mockSkins);

  await mockMarketDataProvider.getListings();
  await mockMarketDataProvider.getSkinByExternalId(mockSkins[0].id);

  assert.equal(JSON.stringify(mockSkins), snapshot);
});

test("Provider selector defaults to mock", () => {
  assert.equal(getMarketDataProvider({}).name, "mock");
});

test("MARKET_DATA_PROVIDER=mock selects mock", () => {
  assert.equal(
    getMarketDataProvider({ MARKET_DATA_PROVIDER: "mock" }).name,
    "mock",
  );
});

test("unknown Provider configuration safely falls back to mock", () => {
  assert.equal(resolveMarketDataProviderName("unknown-provider"), "mock");
});

test("missing CSFloat API key does not fail Provider selection", () => {
  assert.equal(
    getMarketDataProvider({ MARKET_DATA_PROVIDER: "csfloat" }).name,
    "csfloat",
  );
});

test("CSFloat Provider reports AUTH_REQUIRED without a key", async () => {
  const provider = createCsfloatMarketProvider({});

  await assert.rejects(provider.getListings(), (error: unknown) => {
    return (
      error instanceof MarketProviderError &&
      error.code === "AUTH_REQUIRED" &&
      error.provider === "csfloat"
    );
  });
});

test("Provider errors never include the configured secret", async () => {
  const secret = "server-secret-value-for-test";
  const provider = createCsfloatMarketProvider({ apiKey: secret });

  await assert.rejects(provider.getListings(), (error: unknown) => {
    return error instanceof Error && !error.message.includes(secret);
  });
});

test("Normalizer does not mutate its input", () => {
  const input = { ...validListing };
  const snapshot = JSON.stringify(input);

  normalizeExternalMarketListing(input);

  assert.equal(JSON.stringify(input), snapshot);
});

test("Normalizer returns a new object with a legal price", () => {
  const result = normalizeExternalMarketListing(validListing);

  assert.notStrictEqual(result, validListing);
  assert.equal(result.price, 125.5);
});

test("Normalizer rejects an illegal price with a clear error", () => {
  assert.throws(
    () => normalizeExternalMarketListing({ ...validListing, price: -1 }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "NORMALIZATION_ERROR" &&
      error.message.includes("price"),
  );
});

test("Normalizer preserves USD without implicit conversion", () => {
  const result = normalizeExternalMarketListing({
    ...validListing,
    price: 99,
    currency: "USD",
  });

  assert.equal(result.price, 99);
  assert.equal(result.currency, "USD");
});

test("Provider results identify their source", async () => {
  const listings = await mockMarketDataProvider.getListings();

  assert.ok(listings.every(({ provider }) => provider === "mock"));
});

test("Mock Provider observedAt values are valid ISO timestamps", async () => {
  const listings = await mockMarketDataProvider.getListings();

  assert.ok(
    listings.every(({ observedAt }) => Number.isFinite(Date.parse(observedAt))),
  );
});

test("Normalizer safely drops unknown external fields", () => {
  const input: ExternalMarketListing & { unverifiedField: string } = {
    ...validListing,
    unverifiedField: "not-for-the-internal-model",
  };
  const result = normalizeExternalMarketListing(input);

  assert.equal("unverifiedField" in result, false);
});

test("Mock Provider supports exact external ID lookup and health checks", async () => {
  const listing = await mockMarketDataProvider.getSkinByExternalId(
    mockSkins[0].id,
  );
  const health = await mockMarketDataProvider.healthCheck();

  assert.equal(listing?.externalId, mockSkins[0].id);
  assert.deepEqual(health, { provider: "mock", available: true });
});

test("Provider implementation and type sources do not use explicit unsafe types", () => {
  const sources = [
    "../types/data-provider.ts",
    "../lib/providers/errors.ts",
    "../lib/providers/mock-market-provider.ts",
    "../lib/providers/csfloat-market-provider.ts",
    "../lib/providers/market-provider.ts",
    "../lib/providers/normalizers/market.ts",
  ].map((relativePath) =>
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  );

  assert.ok(sources.every((source) => !/\bany\b/.test(source)));
});
