import type { MarketDataProvider } from "../../types/data-provider.ts";
import { MarketProviderError } from "./errors.ts";

type CsfloatMarketProviderConfig = {
  readonly apiKey?: string;
};

export function createCsfloatMarketProvider({
  apiKey,
}: CsfloatMarketProviderConfig): MarketDataProvider {
  const hasApiKey = Boolean(apiKey?.trim());

  function assertReady() {
    if (!hasApiKey) {
      throw new MarketProviderError(
        "AUTH_REQUIRED",
        "csfloat",
        "CSFloat provider requires a server-side API key.",
      );
    }

    throw new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "csfloat",
      "CSFloat provider is not enabled until its official endpoint and response schema are verified.",
    );
  }

  return {
    name: "csfloat",
    async getListings() {
      assertReady();
      return [];
    },
    async getSkinByExternalId(externalId) {
      void externalId;
      assertReady();
      return undefined;
    },
    async healthCheck() {
      return { provider: "csfloat", available: false };
    },
  };
}
