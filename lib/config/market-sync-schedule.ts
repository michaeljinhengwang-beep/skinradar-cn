import type { MarketDataProviderName } from "../../types/data-provider.ts";
import { getMarketSyncLockTimeoutSeconds } from "../supabase/market-sync-lock.ts";

export const DEFAULT_MARKET_SYNC_MAX_RUN_SECONDS = 60;
export const MAX_MARKET_SYNC_RUN_SECONDS = 300;
export const MARKET_SYNC_SCHEDULE_PROVIDER_ALLOWLIST = ["mock"] as const;

export type MarketSyncScheduleEnvironment = Readonly<
  Record<string, string | undefined>
>;

export type MarketSyncScheduleConfig = {
  readonly enabled: boolean;
  readonly provider: Extract<MarketDataProviderName, "mock"> | null;
  readonly expectedCadence: "manual";
  readonly maxRunSeconds: number;
  readonly staleLockSeconds: number;
};

export function resolveMarketSyncMaxRunSeconds(value?: string | number) {
  if (value === undefined || value === "") {
    return DEFAULT_MARKET_SYNC_MAX_RUN_SECONDS;
  }

  const parsed = typeof value === "number" ? value : Number(value.trim());
  if (
    !Number.isInteger(parsed) ||
    parsed <= 0 ||
    parsed > MAX_MARKET_SYNC_RUN_SECONDS
  ) {
    return DEFAULT_MARKET_SYNC_MAX_RUN_SECONDS;
  }

  return parsed;
}

export function getMarketSyncScheduleConfig(
  environment: MarketSyncScheduleEnvironment = process.env,
): MarketSyncScheduleConfig {
  const configuredProvider =
    environment.MARKET_SYNC_PROVIDER?.trim().toLowerCase() || "mock";

  return {
    enabled:
      environment.MARKET_SYNC_ENABLED?.trim().toLowerCase() === "true",
    provider: configuredProvider === "mock" ? "mock" : null,
    expectedCadence: "manual",
    maxRunSeconds: resolveMarketSyncMaxRunSeconds(
      environment.MARKET_SYNC_MAX_RUN_SECONDS,
    ),
    staleLockSeconds: getMarketSyncLockTimeoutSeconds(environment),
  };
}
