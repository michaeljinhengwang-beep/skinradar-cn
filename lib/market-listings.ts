import { ALL_MARKET_FILTER_VALUE } from "../types/market.ts";
import type {
  MarketDisplayListing,
  MarketListingQueryOptions,
  MarketListingSortOption,
} from "../types/market.ts";

type IndexedListing = {
  readonly listing: MarketDisplayListing;
  readonly index: number;
};

export type MarketListingPriceDisplay = {
  readonly amount: string;
  readonly currencyLabel: "CAD" | "USD" | "币种未确认";
  readonly currencyConfirmed: boolean;
};

export function getMarketListingFilterOptions(
  listings: readonly MarketDisplayListing[],
) {
  const weapons = new Set<string>();
  const exteriors = new Set<string>();

  for (const listing of listings) {
    if (listing.weapon) {
      weapons.add(listing.weapon);
    }
    if (listing.exterior) {
      exteriors.add(listing.exterior);
    }
  }

  return {
    weapons: [...weapons].sort((first, second) =>
      first.localeCompare(second),
    ),
    exteriors: [...exteriors].sort((first, second) =>
      first.localeCompare(second),
    ),
  };
}

export function filterMarketListings(
  listings: readonly MarketDisplayListing[],
  options: Omit<MarketListingQueryOptions, "sort">,
) {
  const normalizedQuery = options.query.trim().toLowerCase();

  return listings.filter((listing) => {
    const searchValues = [
      listing.marketHashName,
      listing.weapon,
      listing.skinName,
    ];
    const matchesQuery =
      normalizedQuery.length === 0 ||
      searchValues.some((value) =>
        value?.toLowerCase().includes(normalizedQuery),
      );
    const matchesWeapon =
      options.weapon === ALL_MARKET_FILTER_VALUE ||
      listing.weapon === options.weapon;
    const matchesExterior =
      options.exterior === ALL_MARKET_FILTER_VALUE ||
      listing.exterior === options.exterior;

    return matchesQuery && matchesWeapon && matchesExterior;
  });
}

export function sortMarketListings(
  listings: readonly MarketDisplayListing[],
  sort: MarketListingSortOption,
) {
  if (sort === "default") {
    return [...listings];
  }

  const direction = sort === "price-asc" ? 1 : -1;
  return listings
    .map<IndexedListing>((listing, index) => ({ listing, index }))
    .sort(
      (first, second) =>
        (first.listing.price - second.listing.price) * direction ||
        first.index - second.index,
    )
    .map(({ listing }) => listing);
}

export function queryMarketListings(
  listings: readonly MarketDisplayListing[],
  options: MarketListingQueryOptions,
) {
  return sortMarketListings(
    filterMarketListings(listings, options),
    options.sort,
  );
}

export function formatMarketListingPrice(
  listing: Pick<MarketDisplayListing, "price" | "currency">,
): MarketListingPriceDisplay {
  return {
    amount: listing.price.toFixed(2),
    currencyLabel:
      listing.currency === "UNSPECIFIED"
        ? "币种未确认"
        : listing.currency,
    currencyConfirmed: listing.currency !== "UNSPECIFIED",
  };
}
