import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mockSkins } from "../data/mock-skins.ts";
import { parseCSFloatMarketHashName } from "../lib/providers/csfloat-market-name.ts";
import {
  buildCSFloatListingsUrl,
  createCsfloatMarketProvider,
  DEFAULT_CSFLOAT_LISTINGS_LIMIT,
  MAX_CSFLOAT_PAGES,
  MAX_CSFLOAT_LISTINGS_LIMIT,
  MAX_SYNC_LISTINGS,
} from "../lib/providers/csfloat-market-provider.ts";
import {
  parseCSFloatListingsPageResponse,
  parseCSFloatListingsResponse,
} from "../lib/providers/csfloat-response.ts";
import { MarketProviderError } from "../lib/providers/errors.ts";
import {
  getMarketDataProvider,
  resolveMarketDataProviderName,
} from "../lib/providers/market-provider.ts";
import { mockMarketDataProvider } from "../lib/providers/mock-market-provider.ts";
import { getMarketListingsSafely } from "../lib/providers/market-listings-service.ts";
import { normalizeExternalMarketListing } from "../lib/providers/normalizers/market.ts";
import type {
  ExternalMarketListing,
  MarketDataProvider,
} from "../types/data-provider.ts";

const officialMinimalListing = {
  id: "test-listing-001",
  created_at: "2026-08-11T08:00:00.000Z",
  type: "buy_now",
  price: 260000,
  state: "listed",
  item: {
    float_value: 0.02796577662229538,
    market_hash_name: "M4A4 | Test Skin (Factory New)",
    item_name: "M4A4 | Test Skin",
    wear_name: "Factory New",
  },
};

function createCSFloatListingFixture(index: number) {
  return {
    ...officialMinimalListing,
    id: `fictional-listing-${String(index).padStart(3, "0")}`,
    price: 10_000 + index,
    item: {
      ...officialMinimalListing.item,
      market_hash_name: `AK-47 | Fictional Finish ${index} (Factory New)`,
      item_name: `AK-47 | Fictional Finish ${index}`,
    },
  };
}

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
    "../lib/providers/market-listings-service.ts",
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

