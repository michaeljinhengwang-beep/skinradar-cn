export const MARKET_SYNC_SMOKE_TARGET = {
  provider: "mock",
  externalId: "skinradar-sync-smoke-listing-001",
  cacheKey: "skinradar-sync-smoke-test",
} as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type MarketSyncSmokeCleanupFilter = {
  readonly listing: {
    readonly provider: typeof MARKET_SYNC_SMOKE_TARGET.provider;
    readonly externalId: typeof MARKET_SYNC_SMOKE_TARGET.externalId;
  };
  readonly syncRun: {
    readonly id: string;
  };
  readonly cache: {
    readonly cacheKey: typeof MARKET_SYNC_SMOKE_TARGET.cacheKey;
  };
};

export class MarketSyncSmokeCleanupError extends Error {
  readonly code = "SYNC_SMOKE_CLEANUP_FAILED";

  constructor() {
    super("SYNC_SMOKE_CLEANUP_FAILED");
    this.name = "MarketSyncSmokeCleanupError";
  }
}

export function getMarketSyncSmokeCleanupFilter(
  capturedSyncRunId: string,
  requestedSyncRunId = capturedSyncRunId,
): MarketSyncSmokeCleanupFilter {
  if (
    !UUID_PATTERN.test(capturedSyncRunId) ||
    requestedSyncRunId !== capturedSyncRunId ||
    !UUID_PATTERN.test(requestedSyncRunId) ||
    !MARKET_SYNC_SMOKE_TARGET.externalId.includes("sync-smoke") ||
    !MARKET_SYNC_SMOKE_TARGET.cacheKey.includes("smoke-test")
  ) {
    throw new Error("SYNC_SMOKE_GUARD_REJECTED");
  }

  return {
    listing: {
      provider: MARKET_SYNC_SMOKE_TARGET.provider,
      externalId: MARKET_SYNC_SMOKE_TARGET.externalId,
    },
    syncRun: { id: requestedSyncRunId },
    cache: { cacheKey: MARKET_SYNC_SMOKE_TARGET.cacheKey },
  };
}

export async function runWithMarketSyncSmokeCleanup<Result>(
  operation: (captureSyncRunId: (runId: string) => void) => Promise<Result>,
  cleanup: (filter: MarketSyncSmokeCleanupFilter) => Promise<void>,
): Promise<Result> {
  let capturedSyncRunId: string | null = null;

  const captureSyncRunId = (runId: string) => {
    getMarketSyncSmokeCleanupFilter(runId);
    if (capturedSyncRunId !== null && capturedSyncRunId !== runId) {
      throw new Error("SYNC_SMOKE_GUARD_REJECTED");
    }
    capturedSyncRunId = runId;
  };

  try {
    return await operation(captureSyncRunId);
  } finally {
    if (capturedSyncRunId !== null) {
      try {
        await cleanup(
          getMarketSyncSmokeCleanupFilter(capturedSyncRunId),
        );
      } catch {
        throw new MarketSyncSmokeCleanupError();
      }
    }
  }
}
