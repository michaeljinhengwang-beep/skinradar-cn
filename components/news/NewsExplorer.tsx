"use client";

import { useMemo, useState } from "react";
import { queryNews } from "@/lib/news";
import {
  NEWS_CATEGORIES,
  NEWS_REGIONS,
  type NewsArticle,
  type NewsFilterOptions,
  type NewsQueryOptions,
  type NewsSortOption,
  type NewsTag,
} from "@/types/news";
import NewsFilters from "./NewsFilters";
import NewsGrid from "./NewsGrid";

interface NewsExplorerProps {
  articles: readonly NewsArticle[];
}

const initialFilters: NewsFilterOptions = {
  query: "",
  category: "all",
  region: "all",
  tag: "all",
};

export default function NewsExplorer({ articles }: NewsExplorerProps) {
  const [filters, setFilters] = useState<NewsFilterOptions>(initialFilters);
  const [sort, setSort] = useState<NewsSortOption>("newest");

  const tags = useMemo(
    () =>
      [...new Set(articles.flatMap((article) => article.tags))].sort((a, b) =>
        a.localeCompare(b, "en"),
      ) as NewsTag[],
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const options: NewsQueryOptions = { ...filters, sort };
    return queryNews(articles, options);
  }, [articles, filters, sort]);

  const updateFilter = <Key extends keyof NewsFilterOptions>(
    key: Key,
    value: NewsFilterOptions[Key],
  ): void => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = (): void => {
    setFilters(initialFilters);
    setSort("newest");
  };

  return (
    <div className="space-y-8">
      <NewsFilters
        filters={filters}
        sort={sort}
        categories={NEWS_CATEGORIES}
        regions={NEWS_REGIONS}
        tags={tags}
        onQueryChange={(query) => updateFilter("query", query)}
        onCategoryChange={(category) => updateFilter("category", category)}
        onRegionChange={(region) => updateFilter("region", region)}
        onTagChange={(tag) => updateFilter("tag", tag)}
        onSortChange={setSort}
        onReset={resetFilters}
      />
      <NewsGrid articles={filteredArticles} />
    </div>
  );
}