test("CSFloat parser accepts the live-confirmed data wrapper", () => {
  const result = parseCSFloatListingsResponse({
    cursor: "test-cursor",
    data: [officialMinimalListing],
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, officialMinimalListing.id);
});

test("CSFloat Provider processes the live-confirmed data wrapper", async () => {
  const provider = createResponseProvider(
    jsonResponse({
      cursor: "test-cursor",
      data: [officialMinimalListing],
    }),
  );
  const [listing] = await provider.getListings({ targetListings: 1 });

  assert.equal(listing.externalId, officialMinimalListing.id);
  assert.equal(listing.provider, "csfloat");
});

test("CSFloat parser rejects a wrapper whose data field is not an array", () => {
  assert.throws(
    () => parseCSFloatListingsResponse({ data: {} }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE" &&
      error.message.includes("response.data"),
  );
});

test("CSFloat parser rejects a null response", () => {
  assert.throws(
    () => parseCSFloatListingsResponse(null),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE",
  );
});

test("CSFloat parser does not mutate a wrapped response", () => {
  const input = {
    cursor: "test-cursor",
    data: [structuredClone(officialMinimalListing)],
  };
  const snapshot = JSON.stringify(input);

  parseCSFloatListingsResponse(input);

  assert.equal(JSON.stringify(input), snapshot);
});

test("CSFloat parser drops seller and raw item fields from wrapped data", () => {
  const [listing] = parseCSFloatListingsResponse({
    cursor: "test-cursor",
    data: [
      {
        ...officialMinimalListing,
        seller: { username: "fictional-user" },
        item: {
          ...officialMinimalListing.item,
          inspect_link: "https://example.invalid/inspect",
        },
      },
    ],
  });

  assert.equal("seller" in listing, false);
  assert.equal("inspect_link" in listing.item, false);
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
  assert.equal(
    listings[0].marketHashName,
    "M4A4 | Test Skin (Factory New)",
  );
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

test("CSFloat Provider maps live-confirmed 403 to AUTH_REQUIRED", async () => {
  await assertProviderError(
    createResponseProvider(jsonResponse({}, 403)).getListings(),
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

test("CSFloat listings URL propagates the opaque cursor", () => {
  const url = buildCSFloatListingsUrl({ cursor: "fictional-cursor-2" });

  assert.equal(url.searchParams.get("cursor"), "fictional-cursor-2");
});

test("CSFloat page parser returns confirmed wrapper data and cursor", () => {
  const page = parseCSFloatListingsPageResponse({
    cursor: "fictional-cursor-1",
    data: [officialMinimalListing],
  });

  assert.equal(page.cursor, "fictional-cursor-1");
  assert.equal(page.data.length, 1);
});

test("CSFloat Provider completes a one-page target without another request", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return jsonResponse({
        cursor: "unused-next-cursor",
        data: [createCSFloatListingFixture(1), createCSFloatListingFixture(2)],
      });
    },
  });

  const listings = await provider.getListings({ targetListings: 2 });

  assert.equal(listings.length, 2);
  assert.equal(requests, 1);
});

test("CSFloat Provider paginates sequentially and propagates cursors", async () => {
  const cursors: Array<string | null> = [];
  let activeRequests = 0;
  let maximumActiveRequests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async (input) => {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
      const cursor = new URL(input).searchParams.get("cursor");
      cursors.push(cursor);
      await Promise.resolve();
      activeRequests -= 1;

      return cursor === null
        ? jsonResponse({
            cursor: "fictional-cursor-1",
            data: [
              createCSFloatListingFixture(1),
              createCSFloatListingFixture(2),
            ],
          })
        : jsonResponse({
            cursor: "fictional-cursor-2",
            data: [createCSFloatListingFixture(3)],
          });
    },
  });

  const listings = await provider.getListings({ targetListings: 3 });

  assert.equal(listings.length, 3);
  assert.deepEqual(cursors, [null, "fictional-cursor-1"]);
  assert.equal(maximumActiveRequests, 1);
});

test("CSFloat Provider stops exactly at targetListings", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return jsonResponse({
        cursor: "unused-next-cursor",
        data: Array.from({ length: 5 }, (_value, index) =>
          createCSFloatListingFixture(index + 1),
        ),
      });
    },
  });

  const listings = await provider.getListings({ targetListings: 3 });

  assert.equal(listings.length, 3);
  assert.equal(requests, 1);
});

test("CSFloat Provider enforces the 500-listing hard cap", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      const page = requests;
      requests += 1;
      return jsonResponse({
        cursor: `fictional-cursor-${requests}`,
        data: Array.from({ length: MAX_CSFLOAT_LISTINGS_LIMIT }, (_value, index) =>
          createCSFloatListingFixture(
            page * MAX_CSFLOAT_LISTINGS_LIMIT + index + 1,
          ),
        ),
      });
    },
  });

  const listings = await provider.getListings({ targetListings: 5_000 });

  assert.equal(listings.length, MAX_SYNC_LISTINGS);
  assert.equal(requests, MAX_CSFLOAT_PAGES);
});

test("CSFloat Provider rejects pagination beyond the max-page guard", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return jsonResponse({
        cursor: `fictional-cursor-${requests}`,
        data: [createCSFloatListingFixture(requests)],
      });
    },
  });

  await assert.rejects(
    provider.getListings({ targetListings: MAX_SYNC_LISTINGS }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE" &&
      error.receivedListings === MAX_CSFLOAT_PAGES &&
      error.message.includes("page limit"),
  );
  assert.equal(requests, MAX_CSFLOAT_PAGES);
});

