import { ALL_MARKET_FILTER_VALUE } from "@/types/market";
import type { MarketListingSortOption } from "@/types/market";

type MarketListingFiltersProps = {
  searchTerm: string;
  selectedWeapon: string;
  selectedExterior: string;
  sortOption: MarketListingSortOption;
  weaponOptions: readonly string[];
  exteriorOptions: readonly string[];
  onSearchTermChange: (value: string) => void;
  onWeaponChange: (value: string) => void;
  onExteriorChange: (value: string) => void;
  onSortChange: (value: MarketListingSortOption) => void;
  onReset: () => void;
};

const controlClassName =
  "mt-2 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

const sortOptions = [
  { value: "default", label: "默认排序" },
  { value: "price-asc", label: "价格从低到高" },
  { value: "price-desc", label: "价格从高到低" },
] satisfies readonly {
  value: MarketListingSortOption;
  label: string;
}[];

export default function MarketListingFilters({
  searchTerm,
  selectedWeapon,
  selectedExterior,
  sortOption,
  weaponOptions,
  exteriorOptions,
  onSearchTermChange,
  onWeaponChange,
  onExteriorChange,
  onSortChange,
  onReset,
}: MarketListingFiltersProps) {
  return (
    <section
      aria-labelledby="real-market-filters-heading"
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6"
    >
      <h2 id="real-market-filters-heading" className="text-lg font-semibold">
        搜索与筛选
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="min-w-0 text-sm font-medium text-zinc-300 md:col-span-2 xl:col-span-2">
          关键词
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="搜索饰品或武器名称"
            className={controlClassName}
          />
        </label>

        <label className="min-w-0 text-sm font-medium text-zinc-300">
          武器
          <select
            value={selectedWeapon}
            onChange={(event) => onWeaponChange(event.target.value)}
            className={controlClassName}
          >
            <option value={ALL_MARKET_FILTER_VALUE}>全部</option>
            {weaponOptions.map((weapon) => (
              <option key={weapon} value={weapon}>
                {weapon}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 text-sm font-medium text-zinc-300">
          磨损
          <select
            value={selectedExterior}
            onChange={(event) => onExteriorChange(event.target.value)}
            className={controlClassName}
          >
            <option value={ALL_MARKET_FILTER_VALUE}>全部</option>
            {exteriorOptions.map((exterior) => (
              <option key={exterior} value={exterior}>
                {exterior}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 text-sm font-medium text-zinc-300">
          排序
          <select
            value={sortOption}
            onChange={(event) =>
              onSortChange(event.target.value as MarketListingSortOption)
            }
            className={controlClassName}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="w-full self-end rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-orange-500 hover:text-white focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
        >
          重置筛选
        </button>
      </div>
    </section>
  );
}
