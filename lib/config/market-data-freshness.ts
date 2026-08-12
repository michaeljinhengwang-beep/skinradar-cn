export const DEFAULT_MARKET_DATA_STALE_AFTER_SECONDS = 1_800;

export type MarketDataFreshness = "fresh" | "stale" | "unknown";
export type MarketDataFreshnessEnvironment = Readonly<
  Record<string, string | undefined>
>;

export function resolveMarketDataStaleAfterSeconds(
  value?: string | number,
) {
  if (value === undefined || value === "") {
    return DEFAULT_MARKET_DATA_STALE_AFTER_SECONDS;
  }

  const parsed = typeof value === "number" ? value : Number(value.trim());
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_MARKET_DATA_STALE_AFTER_SECONDS;
  }

  return parsed;
}

export function getMarketDataStaleAfterSeconds(
  environment: MarketDataFreshnessEnvironment = process.env,
) {
  return resolveMarketDataStaleAfterSeconds(
    environment.MARKET_DATA_STALE_AFTER_SECONDS,
  );
}

export function getMarketDataFreshness(
  lastSuccessfulSyncAt: string | null | undefined,
  {
    now = new Date(),
    staleAfterSeconds = DEFAULT_MARKET_DATA_STALE_AFTER_SECONDS,
  }: {
    readonly now?: Date;
    readonly staleAfterSeconds?: number;
  } = {},
): MarketDataFreshness {
  if (!lastSuccessfulSyncAt) {
    return "unknown";
  }

  const completedAt = Date.parse(lastSuccessfulSyncAt);
  const currentTime = now.getTime();
  if (!Number.isFinite(completedAt) || !Number.isFinite(currentTime)) {
    return "unknown";
  }

  const threshold = resolveMarketDataStaleAfterSeconds(staleAfterSeconds);
  return currentTime - completedAt < threshold * 1_000 ? "fresh" : "stale";
}