test("CSFloat Provider rejects a duplicate cursor", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return jsonResponse({
        cursor: "repeated-fictional-cursor",
        data: [createCSFloatListingFixture(requests)],
      });
    },
  });

  await assert.rejects(
    provider.getListings({ targetListings: 3 }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "INVALID_RESPONSE" &&
      error.receivedListings === 1 &&
      error.message.includes("duplicate cursor"),
  );
  assert.equal(requests, 2);
});

test("CSFloat Provider deduplicates listings across pages", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return requests === 1
        ? jsonResponse({
            cursor: "fictional-cursor-1",
            data: [
              createCSFloatListingFixture(1),
              createCSFloatListingFixture(2),
            ],
          })
        : jsonResponse({
            cursor: "fictional-cursor-2",
            data: [
              createCSFloatListingFixture(2),
              createCSFloatListingFixture(3),
            ],
          });
    },
  });

  const listings = await provider.getListings({ targetListings: 3 });

  assert.deepEqual(
    listings.map(({ externalId }) => externalId),
    [
      "fictional-listing-001",
      "fictional-listing-002",
      "fictional-listing-003",
    ],
  );
});

test("CSFloat Provider stops immediately when page 2 is rate limited", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return requests === 1
        ? jsonResponse({
            cursor: "fictional-cursor-1",
            data: [createCSFloatListingFixture(1)],
          })
        : jsonResponse({}, 429);
    },
  });

  await assert.rejects(
    provider.getListings({ targetListings: 2 }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "RATE_LIMITED" &&
      error.receivedListings === 1,
  );
  assert.equal(requests, 2);
});

test("CSFloat Provider reports a page 2 failure as a partial failed read", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    fetchImplementation: async () => {
      requests += 1;
      return requests === 1
        ? jsonResponse({
            cursor: "fictional-cursor-1",
            data: [createCSFloatListingFixture(1)],
          })
        : jsonResponse({}, 503);
    },
  });

  await assert.rejects(
    provider.getListings({ targetListings: 2 }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "PROVIDER_UNAVAILABLE" &&
      error.receivedListings === 1,
  );
  assert.equal(requests, 2);
});

test("CSFloat Provider timeout aborts pagination without retrying", async () => {
  let requests = 0;
  const provider = createCsfloatMarketProvider({
    timeoutMs: 20,
    fetchImplementation: async (_input, init) => {
      requests += 1;
      if (requests === 1) {
        return jsonResponse({
          cursor: "fictional-cursor-1",
          data: [createCSFloatListingFixture(1)],
        });
      }

      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("aborted", "AbortError")),
          { once: true },
        );
      });
    },
  });

  await assert.rejects(
    provider.getListings({ targetListings: 2 }),
    (error: unknown) =>
      error instanceof MarketProviderError &&
      error.code === "PROVIDER_UNAVAILABLE" &&
      error.receivedListings === 1,
  );
  assert.equal(requests, 2);
});

