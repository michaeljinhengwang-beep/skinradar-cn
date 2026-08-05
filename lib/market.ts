import { ALL_MARKET_FILTER_VALUE } from "../types/market.ts";
import type {
  MarketFilterOptions,
  MarketQueryOptions,
  MarketSortOption,
  PlatformQuote,
  PriceHistoryOrder,
  PriceHistoryPoint,
  Skin,
} from "../types/market.ts";

type IndexedValue<T> = {
  value: T;
  index: number;
};

function stableSort<T>(
  values: readonly T[],
  compare: (first: T, second: T) => number,
) {
  return values
    .map<IndexedValue<T>>((value, index) => ({ value, index }))
    .sort(
      (first, second) =>
        compare(first.value, second.value) || first.index - second.index,
    )
    .map(({ value }) => value);
}

export function getSkinById(skins: readonly Skin[], id: string) {
  return skins.find((skin) => skin.id === id);
}

export function searchSkins(skins: readonly Skin[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return [...skins];
  }

  return skins.filter(
    (skin) =>
      skin.name.toLowerCase().includes(normalizedQuery) ||
      skin.weapon.toLowerCase().includes(normalizedQuery) ||
      skin.skinName.toLowerCase().includes(normalizedQuery),
  );
}

export function filterSkins(
  skins: readonly Skin[],
  options: MarketFilterOptions,
) {
  return searchSkins(skins, options.query).filter((skin) => {
    const matchesWeapon =
      options.weapon === ALL_MARKET_FILTER_VALUE ||
      skin.weapon === options.weapon;
    const matchesExterior =
      options.exterior === ALL_MARKET_FILTER_VALUE ||
      skin.exterior === options.exterior;
    const matchesRarity =
      options.rarity === ALL_MARKET_FILTER_VALUE ||
      skin.rarity === options.rarity;

    return matchesWeapon && matchesExterior && matchesRarity;
  });
}

export function sortSkins(
  skins: readonly Skin[],
  sortOption: MarketSortOption,
) {
  switch (sortOption) {
    case "price-asc":
      return stableSort(
        skins,
        (first, second) => first.startingPrice - second.startingPrice,
      );
    case "price-desc":
      return stableSort(
        skins,
        (first, second) => second.startingPrice - first.startingPrice,
      );
    case "change-desc":
      return stableSort(
        skins,
        (first, second) => second.priceChange24h - first.priceChange24h,
      );
    case "change-asc":
      return stableSort(
        skins,
        (first, second) => first.priceChange24h - second.priceChange24h,
      );
    default:
      return [...skins];
  }
}

export function querySkins(
  skins: readonly Skin[],
  options: MarketQueryOptions,
) {
  return sortSkins(filterSkins(skins, options), options.sort);
}

export function sortPlatformQuotesByPrice(
  quotes: readonly PlatformQuote[],
) {
  return stableSort(quotes, (first, second) => first.price - second.price);
}

export function sortPriceHistoryByDate(
  history: readonly PriceHistoryPoint[],
  order: PriceHistoryOrder = "asc",
) {
  const direction = order === "asc" ? 1 : -1;

  return stableSort(
    history,
    (first, second) => first.date.localeCompare(second.date) * direction,
  );
}
