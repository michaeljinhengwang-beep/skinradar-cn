import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_MARKET_DATA_STALE_AFTER_SECONDS,
  getMarketDataFreshness,
  getMarketDataStaleAfterSeconds,
  resolveMarketDataStaleAfterSeconds,
} from "../lib/config/market-data-freshness.ts";
import {
  DEFAULT_MARKET_SYNC_MAX_RUN_SECONDS,
  getMarketSyncScheduleConfig,
  MARKET_SYNC_SCHEDULE_PROVIDER_ALLOWLIST,
  resolveMarketSyncMaxRunSeconds,
} from "../lib/config/market-sync-schedule.ts";
import { createMemoryMarketRepository } from "../lib/repositories/memory-market-repository.ts";
import {
  getMarketSyncHealth,
} from "../lib/services/market-sync-health.ts";
import { createMarketSyncService } from "../lib/services/market-sync-service.ts";
import {
  MarketSyncTimeoutError,
  runWithMarketSyncTimeout,
} from "../lib/services/market-sync-timeout.ts";
import type { MarketDataProvider } from "../types/data-provider.ts";
import type {
  CompleteMarketSyncInput,
  MarketSyncHealthRun,
  MarketSyncHealthStore,
} from "../types/market-sync.ts";

const NOW = new Date("2026-08-12T12:00:00.000Z");
const SUCCESS_RUN: MarketSyncHealthRun = {
  provider: "mock",
  startedAt: "2026-08-12T11:50:00.000Z",
  completedAt: "2026-08-12T11:51:00.000Z",
  status: "success",
  received: 10,
  written: 10,
  errorCode: null,
};
const FAILURE_RUN: MarketSyncHealthRun = {
  provider: "mock",
  startedAt: "2026-08-12T11:55:00.000Z",
  completedAt: "2026-08-12T11:56:00.000Z",
  status: "failed",
  received: 0,
  written: 0,
  errorCode: "PROVIDER_UNAVAILABLE",
};

function createHealthStore(
  success: MarketSyncHealthRun | null,
  failure: MarketSyncHealthRun | null,
): MarketSyncHealthStore {
  return {
    async getLatestMarketSyncRun(_provider, status) {
      return status === "success" ? success : failure;
    },
  };
}

test("market sync max run defaults to 60 seconds", () => {
  assert.equal(DEFAULT_MARKET_SYNC_MAX_RUN_SECONDS, 60);
  assert.equal(resolveMarketSyncMaxRunSeconds(undefined), 60);
});

test("invalid market sync max run values fall back safely", () => {
  for (const value of ["", "invalid", "0", "-1", "1.5", "301"]) {
    assert.equal(resolveMarketSyncMaxRunSeconds(value), 60);
  }
});

test("valid market sync max run values are accepted", () => {
  assert.equal(resolveMarketSyncMaxRunSeconds("1"), 1);
  assert.equal(resolveMarketSyncMaxRunSeconds(300), 300);
});

test("scheduler config is disabled, manual, and mock-only by default", () => {
  assert.deepEqual(getMarketSyncScheduleConfig({}), {
    enabled: false,
    provider: "mock",
    expectedCadence: "manual",
    maxRunSeconds: 60,
    staleLockSeconds: 900,
  });
});

test("scheduler config requires explicit true to enable", () => {
  assert.equal(
    getMarketSyncScheduleConfig({ MARKET_SYNC_ENABLED: "true" }).enabled,
    true,
  );
  assert.equal(
    getMarketSyncScheduleConfig({ MARKET_SYNC_ENABLED: "yes" }).enabled,
    false,
  );
});

test("scheduler provider allowlist remains mock-only", () => {
  assert.deepEqual(MARKET_SYNC_SCHEDULE_PROVIDER_ALLOWLIST, ["mock"]);
  assert.equal(
    getMarketSyncScheduleConfig({ MARKET_SYNC_PROVIDER: "csfloat" }).provider,
    null,
  );
});

test("scheduler config ignores client-prefixed environment variables", () => {
  const config = getMarketSyncScheduleConfig({
    NEXT_PUBLIC_MARKET_SYNC_ENABLED: "true",
    NEXT_PUBLIC_MARKET_SYNC_PROVIDER: "csfloat",
    NEXT_PUBLIC_MARKET_SYNC_MAX_RUN_SECONDS: "1",
  });

  assert.equal(config.enabled, false);
  assert.equal(config.provider, "mock");
  assert.equal(config.maxRunSeconds, 60);
});

