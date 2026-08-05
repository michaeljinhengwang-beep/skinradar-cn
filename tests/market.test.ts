import assert from "node:assert/strict";
import test from "node:test";
import { mockSkins } from "../data/mock-skins.ts";
import {
  filterSkins,
  getSkinById,
  querySkins,
  searchSkins,
  sortPlatformQuotesByPrice,
  sortPriceHistoryByDate,
  sortSkins,
} from "../lib/market.ts";
import { validateMarketData } from "../lib/market-validation.ts";
import { ALL_MARKET_FILTER_VALUE } from "../types/market.ts";
import type { MarketFilterOptions, Skin } from "../types/market.ts";

const allFilters = {
  query: "",
  weapon: ALL_MARKET_FILTER_VALUE,
  exterior: ALL_MARKET_FILTER_VALUE,
  rarity: ALL_MARKET_FILTER_VALUE,
} satisfies MarketFilterOptions;

function assertNonDecreasing(values: readonly number[]) {
  values.slice(1).forEach((value, index) => {
    assert.ok(values[index] <= value);
  });
}

function assertNonIncreasing(values: readonly number[]) {
  values.slice(1).forEach((value, index) => {
    assert.ok(values[index] >= value);
  });
}

test("getSkinById finds an existing skin by exact ID", () => {
  const skin = getSkinById(mockSkins, mockSkins[0].id);

  assert.strictEqual(skin, mockSkins[0]);
});

test("getSkinById returns undefined for an unknown ID", () => {
  assert.equal(getSkinById(mockSkins, "missing-demo-skin"), undefined);
});

test("searchSkins ignores English letter casing", () => {
  const lowercaseIds = searchSkins(mockSkins, "ak-47").map(
    (skin) => skin.id,
  );
  const uppercaseIds = searchSkins(mockSkins, "AK-47").map(
    (skin) => skin.id,
  );

  assert.deepEqual(lowercaseIds, uppercaseIds);
  assert.ok(lowercaseIds.length > 0);
});

test("searchSkins matches weapon names", () => {
  const results = searchSkins(mockSkins, "awp");

  assert.ok(results.length > 0);
  assert.ok(results.every((skin) => skin.weapon === "AWP"));
});

test("searchSkins matches skinName", () => {
  const results = searchSkins(mockSkins, "极夜脉冲");

  assert.deepEqual(results.map((skin) => skin.id), [
    "demo-m4a1s-midnight-pulse",
  ]);
});

test("searchSkins trims empty input and returns a safe copy", () => {
  const results = searchSkins(mockSkins, "   ");

  assert.deepEqual(results, mockSkins);
  assert.notStrictEqual(results, mockSkins);
});

test("filterSkins applies a single filter", () => {
  const results = filterSkins(mockSkins, {
    ...allFilters,
    exterior: "Minimal Wear",
  });

  assert.ok(results.length > 0);
  assert.ok(results.every((skin) => skin.exterior === "Minimal Wear"));
});

test("filterSkins combines search and multiple filters", () => {
  const results = filterSkins(mockSkins, {
    query: "琥珀",
    weapon: "AK-47",
    exterior: "Minimal Wear",
    rarity: "Classified",
  });

  assert.deepEqual(results.map((skin) => skin.id), [
    "demo-ak47-amber-echo",
  ]);
});

test("filterSkins returns an empty array for unmatched conditions", () => {
  const results = filterSkins(mockSkins, {
    ...allFilters,
    query: "不存在的模拟饰品",
  });

  assert.deepEqual(results, []);
});

test("sortSkins sorts price from low to high", () => {
  const results = sortSkins(mockSkins, "price-asc");

  assertNonDecreasing(results.map((skin) => skin.startingPrice));
});

test("sortSkins sorts price from high to low", () => {
  const results = sortSkins(mockSkins, "price-desc");

  assertNonIncreasing(results.map((skin) => skin.startingPrice));
});

test("sortSkins sorts 24-hour gains from high to low", () => {
  const results = sortSkins(mockSkins, "change-desc");

  assertNonIncreasing(results.map((skin) => skin.priceChange24h));
});

test("sortSkins sorts 24-hour losses from largest to smallest", () => {
  const results = sortSkins(mockSkins, "change-asc");

  assertNonDecreasing(results.map((skin) => skin.priceChange24h));
});

test("sortSkins default order preserves the input order", () => {
  const results = sortSkins(mockSkins, "default");

  assert.deepEqual(
    results.map((skin) => skin.id),
    mockSkins.map((skin) => skin.id),
  );
  assert.notStrictEqual(results, mockSkins);
});

test("querySkins combines filtering and sorting", () => {
  const results = querySkins(mockSkins, {
    ...allFilters,
    weapon: "M4A1-S",
    sort: "price-asc",
  });

  assert.ok(results.every((skin) => skin.weapon === "M4A1-S"));
  assertNonDecreasing(results.map((skin) => skin.startingPrice));
});

test("market queries and sorts do not mutate mockSkins", () => {
  const snapshot = JSON.stringify(mockSkins);

  searchSkins(mockSkins, "AK-47");
  filterSkins(mockSkins, allFilters);
  sortSkins(mockSkins, "price-desc");
  querySkins(mockSkins, { ...allFilters, sort: "change-asc" });
  sortPlatformQuotesByPrice(mockSkins[0].platforms);
  sortPriceHistoryByDate(mockSkins[0].priceHistory, "desc");

  assert.equal(JSON.stringify(mockSkins), snapshot);
});

test("sortPlatformQuotesByPrice returns ascending CAD prices", () => {
  const reversedQuotes = [...mockSkins[0].platforms].reverse();
  const originalOrder = reversedQuotes.map((quote) => quote.platform);
  const results = sortPlatformQuotesByPrice(reversedQuotes);

  assertNonDecreasing(results.map((quote) => quote.price));
  assert.deepEqual(
    reversedQuotes.map((quote) => quote.platform),
    originalOrder,
  );
});

test("sortPriceHistoryByDate supports ascending and descending ISO dates", () => {
  const reversedHistory = [...mockSkins[0].priceHistory].reverse();
  const ascending = sortPriceHistoryByDate(reversedHistory);
  const descending = sortPriceHistoryByDate(reversedHistory, "desc");

  assert.deepEqual(
    ascending.map((point) => point.date),
    [...ascending.map((point) => point.date)].sort(),
  );
  assert.deepEqual(
    descending.map((point) => point.date),
    [...ascending.map((point) => point.date)].reverse(),
  );
});

test("mockSkins passes all market data integrity rules", () => {
  assert.deepEqual(validateMarketData(mockSkins), []);
});

test("market validation reports precise field paths", () => {
  const invalidSkin: Skin = { ...mockSkins[0], startingPrice: -1 };
  const errors = validateMarketData([invalidSkin]);

  assert.ok(
    errors.some(
      (error) =>
        error.path === "mockSkins[0].startingPrice" &&
        error.message.includes("non-negative"),
    ),
  );
});
