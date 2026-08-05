import { ALL_MARKET_FILTER_VALUE } from "@/types/market";
import type {
  ExteriorType,
  MarketFilterOptions,
  MarketSortOption,
  SkinRarity,
  WeaponType,
} from "@/types/market";

type MarketFiltersProps = {
  searchTerm: string;
  selectedWeapon: MarketFilterOptions["weapon"];
  selectedExterior: MarketFilterOptions["exterior"];
  selectedRarity: MarketFilterOptions["rarity"];
  sortOption: MarketSortOption;
  weaponOptions: readonly WeaponType[];
  exteriorOptions: readonly ExteriorType[];
  rarityOptions: readonly SkinRarity[];
  onSearchTermChange: (value: string) => void;
  onWeaponChange: (value: MarketFilterOptions["weapon"]) => void;
  onExteriorChange: (value: MarketFilterOptions["exterior"]) => void;
  onRarityChange: (value: MarketFilterOptions["rarity"]) => void;
  onSortChange: (value: MarketSortOption) => void;
  onReset: () => void;
};

const controlClassName =
  "mt-2 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

const sortOptions = [
  { value: "default", label: "默认排序" },
  { value: "price-asc", label: "价格从低到高" },
  { value: "price-desc", label: "价格从高到低" },
  { value: "change-desc", label: "24 小时涨幅从高到低" },
  { value: "change-asc", label: "24 小时跌幅从大到小" },
] satisfies readonly { value: MarketSortOption; label: string }[];

export default function MarketFilters({
  searchTerm,
  selectedWeapon,
  selectedExterior,
  selectedRarity,
  sortOption,
  weaponOptions,
  exteriorOptions,
  rarityOptions,
  onSearchTermChange,
  onWeaponChange,
  onExteriorChange,
  onRarityChange,
  onSortChange,
  onReset,
}: MarketFiltersProps) {
  return (
    <section
      aria-labelledby="market-filters-heading"
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6"
    >
      <h2 id="market-filters-heading" className="text-lg font-semibold">
        搜索与筛选
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        <label className="min-w-0 text-sm font-medium text-zinc-300 md:col-span-2 lg:col-span-1 xl:col-span-2">
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
            onChange={(event) =>
              onWeaponChange(
                event.target.value as MarketFilterOptions["weapon"],
              )
            }
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
            onChange={(event) =>
              onExteriorChange(
                event.target.value as MarketFilterOptions["exterior"],
              )
            }
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
          稀有度
          <select
            value={selectedRarity}
            onChange={(event) =>
              onRarityChange(
                event.target.value as MarketFilterOptions["rarity"],
              )
            }
            className={controlClassName}
          >
            <option value={ALL_MARKET_FILTER_VALUE}>全部</option>
            {rarityOptions.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 text-sm font-medium text-zinc-300">
          排序
          <select
            value={sortOption}
            onChange={(event) =>
              onSortChange(event.target.value as MarketSortOption)
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
          className="w-full self-end rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-orange-500 hover:text-white focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 md:col-span-2 lg:col-span-1 xl:col-span-1"
        >
          重置筛选
        </button>
      </div>
    </section>
  );
}
