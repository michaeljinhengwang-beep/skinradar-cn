import type {
  NewsCategory,
  NewsFilterOptions,
  NewsRegion,
  NewsSortOption,
  NewsTag,
} from "@/types/news";

interface NewsFiltersProps {
  filters: NewsFilterOptions;
  sort: NewsSortOption;
  categories: readonly NewsCategory[];
  regions: readonly NewsRegion[];
  tags: readonly NewsTag[];
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: NewsFilterOptions["category"]) => void;
  onRegionChange: (region: NewsFilterOptions["region"]) => void;
  onTagChange: (tag: NewsFilterOptions["tag"]) => void;
  onSortChange: (sort: NewsSortOption) => void;
  onReset: () => void;
}

const categoryLabels: Record<NewsCategory, string> = {
  Tournament: "赛事观察",
  Team: "战队栏目",
  Player: "选手栏目",
  Update: "版本讨论",
  Market: "市场专题",
  Community: "社区内容",
};

const regionLabels: Record<NewsRegion, string> = {
  Global: "全球",
  Europe: "欧洲",
  "North America": "北美",
  "South America": "南美",
  Asia: "亚洲",
  Oceania: "大洋洲",
  CIS: "独联体地区",
  Other: "其他",
};

const controlClassName =
  "mt-2 min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25";

export default function NewsFilters({
  filters,
  sort,
  categories,
  regions,
  tags,
  onQueryChange,
  onCategoryChange,
  onRegionChange,
  onTagChange,
  onSortChange,
  onReset,
}: NewsFiltersProps) {
  return (
    <section
      aria-labelledby="news-filters-heading"
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5"
    >
      <h2 id="news-filters-heading" className="text-lg font-semibold text-zinc-50">
        搜索与筛选
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7 xl:items-end">
        <label className="min-w-0 text-sm text-zinc-300 xl:col-span-2">
          关键词
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="搜索标题、摘要、作者、来源或标签"
            className={controlClassName}
          />
        </label>

        <label className="min-w-0 text-sm text-zinc-300">
          分类
          <select
            value={filters.category}
            onChange={(event) =>
              onCategoryChange(
                event.target.value as NewsFilterOptions["category"],
              )
            }
            className={controlClassName}
          >
            <option value="all">全部分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 text-sm text-zinc-300">
          地区
          <select
            value={filters.region}
            onChange={(event) =>
              onRegionChange(event.target.value as NewsFilterOptions["region"])
            }
            className={controlClassName}
          >
            <option value="all">全部地区</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {regionLabels[region]}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 text-sm text-zinc-300">
          标签
          <select
            value={filters.tag}
            onChange={(event) =>
              onTagChange(event.target.value as NewsFilterOptions["tag"])
            }
            className={controlClassName}
          >
            <option value="all">全部标签</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 text-sm text-zinc-300">
          排序
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as NewsSortOption)
            }
            className={controlClassName}
          >
            <option value="newest">发布时间：从新到旧</option>
            <option value="oldest">发布时间：从旧到新</option>
            <option value="popularity-high">模拟热度：从高到低</option>
            <option value="reading-time-low">阅读时间：从短到长</option>
            <option value="reading-time-high">阅读时间：从长到短</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="min-h-11 rounded-lg border border-orange-500/60 px-4 text-sm font-medium text-orange-300 transition-colors hover:bg-orange-500/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          重置筛选
        </button>
      </div>
    </section>
  );
}
