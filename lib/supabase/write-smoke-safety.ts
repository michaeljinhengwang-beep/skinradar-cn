export const MARKET_WRITE_SMOKE_TARGET = {
  provider: "mock",
  externalId: "skinradar-smoke-test-listing-001",
  cacheKey: "skinradar-smoke-test",
} as const;

type MarketWriteSmokeTargetInput = {
  readonly provider: string;
  readonly externalId: string;
  readonly cacheKey: string;
};

export type MarketWriteSmokeCleanupFilter = {
  readonly listing: {
    readonly provider: typeof MARKET_WRITE_SMOKE_TARGET.provider;
    readonly externalId: typeof MARKET_WRITE_SMOKE_TARGET.externalId;
  };
  readonly cache: {
    readonly cacheKey: typeof MARKET_WRITE_SMOKE_TARGET.cacheKey;
  };
};

export class MarketWriteSmokeCleanupError extends Error {
  readonly code = "SMOKE_TEST_CLEANUP_FAILED";

  constructor() {
    super("SMOKE_TEST_CLEANUP_FAILED");
    this.name = "MarketWriteSmokeCleanupError";
  }
}

export function getMarketWriteSmokeCleanupFilter(
  target: MarketWriteSmokeTargetInput = MARKET_WRITE_SMOKE_TARGET,
): MarketWriteSmokeCleanupFilter {
  if (
    target.provider !== MARKET_WRITE_SMOKE_TARGET.provider ||
    target.externalId !== MARKET_WRITE_SMOKE_TARGET.externalId ||
    target.cacheKey !== MARKET_WRITE_SMOKE_TARGET.cacheKey ||
    !target.externalId.includes("smoke-test") ||
    !target.cacheKey.includes("smoke-test")
  ) {
    throw new Error("SMOKE_TEST_GUARD_REJECTED");
  }

  return {
    listing: {
      provider: MARKET_WRITE_SMOKE_TARGET.provider,
      externalId: MARKET_WRITE_SMOKE_TARGET.externalId,
    },
    cache: {
      cacheKey: MARKET_WRITE_SMOKE_TARGET.cacheKey,
    },
  };
}

export async function runWithMarketWriteSmokeCleanup<Result>(
  operation: () => Promise<Result>,
  cleanup: (filter: MarketWriteSmokeCleanupFilter) => Promise<void>,
): Promise<Result> {
  const filter = getMarketWriteSmokeCleanupFilter();

  try {
    return await operation();
  } finally {
    try {
      await cleanup(filter);
    } catch {
      throw new MarketWriteSmokeCleanupError();
    }
  }
}
