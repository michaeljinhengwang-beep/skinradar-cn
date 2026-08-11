import type {
  ExternalMarketListing,
  MarketDataProvider,
} from "../../types/data-provider.ts";

export const MARKET_ROUTE_SMOKE_TARGET = {
  provider: "mock",
  externalId: "skinradar-route-smoke-listing-001",
  cacheKey: "skinradar-route-smoke-test",
  marketHashName: "AK-47 | SkinRadar Route Smoke (Factory New)",
  weapon: "AK-47",
  skinName: "SkinRadar Route Smoke",
  exterior: "Factory New",
  price: 77.77,
  currency: "CAD",
  floatValue: 0.017777,
  observedAt: "2026-08-11T12:00:00.000Z",
} as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function getRouteSmokeListing(): ExternalMarketListing {
  return {
    externalId: MARKET_ROUTE_SMOKE_TARGET.externalId,
    marketHashName: MARKET_ROUTE_SMOKE_TARGET.marketHashName,
    weapon: MARKET_ROUTE_SMOKE_TARGET.weapon,
    skinName: MARKET_ROUTE_SMOKE_TARGET.skinName,
    exterior: MARKET_ROUTE_SMOKE_TARGET.exterior,
    price: MARKET_ROUTE_SMOKE_TARGET.price,
    currency: MARKET_ROUTE_SMOKE_TARGET.currency,
    floatValue: MARKET_ROUTE_SMOKE_TARGET.floatValue,
    listingUrl: null,
    provider: MARKET_ROUTE_SMOKE_TARGET.provider,
    observedAt: MARKET_ROUTE_SMOKE_TARGET.observedAt,
  };
}

export const routeSmokeMarketDataProvider: MarketDataProvider = {
  name: MARKET_ROUTE_SMOKE_TARGET.provider,
  async getListings() {
    return [getRouteSmokeListing()];
  },
  async getSkinByExternalId(externalId) {
    return externalId === MARKET_ROUTE_SMOKE_TARGET.externalId
      ? getRouteSmokeListing()
      : undefined;
  },
  async healthCheck() {
    return {
      provider: MARKET_ROUTE_SMOKE_TARGET.provider,
      available: true,
    };
  },
};

export type MarketRouteSmokeCleanupFilter = {
  readonly listing: {
    readonly provider: typeof MARKET_ROUTE_SMOKE_TARGET.provider;
    readonly externalId: typeof MARKET_ROUTE_SMOKE_TARGET.externalId;
  };
  readonly syncRun: {
    readonly id: string;
  };
  readonly cache: {
    readonly cacheKey: typeof MARKET_ROUTE_SMOKE_TARGET.cacheKey;
  };
};

export class MarketRouteSmokeCleanupError extends Error {
  readonly code = "ROUTE_SMOKE_CLEANUP_FAILED";

  constructor() {
    super("ROUTE_SMOKE_CLEANUP_FAILED");
    this.name = "MarketRouteSmokeCleanupError";
  }
}

export function getMarketRouteSmokeCleanupFilter(
  capturedSyncRunId: string,
  requestedSyncRunId = capturedSyncRunId,
): MarketRouteSmokeCleanupFilter {
  if (
    !UUID_PATTERN.test(capturedSyncRunId) ||
    requestedSyncRunId !== capturedSyncRunId ||
    !UUID_PATTERN.test(requestedSyncRunId) ||
    !MARKET_ROUTE_SMOKE_TARGET.externalId.includes("route-smoke") ||
    !MARKET_ROUTE_SMOKE_TARGET.cacheKey.includes("route-smoke")
  ) {
    throw new Error("ROUTE_SMOKE_GUARD_REJECTED");
  }

  return {
    listing: {
      provider: MARKET_ROUTE_SMOKE_TARGET.provider,
      externalId: MARKET_ROUTE_SMOKE_TARGET.externalId,
    },
    syncRun: { id: requestedSyncRunId },
    cache: { cacheKey: MARKET_ROUTE_SMOKE_TARGET.cacheKey },
  };
}

export async function runWithMarketRouteSmokeCleanup<Result>(
  operation: (captureSyncRunId: (runId: string) => void) => Promise<Result>,
  cleanup: (filter: MarketRouteSmokeCleanupFilter) => Promise<void>,
): Promise<Result> {
  let capturedSyncRunId: string | null = null;

  const captureSyncRunId = (runId: string) => {
    getMarketRouteSmokeCleanupFilter(runId);
    if (capturedSyncRunId !== null && capturedSyncRunId !== runId) {
      throw new Error("ROUTE_SMOKE_GUARD_REJECTED");
    }
    capturedSyncRunId = runId;
  };

  try {
    return await operation(captureSyncRunId);
  } finally {
    if (capturedSyncRunId !== null) {
      try {
        await cleanup(
          getMarketRouteSmokeCleanupFilter(capturedSyncRunId),
        );
      } catch {
        throw new MarketRouteSmokeCleanupError();
      }
    }
  }
}
