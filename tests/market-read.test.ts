import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mockSkins } from "../data/mock-skins.ts";
import {
  filterMarketListings,
  formatMarketListingPrice,
  queryMarketListings,
  sortMarketListings,
} from "../lib/market-listings.ts";
import {
  MarketReadDataAccessError,
  readMarketPageData,
  type MarketDisplayCache,
} from "../lib/services/market-read-service.ts";
import type { MarketDisplayListing } from "../types/market.ts";

const FETCHED_AT = "2026-08-12T08:00:00.000Z";
const listing: MarketDisplayListing = {
  id: "fictional-listing-001",
  externalId: "fictional-listing-001",
  provider: "csfloat",
  marketHashName: "AK-47 | Fictional Read Test (Factory New)",
  weapon: "AK-47",
  skinName: "Fictional Read Test",
  exterior: "Factory New",
  price: 123.45,
  currency: "UNSPECIFIED",
  floatValue: 0.012345678,
  observedAt: "2026-08-12T07:59:00.000Z",
};
const secondListing: MarketDisplayListing = {
  ...listing,
  id: "fictional-listing-002",
  externalId: "fictional-listing-002",
  marketHashName: "AWP | Fictional Second (Field-Tested)",
  weapon: "AWP",
  skinName: "Fictional Second",
  exterior: "Field-Tested",
  price: 88.88,
  currency: "CAD",
};

function createCache(
  data: readonly MarketDisplayListing[] = [listing],
): MarketDisplayCache {
  return {
    data,
    source: "csfloat",
    fallback: false,
    fetchedAt: FETCHED_AT,
  };
}

function readCache(
  cache: MarketDisplayCache | null,
  now = new Date("2026-08-12T08:10:00.000Z"),
) {
  return readMarketPageData({
    readCache: async () => cache,
    mockData: mockSkins,
    now,
    staleAfterSeconds: 1_800,
  });
}

test("Supabase market cache success returns csfloat source", async () => {
  const result = await readCache(createCache());

  assert.equal(result.source, "csfloat");
});

test("Supabase market cache success disables fallback", async () => {
  const result = await readCache(createCache());

  assert.equal(result.fallback, false);
});

test("real display listings do not invent mock-only fields", async () => {
  const result = await readCache(createCache());

  assert.equal(result.fallback, false);
  const keys = Object.keys(result.data[0] ?? {});
  assert.ok(!keys.includes("rarity"));
  assert.ok(!keys.includes("priceChange24h"));
  assert.ok(!keys.includes("priceHistory"));
  assert.ok(!keys.includes("availableListings"));
  assert.ok(!keys.includes("platforms"));
});

test("UNSPECIFIED currency never formats as CAD, USD, or a currency symbol", () => {
  const price = formatMarketListingPrice(listing);

  assert.equal(price.amount, "123.45");
  assert.equal(price.currencyLabel, "币种未确认");
  assert.equal(price.currencyConfirmed, false);
  assert.doesNotMatch(JSON.stringify(price), /CAD|USD|\$/u);
});

test("market read preserves observedAt and fetchedAt", async () => {
  const result = await readCache(createCache());

  assert.equal(result.fetchedAt, FETCHED_AT);
  assert.equal(result.data[0]?.observedAt, listing.observedAt);
});

test("known Supabase access failure falls back to mock data", async () => {
  const result = await readMarketPageData({
    readCache: async () => {
      throw new MarketReadDataAccessError();
    },
    mockData: mockSkins,
  });

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, true);
  assert.strictEqual(result.data, mockSkins);
});

test("zero csfloat rows falls back to mock data", async () => {
  const result = await readCache(createCache([]));

  assert.equal(result.source, "mock");
  assert.equal(result.fallback, true);
});

test("fallback result explicitly identifies mock source", async () => {
  const result = await readCache(null);

  assert.deepEqual(
    { source: result.source, fallback: result.fallback },
    { source: "mock", fallback: true },
  );
});

test("data older than the configured threshold is stale", async () => {
  const result = await readCache(
    createCache(),
    new Date("2026-08-12T08:30:00.001Z"),
  );

  assert.equal(result.stale, true);
});

test("data inside the configured threshold is fresh", async () => {
  const result = await readCache(
    createCache(),
    new Date("2026-08-12T08:29:59.999Z"),
  );

  assert.equal(result.stale, false);
});

test("unexpected programming errors are not swallowed by fallback", async () => {
  await assert.rejects(
    () =>
      readMarketPageData({
        readCache: async () => {
          throw new Error("unexpected-code-bug");
        },
        mockData: mockSkins,
      }),
    /unexpected-code-bug/u,
  );
});

test("server read fallback does not classify every TypeError as data access failure", () => {
  const serverRead = readFileSync(
    new URL(
      "../lib/services/market-read-server.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.doesNotMatch(serverRead, /error instanceof TypeError/u);
  assert.match(serverRead, /SupabaseMarketRepositoryMappingError/u);
});

test("market page read path does not import CSFloat Provider or Sync Service", () => {
  const page = readFileSync(
    new URL("../app/market/page.tsx", import.meta.url),
    "utf8",
  );
  const serverRead = readFileSync(
    new URL(
      "../lib/services/market-read-server.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const source = `${page}\n${serverRead}`;

  assert.doesNotMatch(source, /csfloat-market-provider/iu);
  assert.doesNotMatch(source, /market-sync-service/iu);
  assert.doesNotMatch(source, /createMarketSyncService/u);
});

test("market page read path contains no Supabase write operation", () => {
  const serverRead = readFileSync(
    new URL(
      "../lib/services/market-read-server.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.doesNotMatch(
    serverRead,
    /replaceListings|upsertMarketCache|insert\(|update\(|delete\(/u,
  );
});

test("market client props contain only sanitized display data", async () => {
  const secret = "never-enter-market-props";
  const result = await readCache(createCache());
  const serialized = JSON.stringify(result);

  assert.ok(!serialized.includes(secret));
  assert.ok(!serialized.includes("listingUrl"));
  assert.ok(!serialized.includes("seller"));
  assert.ok(!serialized.includes("steam"));
});

test("real listing query leaves its input unchanged", () => {
  const listings = [listing, secondListing] as const;
  const snapshot = JSON.stringify(listings);

  queryMarketListings(listings, {
    query: "fictional",
    weapon: "all",
    exterior: "all",
    sort: "price-desc",
  });

  assert.equal(JSON.stringify(listings), snapshot);
});

test("real listing search matches market and weapon names case-insensitively", () => {
  const listings = [listing, secondListing];
  const byMarketName = filterMarketListings(listings, {
    query: "FICTIONAL SECOND",
    weapon: "all",
    exterior: "all",
  });
  const byWeapon = filterMarketListings(listings, {
    query: "awp",
    weapon: "all",
    exterior: "all",
  });

  assert.deepEqual(byMarketName.map(({ id }) => id), [secondListing.id]);
  assert.deepEqual(byWeapon.map(({ id }) => id), [secondListing.id]);
});

test("real listing weapon and exterior filters combine", () => {
  const result = filterMarketListings([listing, secondListing], {
    query: "",
    weapon: "AK-47",
    exterior: "Factory New",
  });

  assert.deepEqual(result.map(({ id }) => id), [listing.id]);
});

test("real listing price sorting supports both directions", () => {
  const listings = [listing, secondListing];

  assert.deepEqual(
    sortMarketListings(listings, "price-asc").map(({ price }) => price),
    [88.88, 123.45],
  );
  assert.deepEqual(
    sortMarketListings(listings, "price-desc").map(({ price }) => price),
    [123.45, 88.88],
  );
});
