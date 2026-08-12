import type { MarketDataProviderName } from "../../types/data-provider.ts";
import type {
  MarketSyncErrorCode,
  MarketSyncHealthRun,
  MarketSyncHealthStore,
} from "../../types/market-sync.ts";

export type MarketSyncHealth = {
  readonly state: "healthy" | "degraded" | "unknown";
  readonly provider: MarketDataProviderName;
  readonly lastSuccess: MarketSyncHealthRun | null;
  readonly lastFailure: MarketSyncHealthRun | null;
};

const HEALTH_ERROR_CODES = new Set<MarketSyncErrorCode>([
  "PROVIDER_UNAVAILABLE",
  "AUTH_REQUIRED",
  "RATE_LIMITED",
  "INVALID_RESPONSE",
  "NORMALIZATION_ERROR",
  "SYNC_WRITE_FAILED",
  "STALE_SYNC_RECOVERED",
  "TIMEOUT",
]);

function sanitizeRun(run: MarketSyncHealthRun | null) {
  if (run === null) {
    return null;
  }

  return {
    provider: run.provider,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    status: run.status,
    received: run.received,
    written: run.written,
    errorCode:
      run.errorCode === null
        ? null
        : HEALTH_ERROR_CODES.has(run.errorCode as MarketSyncErrorCode)
          ? (run.errorCode as MarketSyncErrorCode)
          : "UNKNOWN",
  } satisfies MarketSyncHealthRun;
}

function isAfter(
  candidate: MarketSyncHealthRun,
  reference: MarketSyncHealthRun,
) {
  return Date.parse(candidate.completedAt) > Date.parse(reference.completedAt);
}

export async function getMarketSyncHealth(
  store: MarketSyncHealthStore,
  provider: MarketDataProviderName,
): Promise<MarketSyncHealth> {
  const [successRun, failureRun] = await Promise.all([
    store.getLatestMarketSyncRun(provider, "success"),
    store.getLatestMarketSyncRun(provider, "failed"),
  ]);
  const lastSuccess = sanitizeRun(successRun);
  const lastFailure = sanitizeRun(failureRun);

  const state =
    lastSuccess === null && lastFailure === null
      ? "unknown"
      : lastFailure !== null &&
          (lastSuccess === null || isAfter(lastFailure, lastSuccess))
        ? "degraded"
        : "healthy";

  return {
    state,
    provider,
    lastSuccess,
    lastFailure,
  };
}
