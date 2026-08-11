import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mockSkins } from "../data/mock-skins.ts";
import { parseCSFloatMarketHashName } from "../lib/providers/csfloat-market-name.ts";
import {
  buildCSFloatListingsUrl,
  createCsfloatMarketProvider,
  DEFAULT_CSFLOAT_LISTINGS_LIMIT,
  MAX_CSFLOAT_LISTINGS_LIMIT,
} from "../lib/providers/csfloat-market-provider.ts";
import { parseCSFloatListingsResponse } from "../lib/providers/csfloat-response.ts";
import { MarketProviderError } from "../lib/providers/errors.ts";
import {
  getMarketDataProvider,
  resolveMarketDataProviderName,
} from "../lib/providers/market-provider.ts";
import { mockMarketDataProvider } from "../lib/providers/mock-market-provider.ts";
import { normalizeExternalMarketListing } from "../lib/providers/normalizers/market.ts";
import type { ExternalMarketListing } from "../types/data-provider.ts";

const officialMinimalListing = {
  id: "324288155723370196",
  created_at: "2021-06-13T20:45:21.311794Z",
  type: "buy_now",
  price: 260000,
  state: "listed",
  item: {
    asset_id: "22547095285",
    def_index: 16,
    paint_index: 449,
    paint_seed: 700,
    float_value: 0.02796577662229538,
    market_hash_name: "M4A4 | Poseidon (Factory New)",
    item_name: "M4A4 | Poseidon",
    wear_name: "Factory New",
    is_stattrak: false,
    is_souvenir: false,
    rarity: 5,
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createResponseProvider(response: Response) {
  return createCsfloatMarketProvider({
    fetchImplementation: async () => response,
  });
}

async function assertProviderError(
  promise: Promise<unknown>,
  expectedCode: MarketProviderError["code"],
) {
  await assert.rejects(promise, (error: unknown) => {
    return (
      error instanceof MarketProviderError && error.code === expectedCode
    );
  });
}

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

test("CSFloat public listings request works without an API key", async () => {
  let authorizationHeader: string | null = "unexpected";
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async (_input, init) => {
      authorizationHeader = new Headers(init?.headers).get("Authorization");
      return jsonResponse([]);
    },
  });

  assert.deepEqual(await provider.getListings(), []);
  assert.equal(authorizationHeader, null);
});

test("Provider errors never include the configured secret", async () => {
  const secret = "server-secret-value-for-test";
  const provider = createCsfloatMarketProvider({
    apiKey: secret,
    fetchImplementation: async () => jsonResponse({}, 500),
  });

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
    "../lib/providers/csfloat-market-name.ts",
    "../lib/providers/csfloat-response.ts",
    "../lib/providers/market-provider.ts",
    "../lib/providers/normalizers/market.ts",
    "../types/csfloat.ts",
  ].map((relativePath) =>
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  );

  assert.ok(sources.every((source) => !/\bany\b/.test(source)));
});

test("CSFloat parser accepts the documented minimal listing fields", () => {
  const result = parseCSFloatListingsResponse([officialMinimalListing]);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, officialMinimalListing.id);
  assert.equal(
    result[0].item.market_hash_name,
    officialMinimalListing.item.market_hash_name,
  );
});

test("CSFloat Provider converts documented cents to a major price unit", async () => {
  const provider = createResponseProvider(
    jsonResponse([officialMinimalListing]),
  );
  const [listing] = await provider.getListings();

  assert.equal(listing.price, 2600);
});

test("CSFloat Provider never treats the cents value as a full price unit", async () => {
  const provider = createResponseProvider(
    jsonResponse([officialMinimalListing]),
  );
  const [listing] = await provider.getListings();

  assert.notEqual(listing.price, officialMinimalListing.price);
});

