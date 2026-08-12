export const WEAPON_TYPES = [
  "AK-47",
  "M4A1-S",
  "AWP",
  "Glock-18",
  "USP-S",
  "Knife",
] as const;

export const EXTERIOR_TYPES = [
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred",
] as const;

export const RARITY_TYPES = [
  "Consumer",
  "Industrial",
  "Mil-Spec",
  "Restricted",
  "Classified",
  "Covert",
  "Extraordinary",
] as const;

export const DEMO_MARKETS = [
  "Demo Market A",
  "Demo Market B",
  "Demo Market C",
] as const;

export const ALL_MARKET_FILTER_VALUE = "all" as const;

export const MARKET_SORT_OPTIONS = [
  "default",
  "price-asc",
  "price-desc",
  "change-desc",
  "change-asc",
] as const;

export type WeaponType = (typeof WEAPON_TYPES)[number];
export type ExteriorType = (typeof EXTERIOR_TYPES)[number];
export type SkinRarity = (typeof RARITY_TYPES)[number];
export type DemoMarket = (typeof DEMO_MARKETS)[number];
export type CurrencyCode = "CAD";
export type AllMarketFilterValue = typeof ALL_MARKET_FILTER_VALUE;
export type MarketSortOption = (typeof MARKET_SORT_OPTIONS)[number];
export type PriceHistoryOrder = "asc" | "desc";

export const MARKET_LISTING_SORT_OPTIONS = [
  "default",
  "price-asc",
  "price-desc",
] as const;

export type MarketListingSortOption =
  (typeof MARKET_LISTING_SORT_OPTIONS)[number];

export type MarketDisplayListing = {
  readonly id: string;
  readonly externalId: string;
  readonly provider: "csfloat";
  readonly marketHashName: string;
  readonly weapon: string | null;
  readonly skinName: string | null;
  readonly exterior: string | null;
  readonly price: number;
  readonly currency: "CAD" | "USD" | "UNSPECIFIED";
  readonly floatValue: number | null;
  readonly observedAt: string;
};

export type MarketListingQueryOptions = {
  readonly query: string;
  readonly weapon: string | AllMarketFilterValue;
  readonly exterior: string | AllMarketFilterValue;
  readonly sort: MarketListingSortOption;
};

export type MarketFilterOptions = {
  query: string;
  weapon: WeaponType | AllMarketFilterValue;
  exterior: ExteriorType | AllMarketFilterValue;
  rarity: SkinRarity | AllMarketFilterValue;
};

export type MarketQueryOptions = MarketFilterOptions & {
  sort: MarketSortOption;
};

export type PlatformQuote = {
  platform: DemoMarket;
  price: number;
  currency: CurrencyCode;
  listings: number;
  updatedAt: string;
};

export type PriceHistoryPoint = {
  date: string;
  price: number;
};

export type Skin = {
  id: string;
  name: string;
  weapon: WeaponType;
  skinName: string;
  exterior: ExteriorType;
  rarity: SkinRarity;
  image: string | null;
  startingPrice: number;
  priceChange24h: number;
  availableListings: number;
  platforms: PlatformQuote[];
  priceHistory: PriceHistoryPoint[];
  isStatTrak: boolean;
  isSouvenir: boolean;
};
