import { mockSkins } from "../../data/mock-skins.ts";
import type { Skin } from "../../types/market.ts";
import type {
  ExternalMarketListing,
  MarketDataProvider,
} from "../../types/data-provider.ts";

function toExternalMarketListing(skin: Skin): ExternalMarketListing {
  return {
    externalId: skin.id,
    marketHashName: skin.name,
    weapon: skin.weapon,
    skinName: skin.skinName,
    exterior: skin.exterior,
    price: skin.startingPrice,
    currency: "CAD",
    floatValue: null,
    listingUrl: null,
    provider: "mock",
    observedAt: skin.platforms[0]?.updatedAt ?? "2026-07-15T12:00:00Z",
  };
}

export const mockMarketDataProvider: MarketDataProvider = {
  name: "mock",
  async getListings() {
    return mockSkins.map(toExternalMarketListing);
  },
  async getSkinByExternalId(externalId) {
    const skin = mockSkins.find(({ id }) => id === externalId);
    return skin ? toExternalMarketListing(skin) : undefined;
  },
  async healthCheck() {
    return { provider: "mock", available: true };
  },
};
