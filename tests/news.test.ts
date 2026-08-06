import assert from "node:assert/strict";
import test from "node:test";
import { mockNews } from "../data/mock-news.ts";
import {
  filterNews,
  getFeaturedNews,
  getNewsById,
  getNewsBySlug,
  getRelatedNews,
  queryNews,
  searchNews,
  sortNews,
} from "../lib/news.ts";
import { validateMockNews } from "../lib/news-validation.ts";
import type {
  NewsArticle,
  NewsFilterOptions,
  NewsQueryOptions,
} from "../types/news.ts";

const allFilters: NewsFilterOptions = {
  query: "",
  category: "all",
  region: "all",
  tag: "all",
};

const defaultQuery: NewsQueryOptions = {
  ...allFilters,
  sort: "newest",
};

function cloneMockNews(): NewsArticle[] {
  return mockNews.map((article) => ({
    ...article,
    tags: [...article.tags],
    contentSections: [...article.contentSections],
  }));
}

function assertNonDecreasing(values: readonly number[]): void {
  values.slice(1).forEach((value, index) => {
    assert.ok(values[index] <= value);
  });
}

function assertNonIncreasing(values: readonly number[]): void {
  values.slice(1).forEach((value, index) => {
    assert.ok(values[index] >= value);
  });
}

test("getNewsById finds an existing article by exact ID", () => {
  assert.strictEqual(getNewsById(mockNews, mockNews[0].id), mockNews[0]);
});

test("getNewsById returns undefined for an unknown ID", () => {
  assert.equal(getNewsById(mockNews, "missing-demo-news"), undefined);
});

test("getNewsBySlug finds an existing article by exact slug", () => {
  assert.strictEqual(
    getNewsBySlug(mockNews, mockNews[1].slug),
    mockNews[1],
  );
});

test("getNewsBySlug returns undefined for an unknown slug", () => {
  assert.equal(getNewsBySlug(mockNews, "missing-demo-slug"), undefined);
});

test("searchNews ignores English letter casing", () => {
  const lowercaseIds = searchNews(mockNews, "demo news desk").map(
    (article) => article.id,
  );
  const uppercaseIds = searchNews(mockNews, "DEMO NEWS DESK").map(
    (article) => article.id,
  );

  assert.deepEqual(lowercaseIds, uppercaseIds);
  assert.ok(lowercaseIds.length > 0);
});

test("searchNews matches Chinese title text", () => {
  assert.deepEqual(searchNews(mockNews, "地图选择").map(({ id }) => id), [
    "demo-news-map-selection-rhythm",
  ]);
});

test("searchNews matches tags", () => {
  assert.deepEqual(searchNews(mockNews, "Equipment").map(({ id }) => id), [
    "demo-news-equipment-hierarchy",
  ]);
});

test("searchNews matches simulated author labels", () => {
  const results = searchNews(mockNews, "Market Research Demo");

  assert.equal(results.length, 2);
  assert.ok(results.every((article) => article.category === "Market"));
});

test("searchNews trims empty input and returns a safe copy", () => {
  const results = searchNews(mockNews, "   ");

  assert.deepEqual(results, mockNews);
  assert.notStrictEqual(results, mockNews);
});

test("filterNews filters by category", () => {
  const results = filterNews(mockNews, {
    ...allFilters,
    category: "Market",
  });

  assert.ok(results.length > 0);
  assert.ok(results.every((article) => article.category === "Market"));
});

test("filterNews filters by region", () => {
  const results = filterNews(mockNews, { ...allFilters, region: "Asia" });

  assert.ok(results.length > 0);
  assert.ok(results.every((article) => article.region === "Asia"));
});

test("filterNews filters by tag", () => {
  const results = filterNews(mockNews, { ...allFilters, tag: "Workshop" });

  assert.ok(results.length > 0);
  assert.ok(results.every((article) => article.tags.includes("Workshop")));
});

test("queryNews combines keyword, category, region, and tag filters", () => {
  const results = queryNews(mockNews, {
    query: "流动性",
    category: "Market",
    region: "Asia",
    tag: "Skins",
    sort: "newest",
  });

  assert.deepEqual(results.map(({ id }) => id), [
    "demo-news-liquidity-interface",
  ]);
});

