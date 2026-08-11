import type { SupabaseServerEnvironment } from "./server-config.ts";

export const DEFAULT_MARKET_SYNC_LOCK_TIMEOUT_SECONDS = 900;

export function resolveMarketSyncLockTimeoutSeconds(
  value?: string | number,
) {
  if (value === undefined || value === "") {
    return DEFAULT_MARKET_SYNC_LOCK_TIMEOUT_SECONDS;
  }

  const parsed = typeof value === "number" ? value : Number(value.trim());
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_MARKET_SYNC_LOCK_TIMEOUT_SECONDS;
  }

  return parsed;
}

export function getMarketSyncLockTimeoutSeconds(
  environment: SupabaseServerEnvironment = process.env,
) {
  return resolveMarketSyncLockTimeoutSeconds(
    environment.MARKET_SYNC_LOCK_TIMEOUT_SECONDS,
  );
}

export function getMarketSyncStaleBefore(
  startedAt: string,
  timeoutSeconds: number,
) {
  const startedAtTime = Date.parse(startedAt);
  if (!Number.isFinite(startedAtTime)) {
    throw new TypeError("Market sync startedAt must be a valid timestamp.");
  }

  const timeout = resolveMarketSyncLockTimeoutSeconds(timeoutSeconds);
  return new Date(startedAtTime - timeout * 1_000).toISOString();
}
