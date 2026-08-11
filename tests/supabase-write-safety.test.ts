import assert from "node:assert/strict";
import test from "node:test";
import {
  getMarketWriteSmokeCleanupFilter,
  MARKET_WRITE_SMOKE_TARGET,
  MarketWriteSmokeCleanupError,
  runWithMarketWriteSmokeCleanup,
} from "../lib/supabase/write-smoke-safety.ts";

test("smoke cleanup uses only the exact listing and cache identifiers", () => {
  assert.deepEqual(getMarketWriteSmokeCleanupFilter(), {
    listing: {
      provider: "mock",
      externalId: "skinradar-smoke-test-listing-001",
    },
    cache: {
      cacheKey: "skinradar-smoke-test",
    },
  });
});

test("smoke cleanup guard rejects every non-exact listing identifier", () => {
  assert.throws(
    () =>
      getMarketWriteSmokeCleanupFilter({
        ...MARKET_WRITE_SMOKE_TARGET,
        externalId: "skinradar-smoke-test-listing-002",
      }),
    /SMOKE_TEST_GUARD_REJECTED/u,
  );
  assert.throws(
    () =>
      getMarketWriteSmokeCleanupFilter({
        ...MARKET_WRITE_SMOKE_TARGET,
        externalId: "ordinary-listing",
      }),
    /SMOKE_TEST_GUARD_REJECTED/u,
  );
});

test("smoke cleanup guard rejects a provider-only cleanup target", () => {
  assert.throws(
    () =>
      getMarketWriteSmokeCleanupFilter({
        provider: "mock",
        externalId: "",
        cacheKey: MARKET_WRITE_SMOKE_TARGET.cacheKey,
      }),
    /SMOKE_TEST_GUARD_REJECTED/u,
  );
});

test("smoke cleanup runs in finally after a successful operation", async () => {
  const events: string[] = [];

  const result = await runWithMarketWriteSmokeCleanup(
    async () => {
      events.push("operation");
      return "completed";
    },
    async () => {
      events.push("cleanup");
    },
  );

  assert.equal(result, "completed");
  assert.deepEqual(events, ["operation", "cleanup"]);
});

test("smoke cleanup runs in finally after a failed operation", async () => {
  let cleanupCalls = 0;

  await assert.rejects(
    () =>
      runWithMarketWriteSmokeCleanup(
        async () => {
          throw new Error("operation failed");
        },
        async () => {
          cleanupCalls += 1;
        },
      ),
    /operation failed/u,
  );

  assert.equal(cleanupCalls, 1);
});

test("cleanup failures return only the sanitized smoke-test error", async () => {
  const secret = "database-secret-that-must-not-escape";

  await assert.rejects(
    () =>
      runWithMarketWriteSmokeCleanup(
        async () => "completed",
        async () => {
          throw new Error(`Authorization failed for ${secret}`);
        },
      ),
    (error: unknown) =>
      error instanceof MarketWriteSmokeCleanupError &&
      error.code === "SMOKE_TEST_CLEANUP_FAILED" &&
      !error.message.includes(secret) &&
      !JSON.stringify(error).includes(secret),
  );
});
