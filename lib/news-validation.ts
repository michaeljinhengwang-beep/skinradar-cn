import {
  NEWS_CATEGORIES,
  NEWS_REGIONS,
  NEWS_SOURCE_LABELS,
  NEWS_TAGS,
  type NewsArticle,
} from "../types/news.ts";

export interface NewsValidationError {
  path: string;
  message: string;
}

const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SIMULATED_TITLE_PATTERN = /(模拟|演示)/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value) && Number.isFinite(Date.parse(value));
}

export function validateMockNews(
  articles: readonly NewsArticle[],
): NewsValidationError[] {
  const errors: NewsValidationError[] = [];
  const ids = new Map<string, number>();
  const slugs = new Map<string, number>();

  const addError = (path: string, message: string): void => {
    errors.push({ path, message });
  };

  articles.forEach((article, index) => {
    const path = `mockNews[${index}]`;
    const id = article.id.trim();
    const slug = article.slug.trim();

    if (!id) {
      addError(`${path}.id`, "must not be empty");
    } else {
      const firstIndex = ids.get(id);
      if (firstIndex !== undefined) {
        addError(
          `${path}.id`,
          `must be unique; already used by mockNews[${firstIndex}].id`,
        );
      } else {
        ids.set(id, index);
      }
    }

    if (!slug) {
      addError(`${path}.slug`, "must not be empty");
    } else {
      const firstIndex = slugs.get(slug);
      if (firstIndex !== undefined) {
        addError(
          `${path}.slug`,
          `must be unique; already used by mockNews[${firstIndex}].slug`,
        );
      } else {
        slugs.set(slug, index);
      }
      if (!SAFE_SLUG_PATTERN.test(slug)) {
        addError(
          `${path}.slug`,
          "must contain only lowercase letters, numbers, and hyphens",
        );
      }
    }

    if (!isNonEmptyString(article.title)) {
      addError(`${path}.title`, "must not be empty");
    } else if (!SIMULATED_TITLE_PATTERN.test(article.title)) {
      addError(`${path}.title`, "must clearly indicate simulated content");
    }
    if (!isNonEmptyString(article.summary)) {
      addError(`${path}.summary`, "must not be empty");
    }
    if (!isNonEmptyString(article.contentPreview)) {
      addError(`${path}.contentPreview`, "must not be empty");
    }
    if (!NEWS_CATEGORIES.includes(article.category)) {
      addError(`${path}.category`, "must be an allowed news category");
    }
    if (!NEWS_REGIONS.includes(article.region)) {
      addError(`${path}.region`, "must be an allowed news region");
    }

    if (article.tags.length === 0) {
      addError(`${path}.tags`, "must contain at least one tag");
    }
    const articleTags = new Set<string>();
    article.tags.forEach((tag, tagIndex) => {
      const tagPath = `${path}.tags[${tagIndex}]`;
      if (!NEWS_TAGS.includes(tag)) {
        addError(tagPath, "must be an allowed news tag");
      }
      if (articleTags.has(tag)) {
        addError(tagPath, "duplicates another tag");
      } else {
        articleTags.add(tag);
      }
    });

    if (!isNonEmptyString(article.author)) {
      addError(`${path}.author`, "must not be empty");
    }
    if (!NEWS_SOURCE_LABELS.includes(article.sourceLabel)) {
      addError(
        `${path}.sourceLabel`,
        "must use an approved simulated source label",
      );
    }

    const publishedAtIsValid = isValidIsoDate(article.publishedAt);
    const updatedAtIsValid = isValidIsoDate(article.updatedAt);
    if (!publishedAtIsValid) {
      addError(`${path}.publishedAt`, "must be a valid ISO date");
    }
    if (!updatedAtIsValid) {
      addError(`${path}.updatedAt`, "must be a valid ISO date");
    }
    if (
      publishedAtIsValid &&
      updatedAtIsValid &&
      article.updatedAt.localeCompare(article.publishedAt) < 0
    ) {
      addError(`${path}.updatedAt`, "must not be earlier than publishedAt");
    }

    if (
      !Number.isInteger(article.readingTimeMinutes) ||
      article.readingTimeMinutes <= 0
    ) {
      addError(`${path}.readingTimeMinutes`, "must be a positive integer");
    }
    if (
      !Number.isFinite(article.popularityScore) ||
      !Number.isInteger(article.popularityScore) ||
      article.popularityScore < 0 ||
      article.popularityScore > 100
    ) {
      addError(
        `${path}.popularityScore`,
        "must be an integer between 0 and 100",
      );
    }
    if (typeof article.isFeatured !== "boolean") {
      addError(`${path}.isFeatured`, "must be a boolean");
    }
  });

  if (articles.length < 12) {
    addError("mockNews", "must include at least 12 articles");
  }
  if (articles.filter((article) => article.isFeatured).length < 3) {
    addError("mockNews", "must include at least 3 featured articles");
  }

  NEWS_CATEGORIES.forEach((category) => {
    if (!articles.some((article) => article.category === category)) {
      addError("mockNews", `must include the ${category} category`);
    }
  });

  if (new Set(articles.map((article) => article.region)).size < 5) {
    addError("mockNews", "must include at least 5 regions");
  }
  if (new Set(articles.flatMap((article) => article.tags)).size < 8) {
    addError("mockNews", "must include at least 8 distinct tags");
  }

  return errors;
}
