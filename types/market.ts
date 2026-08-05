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

export type WeaponType = (typeof WEAPON_TYPES)[number];
export type ExteriorType = (typeof EXTERIOR_TYPES)[number];
export type SkinRarity = (typeof RARITY_TYPES)[number];
export type DemoMarket = (typeof DEMO_MARKETS)[number];
export type CurrencyCode = "CAD";

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