test("queryNews returns an empty array when no article matches", () => {
  const results = queryNews(mockNews, {
    ...defaultQuery,
    query: "不存在的新闻关键词",
  });

  assert.deepEqual(results, []);
});

test("sortNews orders publication dates from newest to oldest", () => {
  const timestamps = sortNews(mockNews, "newest").map((article) =>
    Date.parse(article.publishedAt),
  );

  assertNonIncreasing(timestamps);
});

test("sortNews orders publication dates from oldest to newest", () => {
  const timestamps = sortNews(mockNews, "oldest").map((article) =>
    Date.parse(article.publishedAt),
  );

  assertNonDecreasing(timestamps);
});

test("sortNews orders simulated popularity from high to low", () => {
  const values = sortNews(mockNews, "popularity-high").map(
    (article) => article.popularityScore,
  );

  assertNonIncreasing(values);
});

test("sortNews orders reading time from short to long", () => {
  const values = sortNews(mockNews, "reading-time-low").map(
    (article) => article.readingTimeMinutes,
  );

  assertNonDecreasing(values);
});

test("sortNews orders reading time from long to short", () => {
  const values = sortNews(mockNews, "reading-time-high").map(
    (article) => article.readingTimeMinutes,
  );

  assertNonIncreasing(values);
});

test("queryNews does not mutate the source array", () => {
  const originalIds = mockNews.map((article) => article.id);
  const results = queryNews(mockNews, defaultQuery);

  assert.deepEqual(
    mockNews.map((article) => article.id),
    originalIds,
  );
  assert.notStrictEqual(results, mockNews);
});

test("getFeaturedNews returns only featured articles", () => {
  const featured = getFeaturedNews(mockNews);

  assert.equal(featured.length, 3);
  assert.ok(featured.every((article) => article.isFeatured));
});

test("getFeaturedNews uses predictable newest-first ordering", () => {
  assert.deepEqual(getFeaturedNews(mockNews).map(({ id }) => id), [
    "demo-news-training-mode-ideas",
    "demo-news-lineup-framework",
    "demo-news-map-selection-rhythm",
  ]);
});

test("mockNews contains 14 valid fictional articles", () => {
  assert.equal(mockNews.length, 14);
  assert.deepEqual(validateMockNews(mockNews), []);
});

test("validateMockNews reports the exact path for a duplicate slug", () => {
  const invalidNews = cloneMockNews();
  invalidNews[2].slug = invalidNews[1].slug;

  assert.ok(
    validateMockNews(invalidNews).some(
      (error) =>
        error.path === "mockNews[2].slug" &&
        error.message.includes("must be unique"),
    ),
  );
});

test("validateMockNews reports the exact path for an invalid date", () => {
  const invalidNews = cloneMockNews();
  invalidNews[3].publishedAt = "not-an-iso-date";

  assert.ok(
    validateMockNews(invalidNews).some(
      (error) =>
        error.path === "mockNews[3].publishedAt" &&
        error.message === "must be a valid ISO date",
    ),
  );
});

test("validateMockNews reports the exact path for invalid popularity", () => {
  const invalidNews = cloneMockNews();
  invalidNews[4].popularityScore = 101;

  assert.ok(
    validateMockNews(invalidNews).some(
      (error) =>
        error.path === "mockNews[4].popularityScore" &&
        error.message === "must be an integer between 0 and 100",
    ),
  );
});

test("every mock slug resolves to its exact article", () => {
  assert.ok(
    mockNews.every(
      (article) => getNewsBySlug(mockNews, article.slug) === article,
    ),
  );
});

test("all mock slugs are unique", () => {
  const slugs = mockNews.map((article) => article.slug);

  assert.equal(new Set(slugs).size, slugs.length);
});

test("all mock slugs are safe static route parameters", () => {
  const staticParams = mockNews.map((article) => ({ slug: article.slug }));

  assert.equal(staticParams.length, 14);
  assert.ok(
    staticParams.every(
      ({ slug }) =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
        encodeURIComponent(slug) === slug,
    ),
  );
});

