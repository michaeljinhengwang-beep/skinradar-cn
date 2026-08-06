import assert from "node:assert/strict";
import test from "node:test";
import { mockNews } from "../data/mock-news.ts";
import { mockPlayers } from "../data/mock-players.ts";
import { mockSkins } from "../data/mock-skins.ts";
import {
  getHomepageNewsPreview,
  getHomepagePlayerPreview,
  getHomepageSkinPreview,
} from "../lib/home.ts";
import { getNewsBySlug } from "../lib/news.ts";
import { getPlayerById } from "../lib/players.ts";
import { getSkinById } from "../lib/market.ts";

test("skin preview never exceeds the requested limit", () => {
  assert.ok(getHomepageSkinPreview(mockSkins, 4).length <= 4);
});

test("homepage preview functions return empty arrays for zero limits", () => {
  assert.deepEqual(getHomepageSkinPreview(mockSkins, 0), []);
  assert.deepEqual(getHomepagePlayerPreview(mockPlayers, 0), []);
  assert.deepEqual(getHomepageNewsPreview(mockNews, 0), []);
});

test("homepage preview functions safely handle negative and non-finite limits", () => {
  assert.deepEqual(getHomepageSkinPreview(mockSkins, -1), []);
  assert.deepEqual(getHomepagePlayerPreview(mockPlayers, Number.NaN), []);
  assert.deepEqual(getHomepageNewsPreview(mockNews, Number.POSITIVE_INFINITY), []);
});

test("skin preview returns every available skin when the limit is larger", () => {
  const preview = getHomepageSkinPreview(mockSkins, mockSkins.length + 10);

  assert.equal(preview.length, mockSkins.length);
  assert.equal(new Set(preview.map((skin) => skin.id)).size, mockSkins.length);
});

test("skin preview does not mutate its input", () => {
  const before = JSON.stringify(mockSkins);

  getHomepageSkinPreview(mockSkins, 4);

  assert.equal(JSON.stringify(mockSkins), before);
});

test("skin preview is stable and prioritizes StatTrak with weapon variety", () => {
  const first = getHomepageSkinPreview(mockSkins, 4);
  const second = getHomepageSkinPreview(mockSkins, 4);

  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
  assert.equal(first[0].isStatTrak, true);
  assert.equal(new Set(first.map(({ weapon }) => weapon)).size, first.length);
});

test("player preview covers different teams when the limit allows", () => {
  const preview = getHomepagePlayerPreview(mockPlayers, 3);

  assert.equal(preview.length, 3);
  assert.equal(new Set(preview.map(({ team }) => team)).size, 3);
});

test("player preview covers different primary roles when available", () => {
  const preview = getHomepagePlayerPreview(mockPlayers, 3);

  assert.equal(new Set(preview.map(({ roles }) => roles[0])).size, 3);
});

test("player preview does not mutate its input", () => {
  const before = JSON.stringify(mockPlayers);

  getHomepagePlayerPreview(mockPlayers, 3);

  assert.equal(JSON.stringify(mockPlayers), before);
});

test("player preview produces stable results", () => {
  const first = getHomepagePlayerPreview(mockPlayers, 3).map(({ id }) => id);
  const second = getHomepagePlayerPreview(mockPlayers, 3).map(({ id }) => id);

  assert.deepEqual(first, second);
});

test("news preview prioritizes featured articles", () => {
  const preview = getHomepageNewsPreview(mockNews, 3);

  assert.equal(preview.length, 3);
  assert.ok(preview.every(({ isFeatured }) => isFeatured));
});

test("featured homepage news is predictably ordered newest first", () => {
  const dates = getHomepageNewsPreview(mockNews, 3).map(({ publishedAt }) =>
    Date.parse(publishedAt),
  );

  assert.deepEqual(dates, [...dates].sort((first, second) => second - first));
});

test("news preview never contains duplicate articles", () => {
  const preview = getHomepageNewsPreview(mockNews, mockNews.length + 5);

  assert.equal(preview.length, mockNews.length);
  assert.equal(new Set(preview.map(({ id }) => id)).size, preview.length);
});

test("news preview does not mutate its input", () => {
  const before = JSON.stringify(mockNews);

  getHomepageNewsPreview(mockNews, 3);

  assert.equal(JSON.stringify(mockNews), before);
});

test("all homepage preview entries resolve to valid detail data", () => {
  assert.ok(
    getHomepageSkinPreview(mockSkins, 4).every(
      ({ id }) => getSkinById(mockSkins, id)?.id === id,
    ),
  );
  assert.ok(
    getHomepagePlayerPreview(mockPlayers, 3).every(
      ({ id }) => getPlayerById(mockPlayers, id)?.id === id,
    ),
  );
  assert.ok(
    getHomepageNewsPreview(mockNews, 3).every(
      ({ slug }) => getNewsBySlug(mockNews, slug)?.slug === slug,
    ),
  );
});

test("homepage statistics use the exact local mock dataset lengths", () => {
  assert.deepEqual(
    [mockSkins.length, mockPlayers.length, mockNews.length],
    [10, 12, 14],
  );
});
