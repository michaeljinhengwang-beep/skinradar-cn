import assert from "node:assert/strict";
import test from "node:test";
import {
  getMarketRouteSmokeCleanupFilter,
  MARKET_ROUTE_SMOKE_TARGET,
  MarketRouteSmokeCleanupError,
  routeSmokeMarketDataProvider,
  runWithMarketRouteSmokeCleanup,
} from "../lib/supabase/route-smoke-safety.ts";

const SYNC_RUN_ID = "123e4567-e89b-42d3-a456-426614174000";
const OTHER_SYNC_RUN_ID = "123e4567-e89b-42d3-a456-426614174001";

test("route smoke Provider returns exactly one isolated listing", async () => {
  const listings = await routeSmokeMarketDataProvider.getListings();

  assert.equal(routeSmokeMarketDataProvider.name, "mock");
  assert.equal(listings.length, 1);
  assert.deepEqual(listings[0], {
    externalId: "skinradar-route-smoke-listing-001",
    marketHashName: "AK-47 | SkinRadar Route Smoke (Factory New)",
    weapon: "AK-47",
    skinName: "SkinRadar Route Smoke",
    exterior: "Factory New",
    price: 77.77,
    currency: "CAD",
    floatValue: 0.017777,
    listingUrl: null,
    provider: "mock",
    observedAt: MARKET_ROUTE_SMOKE_TARGET.observedAt,
  });
});

test("route smoke Provider cannot return unrelated mock listings", async () => {
  assert.equal(
    await routeSmokeMarketDataProvider.getSkinByExternalId(
      "unrelated-mock-listing",
    ),
    undefined,
  );
});

test("route smoke cleanup uses exact listing, cache, and sync run IDs", () => {
  assert.deepEqual(getMarketRouteSmokeCleanupFilter(SYNC_RUN_ID), {
    listing: {
      provider: "mock",
      externalId: "skinradar-route-smoke-listing-001",
    },
    syncRun: { id: SYNC_RUN_ID },
    cache: { cacheKey: "skinradar-route-smoke-test" },
  });
});

test("route smoke cleanup rejects a different requested sync run ID", () => {
  assert.throws(
    () =>
      getMarketRouteSmokeCleanupFilter(SYNC_RUN_ID, OTHER_SYNC_RUN_ID),
    /ROUTE_SMOKE_GUARD_REJECTED/u,
  );
});

test("route smoke cleanup rejects a non-UUID sync run ID", () => {
  assert.throws(
    () => getMarketRouteSmokeCleanupFilter("mock-running-row"),
    /ROUTE_SMOKE_GUARD_REJECTED/u,
  );
});

test("route smoke cleanup runs in finally with the captured run ID", async () => {
  let cleanedRunId: string | null = null;

  await assert.rejects(
    () =>
      runWithMarketRouteSmokeCleanup(
        async (captureSyncRunId) => {
          captureSyncRunId(SYNC_RUN_ID);
          throw new Error("operation failed");
        },
        async (filter) => {
          cleanedRunId = filter.syncRun.id;
        },
      ),
    /operation failed/u,
  );

  assert.equal(cleanedRunId, SYNC_RUN_ID);
});

test("route smoke cleanup does not run before a run ID is captured", async () => {
  let cleanupCalls = 0;

  await assert.rejects(
    () =>
      runWithMarketRouteSmokeCleanup(
        async () => {
          throw new Error("preflight failed");
        },
        async () => {
          cleanupCalls += 1;
        },
      ),
    /preflight failed/u,
  );

  assert.equal(cleanupCalls, 0);
});

test("route smoke cleanup failures expose only the fixed error code", async () => {
  const secret = "database-secret-that-must-not-escape";

  await assert.rejects(
    () =>
      runWithMarketRouteSmokeCleanup(
        async (captureSyncRunId) => {
          captureSyncRunId(SYNC_RUN_ID);
          return "completed";
        },
        async () => {
          throw new Error(`Authorization failed for ${secret}`);
        },
      ),
    (error: unknown) =>
      error instanceof MarketRouteSmokeCleanupError &&
      error.code === "ROUTE_SMOKE_CLEANUP_FAILED" &&
      !error.message.includes(secret) &&
      !JSON.stringify(error).includes(secret),
  );
});
