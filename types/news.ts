export const NEWS_CATEGORIES = [
  "Tournament",
  "Team",
  "Player",
  "Update",
  "Market",
  "Community",
] as const;

export const NEWS_REGIONS = [
  "Global",
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Oceania",
  "CIS",
  "Other",
] as const;

export const NEWS_TAGS = [
  "Strategy",
  "Maps",
  "Training",
  "Lineup",
  "Economy",
  "Skins",
  "Community",
  "Broadcast",
  "Equipment",
  "Analysis",
  "Interface",
  "Workshop",
] as const;

export const NEWS_SOURCE_LABELS = [
  "SkinRadar Demo",
  "Local Mock News",
  "Demo Editorial",
] as const;

export const NEWS_SORT_OPTIONS = [
  "newest",
  "oldest",
  "popularity-high",
  "reading-time-low",
  "reading-time-high",
] as const;

export const ALL_NEWS_FILTER_VALUE = "all" as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
export type NewsRegion = (typeof NEWS_REGIONS)[number];
export type NewsTag = (typeof NEWS_TAGS)[number];
export type NewsSourceLabel = (typeof NEWS_SOURCE_LABELS)[number];
export type NewsSortOption = (typeof NEWS_SORT_OPTIONS)[number];
export type AllNewsFilterValue = typeof ALL_NEWS_FILTER_VALUE;

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  region: NewsRegion;
  tags: NewsTag[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  popularityScore: number;
  isFeatured: boolean;
  image: string | null;
  sourceLabel: NewsSourceLabel;
  contentPreview: string;
}

export interface NewsFilterOptions {
  query: string;
  category: NewsCategory | AllNewsFilterValue;
  region: NewsRegion | AllNewsFilterValue;
  tag: NewsTag | AllNewsFilterValue;
}

export interface NewsQueryOptions extends NewsFilterOptions {
  sort: NewsSortOption;
}