test("CSFloat parser rejects a non-array response", () => {
  assert.throws(
    () => parseCSFloatListingsResponse({ listings: [] }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE",
  );
});

test("CSFloat parser rejects a listing without an id", () => {
  assert.throws(
    () =>
      parseCSFloatListingsResponse([
        { ...officialMinimalListing, id: undefined },
      ]),
    (error: unknown) =>
      error instanceof MarketProviderError && error.message.includes(".id"),
  );
});

test("CSFloat parser rejects a listing without a price", () => {
  assert.throws(
    () =>
      parseCSFloatListingsResponse([
        { ...officialMinimalListing, price: undefined },
      ]),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.message.includes(".price"),
  );
});

test("CSFloat parser rejects an invalid cents price", () => {
  assert.throws(
    () =>
      parseCSFloatListingsResponse([
        { ...officialMinimalListing, price: -100 },
      ]),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE" &&
      error.message.includes("cents"),
  );
});

test("CSFloat parser rejects a listing without an item", () => {
  assert.throws(
    () =>
      parseCSFloatListingsResponse([
        { ...officialMinimalListing, item: undefined },
      ]),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.message.includes(".item"),
  );
});

test("CSFloat parser rejects an item without market_hash_name", () => {
  assert.throws(
    () =>
      parseCSFloatListingsResponse([
        {
          ...officialMinimalListing,
          item: {
            ...officialMinimalListing.item,
            market_hash_name: undefined,
          },
        },
      ]),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.message.includes("market_hash_name"),
  );
});

test("CSFloat parser rejects an out-of-range float value", () => {
  assert.throws(
    () =>
      parseCSFloatListingsResponse([
        {
          ...officialMinimalListing,
          item: { ...officialMinimalListing.item, float_value: 1.1 },
        },
      ]),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.message.includes("float_value"),
  );
});

test("CSFloat parser maps a missing wear_name to null", () => {
  const [listing] = parseCSFloatListingsResponse([
    {
      ...officialMinimalListing,
      item: { ...officialMinimalListing.item, wear_name: undefined },
    },
  ]);

  assert.equal(listing.item.wear_name, null);
});

test("CSFloat Provider processes a successful 200 JSON response", async () => {
  const listings = await createResponseProvider(
    jsonResponse([officialMinimalListing]),
  ).getListings();

  assert.equal(listings[0].provider, "csfloat");
  assert.equal(listings[0].marketHashName, "M4A4 | Poseidon (Factory New)");
});

test("CSFloat Provider maps 400 to INVALID_RESPONSE", async () => {
  await assertProviderError(
    createResponseProvider(jsonResponse({}, 400)).getListings(),
    "INVALID_RESPONSE",
  );
});

test("CSFloat Provider maps 401 to AUTH_REQUIRED", async () => {
  await assertProviderError(
    createResponseProvider(jsonResponse({}, 401)).getListings(),
    "AUTH_REQUIRED",
  );
});

test("CSFloat Provider maps 429 to RATE_LIMITED", async () => {
  await assertProviderError(
    createResponseProvider(jsonResponse({}, 429)).getListings(),
    "RATE_LIMITED",
  );
});

test("CSFloat Provider maps 500 to PROVIDER_UNAVAILABLE", async () => {
  await assertProviderError(
    createResponseProvider(jsonResponse({}, 500)).getListings(),
    "PROVIDER_UNAVAILABLE",
  );
});

test("CSFloat Provider rejects non-JSON success responses", async () => {
  await assertProviderError(
    createResponseProvider(new Response("not-json", { status: 200 })).getListings(),
    "INVALID_RESPONSE",
  );
});

test("CSFloat Provider rejects invalid JSON schemas", async () => {
  await assertProviderError(
    createResponseProvider(jsonResponse([{ id: "incomplete" }])).getListings(),
    "INVALID_RESPONSE",
  );
});

test("CSFloat Provider accepts an empty listings array", async () => {
  const listings = await createResponseProvider(jsonResponse([])).getListings();

  assert.deepEqual(listings, []);
});

test("CSFloat listings URL uses the safe default limit", () => {
  const url = buildCSFloatListingsUrl();

  assert.equal(
    url.searchParams.get("limit"),
    String(DEFAULT_CSFLOAT_LISTINGS_LIMIT),
  );
});

test("CSFloat listings URL clamps limit above the official maximum", () => {
  const url = buildCSFloatListingsUrl({ limit: 500 });

  assert.equal(
    url.searchParams.get("limit"),
    String(MAX_CSFLOAT_LISTINGS_LIMIT),
  );
});

test("CSFloat listings URL safely encodes market_hash_name", () => {
  const url = buildCSFloatListingsUrl({
    marketHashName: "M4A4 | Poseidon (Factory New)",
  });

  assert.equal(
    url.searchParams.get("market_hash_name"),
    "M4A4 | Poseidon (Factory New)",
  );
  assert.ok(!url.toString().includes("Factory New"));
});

test("CSFloat parsing and Provider conversion do not mutate API JSON", async () => {
  const input = structuredClone([officialMinimalListing]);
  const snapshot = JSON.stringify(input);
  const provider = createResponseProvider(jsonResponse(input));

  parseCSFloatListingsResponse(input);
  await provider.getListings();

  assert.equal(JSON.stringify(input), snapshot);
});

test("CSFloat Provider preserves unknown currency semantics", async () => {
  const [listing] = await createResponseProvider(
    jsonResponse([officialMinimalListing]),
  ).getListings();

  assert.equal(listing.currency, "UNSPECIFIED");
});

test("CSFloat Authorization header uses the raw key without Bearer", async () => {
  const secret = "fake-server-key";
  let authorizationHeader: string | null = null;
  const provider = createCsfloatMarketProvider({
    apiKey: secret,
    fetchImplementation: async (_input, init) => {
      authorizationHeader = new Headers(init?.headers).get("Authorization");
      return jsonResponse([]);
    },
  });

  await provider.getListings();

  assert.equal(authorizationHeader, secret);
  assert.ok(!String(authorizationHeader).startsWith("Bearer "));
});

test("CSFloat Provider maps an aborted request to PROVIDER_UNAVAILABLE", async () => {
  const controller = new AbortController();
  controller.abort();
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async (_input, init) => {
      if (init?.signal?.aborted) {
        throw new DOMException("aborted", "AbortError");
      }
      return jsonResponse([]);
    },
  });

  await assertProviderError(
    provider.getListings({ signal: controller.signal }),
    "PROVIDER_UNAVAILABLE",
  );
});

test("CSFloat market names parse standard and StatTrak item formats", () => {
  assert.deepEqual(
    parseCSFloatMarketHashName(
      "M4A4 | Poseidon (Factory New)",
      "M4A4 | Poseidon",
      "Factory New",
    ),
    { weapon: "M4A4", skinName: "Poseidon", exterior: "Factory New" },
  );
  assert.deepEqual(
    parseCSFloatMarketHashName(
      "StatTrak™ AK-47 | Demo (Minimal Wear)",
      "StatTrak™ AK-47 | Demo",
      "Minimal Wear",
    ),
    { weapon: "AK-47", skinName: "Demo", exterior: "Minimal Wear" },
  );
});

test("CSFloat market names safely retain non-standard item names", () => {
  assert.deepEqual(
    parseCSFloatMarketHashName("Unusual Item", "Unusual Item", null),
    { weapon: "Unusual Item", skinName: null, exterior: null },
  );
});
