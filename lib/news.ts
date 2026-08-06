import type {
  NewsArticle,
  NewsFilterOptions,
  NewsQueryOptions,
  NewsSortOption,
} from "../types/news.ts";

function compareText(first: string, second: string): number {
  return first.localeCompare(second, "en", { sensitivity: "base" });
}

function compareNewest(first: NewsArticle, second: NewsArticle): number {
  return (
    second.publishedAt.localeCompare(first.publishedAt) ||
    compareText(first.id, second.id)
  );
}

function stableSort(
  articles: readonly NewsArticle[],
  compare: (first: NewsArticle, second: NewsArticle) => number,
): NewsArticle[] {
  return articles
    .map((article, index) => ({ article, index }))
    .sort((first, second) => {
      const compared = compare(first.article, second.article);
      return compared === 0 ? first.index - second.index : compared;
    })
    .map(({ article }) => article);
}

export function getNewsById(
  articles: readonly NewsArticle[],
  id: string,
): NewsArticle | undefined {
  return articles.find((article) => article.id === id);
}

export function getNewsBySlug(
  articles: readonly NewsArticle[],
  slug: string,
): NewsArticle | undefined {
  return articles.find((article) => article.slug === slug);
}

export function searchNews(
  articles: readonly NewsArticle[],
  query: string,
): NewsArticle[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");

  if (!normalizedQuery) {
    return [...articles];
  }

  return articles.filter((article) =>
    [
      article.title,
      article.summary,
      article.author,
      article.sourceLabel,
      ...article.tags,
    ].some((value) =>
      value.toLocaleLowerCase("en").includes(normalizedQuery),
    ),
  );
}

export function filterNews(
  articles: readonly NewsArticle[],
  options: NewsFilterOptions,
): NewsArticle[] {
  return searchNews(articles, options.query).filter(
    (article) =>
      (options.category === "all" ||
        article.category === options.category) &&
      (options.region === "all" || article.region === options.region) &&
      (options.tag === "all" || article.tags.includes(options.tag)),
  );
}

export function sortNews(
  articles: readonly NewsArticle[],
  sort: NewsSortOption,
): NewsArticle[] {
  switch (sort) {
    case "newest":
      return stableSort(articles, compareNewest);
    case "oldest":
      return stableSort(
        articles,
        (first, second) =>
          first.publishedAt.localeCompare(second.publishedAt) ||
          compareText(first.id, second.id),
      );
    case "popularity-high":
      return stableSort(
        articles,
        (first, second) =>
          second.popularityScore - first.popularityScore ||
          compareNewest(first, second),
      );
    case "reading-time-low":
      return stableSort(
        articles,
        (first, second) =>
          first.readingTimeMinutes - second.readingTimeMinutes ||
          compareNewest(first, second),
      );
    case "reading-time-high":
      return stableSort(
        articles,
        (first, second) =>
          second.readingTimeMinutes - first.readingTimeMinutes ||
          compareNewest(first, second),
      );
  }
}

export function queryNews(
  articles: readonly NewsArticle[],
  options: NewsQueryOptions,
): NewsArticle[] {
  return sortNews(filterNews(articles, options), options.sort);
}

export function getFeaturedNews(
  articles: readonly NewsArticle[],
): NewsArticle[] {
  return sortNews(
    articles.filter((article) => article.isFeatured),
    "newest",
  );
}

function countSharedTags(
  first: NewsArticle,
  second: NewsArticle,
): number {
  const secondTags = new Set(second.tags);
  return first.tags.filter((tag) => secondTags.has(tag)).length;
}

export function getRelatedNews(
  articles: readonly NewsArticle[],
  currentArticle: NewsArticle,
  limit: number,
): NewsArticle[] {
  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  return stableSort(
    articles.filter((article) => article.id !== currentArticle.id),
    (first, second) => {
      const firstCategoryMatch = first.category === currentArticle.category;
      const secondCategoryMatch = second.category === currentArticle.category;

      if (firstCategoryMatch !== secondCategoryMatch) {
        return firstCategoryMatch ? -1 : 1;
      }

      return (
        countSharedTags(second, currentArticle) -
          countSharedTags(first, currentArticle) ||
        second.publishedAt.localeCompare(first.publishedAt) ||
        compareText(first.slug, second.slug)
      );
    },
  ).slice(0, Math.floor(limit));
}