test("scheduler config source never reads client or secret variables", () => {
  const source = readFileSync(
    new URL("../lib/config/market-sync-schedule.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /NEXT_PUBLIC_/u);
  assert.doesNotMatch(source, /CRON_SECRET|SUPABASE_SECRET_KEY|CSFLOAT_API_KEY/u);
});

test("market data stale policy defaults to 1800 seconds", () => {
  assert.equal(DEFAULT_MARKET_DATA_STALE_AFTER_SECONDS, 1_800);
  assert.equal(resolveMarketDataStaleAfterSeconds(undefined), 1_800);
  assert.equal(getMarketDataStaleAfterSeconds({}), 1_800);
});

test("invalid stale policy values fall back safely", () => {
  for (const value of ["", "invalid", "0", "-1", "1.5"]) {
    assert.equal(resolveMarketDataStaleAfterSeconds(value), 1_800);
  }
});

test("data is fresh immediately before the stale boundary", () => {
  assert.equal(
    getMarketDataFreshness("2026-08-12T11:30:00.001Z", { now: NOW }),
    "fresh",
  );
});

test("data becomes stale exactly at the stale boundary", () => {
  assert.equal(
    getMarketDataFreshness("2026-08-12T11:30:00.000Z", { now: NOW }),
    "stale",
  );
});

test("missing or invalid sync history has unknown freshness", () => {
  assert.equal(getMarketDataFreshness(null, { now: NOW }), "unknown");
  assert.equal(getMarketDataFreshness("invalid", { now: NOW }), "unknown");
});

test("timeout aborts the operation with a fixed error", async () => {
  let abortObserved = false;

  await assert.rejects(
    () =>
      runWithMarketSyncTimeout(
        (signal) =>
          new Promise<never>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => {
                abortObserved = signal.aborted;
                reject(signal.reason);
              },
              { once: true },
            );
          }),
        0.01,
      ),
    MarketSyncTimeoutError,
  );

  assert.equal(abortObserved, true);
});

test("timeout errors do not expose an underlying operation message", async () => {
  const secret = "provider-secret-that-must-not-escape";

  await assert.rejects(
    () =>
      runWithMarketSyncTimeout(
        () => new Promise<never>(() => undefined),
        0.01,
      ),
    (error: unknown) =>
      error instanceof MarketSyncTimeoutError &&
      error.code === "TIMEOUT" &&
      !error.message.includes(secret),
  );
});

test("a timed-out fake Provider observes AbortSignal and preserves old data", async () => {
  const completions: CompleteMarketSyncInput[] = [];
  let providerSignal: AbortSignal | undefined;
  const provider: MarketDataProvider = {
    name: "mock",
    async getListings({ signal } = {}) {
      providerSignal = signal;
      return new Promise<never>((_resolve, reject) => {
        signal?.addEventListener(
          "abort",
          () => reject(signal.reason),
          { once: true },
        );
      });
    },
    async getSkinByExternalId() {
      return undefined;
    },
    async healthCheck() {
      return { provider: "mock", available: true };
    },
  };
  const repository = createMemoryMarketRepository({ now: () => NOW });
  const service = createMarketSyncService({
    provider,
    repository,
    syncStore: {
      async tryStartSync() {
        return "timeout-run";
      },
      async completeSync(input) {
        completions.push(input);
      },
    },
    now: () => NOW,
  });

  await assert.rejects(
    () =>
      runWithMarketSyncTimeout(
        (signal) => service.sync({ signal }),
        0.01,
      ),
    MarketSyncTimeoutError,
  );
  await new Promise<void>((resolveTurn) => setImmediate(resolveTurn));

  assert.equal(providerSignal?.aborted, true);
  assert.equal(completions[0]?.status, "failed");
  assert.equal(completions[0]?.errorCode, "TIMEOUT");
  assert.equal(await repository.getListings(), null);
});

test("sync health reports the last successful run", async () => {
  const health = await getMarketSyncHealth(
    createHealthStore(SUCCESS_RUN, null),
    "mock",
  );

  assert.equal(health.state, "healthy");
  assert.deepEqual(health.lastSuccess, SUCCESS_RUN);
  assert.equal(health.lastFailure, null);
});

test("sync health reports a newer failed run as degraded", async () => {
  const health = await getMarketSyncHealth(
    createHealthStore(SUCCESS_RUN, FAILURE_RUN),
    "mock",
  );

  assert.equal(health.state, "degraded");
  assert.deepEqual(health.lastFailure, FAILURE_RUN);
});

test("sync health without history is unknown", async () => {
  const health = await getMarketSyncHealth(
    createHealthStore(null, null),
    "mock",
  );

  assert.deepEqual(health, {
    state: "unknown",
    provider: "mock",
    lastSuccess: null,
    lastFailure: null,
  });
});

test("sync health strips unknown errors and extra secret properties", async () => {
  const cronSecret = "cron-secret-that-must-not-escape";
  const supabaseSecret = "supabase-secret-that-must-not-escape";
  const unsafeFailure = {
    ...FAILURE_RUN,
    errorCode: supabaseSecret,
    cronSecret,
  } as unknown as MarketSyncHealthRun;
  const health = await getMarketSyncHealth(
    createHealthStore(null, unsafeFailure),
    "mock",
  );
  const serialized = JSON.stringify(health);

  assert.equal(health.lastFailure?.errorCode, "UNKNOWN");
  assert.ok(!serialized.includes(cronSecret));
  assert.ok(!serialized.includes(supabaseSecret));
});

test("the internal sync route still has no GET write entry point", () => {
  const source = readFileSync(
    new URL("../app/api/internal/market-sync/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /export\s+function\s+POST/u);
  assert.doesNotMatch(source, /export\s+(?:async\s+)?function\s+GET/u);
  assert.doesNotMatch(source, /csfloat|CSFLOAT_API_KEY/iu);
});
