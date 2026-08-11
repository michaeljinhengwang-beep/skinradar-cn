import type {
  MarketDataProvider,
  MarketDataProviderName,
} from "../../types/data-provider.ts";
import { createCsfloatMarketProvider } from "./csfloat-market-provider.ts";
import { mockMarketDataProvider } from "./mock-market-provider.ts";

export type MarketProviderEnvironment = Readonly<
  Record<string, string | undefined>
>;

export function resolveMarketDataProviderName(
  value?: string,
): MarketDataProviderName {
  const normalizedValue = value?.trim().toLowerCase();
  return normalizedValue === "csfloat" ? "csfloat" : "mock";
}

export function getMarketDataProvider(
  environment: MarketProviderEnvironment = process.env,
): MarketDataProvider {
  const providerName = resolveMarketDataProviderName(
    environment.MARKET_DATA_PROVIDER,
  );

  if (providerName === "csfloat") {
    return createCsfloatMarketProvider({
      apiKey: environment.CSFLOAT_API_KEY,
    });
  }

  return mockMarketDataProvider;
}