test("CSFloat listings URL safely encodes market_hash_name", () => {
  const url = buildCSFloatListingsUrl({
    marketHashName: "M4A4 | Test Skin (Factory New)",
  });

  assert.equal(
    url.searchParams.get("market_hash_name"),
    "M4A4 | Test Skin (Factory New)",
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
      "M4A4 | Test Skin (Factory New)",
      "M4A4 | Test Skin",
      "Factory New",
    ),
    { weapon: "M4A4", skinName: "Test Skin", exterior: "Factory New" },
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

function createTestProvider(
  name: MarketDataProvider["name"],
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

test("anonymous compatibility fixture passes the current runtime parser", () => {
  const [listing] = parseCSFloatListingsResponse([officialMinimalListing]);

  assert.equal(listing.id, "test-listing-001");
  assert.equal(listing.item.item_name, "M4A4 | Test Skin");
});

test("Provider processes the anonymous compatibility fixture end to end", async () => {
  const [listing] = await createResponseProvider(
    jsonResponse([officialMinimalListing]),
  ).getListings();

  assert.equal(listing.provider, "csfloat");
  assert.equal(listing.skinName, "Test Skin");
});

test("anonymous compatibility fixture keeps nullable item fields explicit", () => {
  const [listing] = parseCSFloatListingsResponse([
    {
      ...officialMinimalListing,
      item: {
        ...officialMinimalListing.item,
        wear_name: null,
        float_value: null,
      },
    },
  ]);

  assert.equal(listing.item.wear_name, null);
  assert.equal(listing.item.float_value, null);
});

test("anonymous compatibility fixture preserves integer cents until conversion", async () => {
  const [parsed] = parseCSFloatListingsResponse([officialMinimalListing]);
  const [normalized] = await createResponseProvider(
    jsonResponse([officialMinimalListing]),
  ).getListings();

  assert.equal(parsed.price, 260000);
  assert.equal(normalized.price, 2600);
});

test("anonymous compatibility fixture is not mutated by the full pipeline", async () => {
  const fixture = structuredClone([officialMinimalListing]);
  const snapshot = JSON.stringify(fixture);

  await createResponseProvider(jsonResponse(fixture)).getListings();

  assert.equal(JSON.stringify(fixture), snapshot);
});

test("safe listings service returns mock directly with an explicit source", async () => {
  const result = await getMarketListingsSafely({
    provider: mockMarketDataProvider,
  });

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, false);
  assert.equal(result.data.length, mockSkins.length);
});

test("safe listings service keeps successful CSFloat data without fallback", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => [
    { ...validListing, provider: "csfloat", currency: "UNSPECIFIED" },
  ]);
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.equal(result.source, "csfloat");
  assert.equal(result.fallback, false);
  assert.equal(result.error, undefined);
});

test("safe listings service clearly falls back on RATE_LIMITED", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError("RATE_LIMITED", "csfloat", "rate limited");
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, true);
  assert.equal(result.error?.code, "RATE_LIMITED");
});

test("safe listings service clearly falls back on PROVIDER_UNAVAILABLE", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "csfloat",
      "unavailable",
    );
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, true);
  assert.equal(result.error?.code, "PROVIDER_UNAVAILABLE");
});

test("safe listings service treats denied access as an explicit fallback", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError("AUTH_REQUIRED", "csfloat", "denied");
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, true);
  assert.equal(result.error?.code, "AUTH_REQUIRED");
});

test("INVALID_RESPONSE is never disguised as successful CSFloat data", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError(
      "INVALID_RESPONSE",
      "csfloat",
      "invalid response",
    );
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.deepEqual(result.data, []);
  assert.equal(result.source, "none");
  assert.equal(result.fallback, false);
  assert.equal(result.error?.code, "INVALID_RESPONSE");
});

test("fallback mock listings are never labeled as CSFloat", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError("RATE_LIMITED", "csfloat", "rate limited");
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.ok(result.data.every(({ provider }) => provider === "mock"));
  assert.notEqual(result.source, "csfloat");
});

test("safe listings results omit secret-bearing error messages", async () => {
  const secret = "private-test-secret";
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "csfloat",
      `request failed ${secret}`,
    );
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.ok(!JSON.stringify(result).includes(secret));
});

test("safe listings service preserves timeout and abort failure semantics", async () => {
  const csfloatProvider = createTestProvider("csfloat", async () => {
    throw new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "csfloat",
      "request aborted",
    );
  });
  const result = await getMarketListingsSafely({ provider: csfloatProvider });

  assert.equal(result.error?.code, "PROVIDER_UNAVAILABLE");
  assert.equal(result.source, "mock");
});

test("market list does not call a Provider while mock detail remains local", () => {
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
  assert.ok(!marketPage.includes("getMarketListingsSafely"));
  assert.ok(!detailPage.includes("getMarketListingsSafely"));
});
