import assert from "node:assert/strict";
import test from "node:test";
import {
  getMarketSyncSmokeCleanupFilter,
  MarketSyncSmokeCleanupError,
  runWithMarketSyncSmokeCleanup,
} from "../lib/supabase/sync-smoke-safety.ts";

const SYNC_RUN_ID = "123e4567-e89b-42d3-a456-426614174000";
const OTHER_SYNC_RUN_ID = "123e4567-e89b-42d3-a456-426614174001";

test("sync smoke cleanup uses exact listing, cache, and sync run IDs", () => {
  assert.deepEqual(getMarketSyncSmokeCleanupFilter(SYNC_RUN_ID), {
    listing: {
      provider: "mock",
      externalId: "skinradar-sync-smoke-listing-001",
    },
    syncRun: { id: SYNC_RUN_ID },
    cache: { cacheKey: "skinradar-sync-smoke-test" },
  });
});

test("sync smoke cleanup rejects a different requested sync run ID", () => {
  assert.throws(
    () =>
      getMarketSyncSmokeCleanupFilter(SYNC_RUN_ID, OTHER_SYNC_RUN_ID),
    /SYNC_SMOKE_GUARD_REJECTED/u,
  );
});

test("sync smoke cleanup rejects a non-UUID sync run ID", () => {
  assert.throws(
    () => getMarketSyncSmokeCleanupFilter("mock-running-row"),
    /SYNC_SMOKE_GUARD_REJECTED/u,
  );
});

test("sync smoke cleanup runs in finally with the captured run ID", async () => {
  let cleanedRunId: string | null = null;

  await assert.rejects(
    () =>
      runWithMarketSyncSmokeCleanup(
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

test("sync smoke cleanup does not run before a run ID is captured", async () => {
  let cleanupCalls = 0;

  await assert.rejects(
    () =>
      runWithMarketSyncSmokeCleanup(
        async () => {
          throw new Error("lock was not acquired");
        },
        async () => {
          cleanupCalls += 1;
        },
      ),
    /lock was not acquired/u,
  );

  assert.equal(cleanupCalls, 0);
});

test("sync smoke cleanup failures never expose their underlying error", async () => {
  const secret = "database-secret-that-must-not-escape";

  await assert.rejects(
    () =>
      runWithMarketSyncSmokeCleanup(
        async (captureSyncRunId) => {
          captureSyncRunId(SYNC_RUN_ID);
          return "completed";
        },
        async () => {
          throw new Error(`Authorization failed for ${secret}`);
        },
      ),
    (error: unknown) =>
      error instanceof MarketSyncSmokeCleanupError &&
      error.code === "SYNC_SMOKE_CLEANUP_FAILED" &&
      !error.message.includes(secret) &&
      !JSON.stringify(error).includes(secret),
  );
});