test("every article has all fields required by the detail page", () => {
  const textFields = [
    "slug",
    "title",
    "summary",
    "contentPreview",
    "category",
    "region",
    "author",
    "sourceLabel",
    "publishedAt",
    "updatedAt",
  ] as const;

  mockNews.forEach((article) => {
    textFields.forEach((field) => {
      assert.ok(article[field].trim().length > 0);
    });
    assert.ok(article.tags.length > 0);
    assert.ok(article.readingTimeMinutes > 0);
    assert.ok(article.popularityScore >= 0);
    assert.equal(typeof article.isFeatured, "boolean");
  });
});

test("getRelatedNews excludes the current article", () => {
  const currentArticle = mockNews[0];
  const related = getRelatedNews(mockNews, currentArticle, 3);

  assert.ok(related.every((article) => article.id !== currentArticle.id));
});

test("getRelatedNews never exceeds the requested limit", () => {
  assert.equal(getRelatedNews(mockNews, mockNews[0], 2).length, 2);
  assert.ok(getRelatedNews(mockNews, mockNews[0], 100).length <= 13);
});

test("getRelatedNews prioritizes the same category over shared tags", () => {
  const currentArticle = mockNews[0];
  const sameCategory: NewsArticle = {
    ...mockNews[1],
    id: "same-category-candidate",
    slug: "same-category-candidate",
    category: currentArticle.category,
    tags: ["Equipment"],
  };
  const sharedTags: NewsArticle = {
    ...mockNews[2],
    id: "shared-tags-candidate",
    slug: "shared-tags-candidate",
    category: "Update",
    tags: [...currentArticle.tags],
  };

  assert.equal(
    getRelatedNews(
      [currentArticle, sharedTags, sameCategory],
      currentArticle,
      2,
    )[0].id,
    sameCategory.id,
  );
});

test("getRelatedNews prioritizes more shared tags within a category", () => {
  const currentArticle = mockNews[0];
  const oneSharedTag: NewsArticle = {
    ...mockNews[1],
    id: "one-shared-tag",
    slug: "one-shared-tag",
    category: currentArticle.category,
    tags: ["Maps"],
  };
  const twoSharedTags: NewsArticle = {
    ...mockNews[2],
    id: "two-shared-tags",
    slug: "two-shared-tags",
    category: currentArticle.category,
    tags: ["Maps", "Strategy"],
  };

  assert.equal(
    getRelatedNews(
      [currentArticle, oneSharedTag, twoSharedTags],
      currentArticle,
      2,
    )[0].id,
    twoSharedTags.id,
  );
});

test("getRelatedNews produces stable predictable results", () => {
  const firstRun = getRelatedNews(mockNews, mockNews[3], 3).map(
    (article) => article.id,
  );
  const secondRun = getRelatedNews(mockNews, mockNews[3], 3).map(
    (article) => article.id,
  );

  assert.deepEqual(firstRun, secondRun);
});

test("getRelatedNews does not mutate the source array", () => {
  const originalIds = mockNews.map((article) => article.id);

  getRelatedNews(mockNews, mockNews[4], 3);

  assert.deepEqual(
    mockNews.map((article) => article.id),
    originalIds,
  );
});

test("getRelatedNews returns an empty array when limit is zero", () => {
  assert.deepEqual(getRelatedNews(mockNews, mockNews[0], 0), []);
});

test("every mock article has displayable simulated content sections", () => {
  assert.ok(
    mockNews.every(
      (article) =>
        article.contentSections.length >= 2 &&
        article.contentSections.every((section) => section.trim().length > 0),
    ),
  );
});

test("validation reports the exact path for an empty content section", () => {
  const invalidNews = cloneMockNews();
  invalidNews[3].contentSections[1] = "   ";

  assert.ok(
    validateMockNews(invalidNews).some(
      (error) =>
        error.path === "mockNews[3].contentSections[1]" &&
        error.message === "must not be empty",
    ),
  );
});

test("validation reports the exact path for a repeated content section", () => {
  const invalidNews = cloneMockNews();
  invalidNews[5].contentSections[1] = invalidNews[5].contentSections[0];

  assert.ok(
    validateMockNews(invalidNews).some(
      (error) =>
        error.path === "mockNews[5].contentSections[1]" &&
        error.message === "duplicates another content section",
    ),
  );
});
