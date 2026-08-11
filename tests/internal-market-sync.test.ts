import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MarketProviderError } from "../lib/providers/errors.ts";
import {
  handleMarketSyncRequest,
  resolveInternalMarketSyncConfig,
  type InternalMarketSyncEnvironment,
} from "../lib/services/internal-market-sync-handler.ts";
import { SyncAlreadyRunningError } from "../lib/services/market-sync-service.ts";
import type { MarketSyncResult } from "../types/market-sync.ts";

const CRON_SECRET = "internal-cron-secret-for-tests";
const ENABLED_ENVIRONMENT = {
  CRON_SECRET,
  MARKET_SYNC_ENABLED: "true",
  MARKET_SYNC_PROVIDER: "mock",
} as const;
const SUCCESS_RESULT: MarketSyncResult = {
  runId: "123e4567-e89b-42d3-a456-426614174000",
  status: "success",
  provider: "mock",
  received: 1,
  written: 1,
  startedAt: "2026-08-11T12:00:00.000Z",
  completedAt: "2026-08-11T12:00:01.000Z",
};

type FakeSyncOptions = {
  readonly result?: MarketSyncResult;
  readonly error?: unknown;
  readonly factoryError?: unknown;
};

function createRequest(
  authorization?: string,
  method = "POST",
) {
  return new Request("http://localhost/api/internal/market-sync", {
    method,
    headers: authorization ? { Authorization: authorization } : undefined,
  });
}

function createFakeDependencies(
  environment: InternalMarketSyncEnvironment = ENABLED_ENVIRONMENT,
  options: FakeSyncOptions = {},
) {
  const state = { factoryCalls: 0, syncCalls: 0 };
  const dependencies = {
    environment,
    createSyncService() {
      state.factoryCalls += 1;
      if (options.factoryError) {
        throw options.factoryError;
      }
      return {
        async sync() {
          state.syncCalls += 1;
          if (options.error) {
            throw options.error;
          }
          return options.result ?? SUCCESS_RESULT;
        },
      };
    },
  };

  return { dependencies, state };
}

async function readJson(response: Response) {
  const body: unknown = await response.json();
  assert.ok(typeof body === "object" && body !== null && !Array.isArray(body));
  return body as Record<string, unknown>;
}

test("missing Authorization returns 401", async () => {
  const { dependencies, state } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(),
    dependencies,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await readJson(response), {
    ok: false,
    errorCode: "UNAUTHORIZED",
  });
  assert.equal(state.factoryCalls, 0);
});

test("a non-Bearer authorization scheme returns 401", async () => {
  const { dependencies } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(`Basic ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 401);
});

test("an incorrect Bearer secret returns 401", async () => {
  const { dependencies } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest("Bearer incorrect-secret"),
    dependencies,
  );

  assert.equal(response.status, 401);
});

test("the correct Bearer secret passes authorization", async () => {
  const { dependencies, state } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 200);
  assert.equal(state.factoryCalls, 1);
  assert.equal(state.syncCalls, 1);
});

test("missing CRON_SECRET fails safely at request time", async () => {
  const { dependencies, state } = createFakeDependencies({
    MARKET_SYNC_ENABLED: "true",
    MARKET_SYNC_PROVIDER: "mock",
  });
  const response = await handleMarketSyncRequest(
    createRequest("Bearer unused"),
    dependencies,
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await readJson(response), {
    ok: false,
    errorCode: "SYNC_CONFIGURATION_ERROR",
  });
  assert.equal(state.factoryCalls, 0);
});

test("MARKET_SYNC_ENABLED=false does not call the service factory", async () => {
  const { dependencies, state } = createFakeDependencies({
    ...ENABLED_ENVIRONMENT,
    MARKET_SYNC_ENABLED: "false",
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 503);
  assert.equal(state.factoryCalls, 0);
  assert.equal(state.syncCalls, 0);
});

test("disabled responses contain only a sanitized error code", async () => {
  const rawMarker = "raw-provider-response";
  const { dependencies } = createFakeDependencies(
    {
      ...ENABLED_ENVIRONMENT,
      MARKET_SYNC_ENABLED: "false",
    },
    { factoryError: new Error(rawMarker) },
  );
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );
  const serialized = JSON.stringify(await readJson(response));

  assert.equal(response.status, 503);
  assert.ok(!serialized.includes(CRON_SECRET));
  assert.ok(!serialized.includes(rawMarker));
});

test("only an explicit true enables market sync", () => {
  assert.equal(
    resolveInternalMarketSyncConfig({ MARKET_SYNC_ENABLED: "true" }).enabled,
    true,
  );
  assert.equal(
    resolveInternalMarketSyncConfig({ MARKET_SYNC_ENABLED: "false" }).enabled,
    false,
  );
  assert.equal(
    resolveInternalMarketSyncConfig({ MARKET_SYNC_ENABLED: "invalid" }).enabled,
    false,
  );
  assert.equal(resolveInternalMarketSyncConfig({}).enabled, false);
});

test("MARKET_SYNC_PROVIDER defaults to mock", () => {
  assert.equal(resolveInternalMarketSyncConfig({}).provider, "mock");
  assert.equal(
    resolveInternalMarketSyncConfig({ MARKET_SYNC_PROVIDER: "mock" }).provider,
    "mock",
  );
});

test("a provider other than mock is rejected before service creation", async () => {
  const { dependencies, state } = createFakeDependencies({
    ...ENABLED_ENVIRONMENT,
    MARKET_SYNC_PROVIDER: "csfloat",
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await readJson(response), {
    ok: false,
    errorCode: "SYNC_PROVIDER_NOT_ALLOWED",
  });
  assert.equal(state.factoryCalls, 0);
});

test("service success returns a minimal 200 response", async () => {
  const { dependencies } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await readJson(response), {
    ok: true,
    runId: SUCCESS_RESULT.runId,
    provider: "mock",
    status: "success",
    received: 1,
    written: 1,
  });
});

test("success responses never include secrets", async () => {
  const { dependencies } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );
  const serialized = JSON.stringify(await readJson(response));

  assert.ok(!serialized.includes(CRON_SECRET));
  assert.ok(!serialized.includes("Authorization"));
});

test("success responses discard unknown raw Provider fields", async () => {
  const rawMarker = "raw-provider-response";
  const resultWithRaw = {
    ...SUCCESS_RESULT,
    raw: { marker: rawMarker },
  };
  const { dependencies } = createFakeDependencies(ENABLED_ENVIRONMENT, {
    result: resultWithRaw,
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );
  const serialized = JSON.stringify(await readJson(response));

  assert.ok(!serialized.includes("raw"));
  assert.ok(!serialized.includes(rawMarker));
});

test("SyncAlreadyRunning maps to 409", async () => {
  const { dependencies } = createFakeDependencies(ENABLED_ENVIRONMENT, {
    error: new SyncAlreadyRunningError(),
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 409);
  assert.deepEqual(await readJson(response), {
    ok: false,
    errorCode: "SYNC_ALREADY_RUNNING",
  });
});

test("Provider unavailable maps to 503 without its message", async () => {
  const rawMarker = "private-provider-message";
  const { dependencies } = createFakeDependencies(ENABLED_ENVIRONMENT, {
    error: new MarketProviderError(
      "PROVIDER_UNAVAILABLE",
      "mock",
      rawMarker,
    ),
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );
  const serialized = JSON.stringify(await readJson(response));

  assert.equal(response.status, 503);
  assert.ok(!serialized.includes(rawMarker));
});

test("a failed Provider result maps to 503", async () => {
  const { dependencies } = createFakeDependencies(ENABLED_ENVIRONMENT, {
    result: {
      ...SUCCESS_RESULT,
      status: "failed",
      written: 0,
      errorCode: "PROVIDER_UNAVAILABLE",
    },
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await readJson(response), {
    ok: false,
    errorCode: "PROVIDER_UNAVAILABLE",
  });
});

test("unexpected failures map to a sanitized 500 response", async () => {
  const rawMarker = "database stack and secret";
  const { dependencies } = createFakeDependencies(ENABLED_ENVIRONMENT, {
    error: new Error(rawMarker),
  });
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );
  const serialized = JSON.stringify(await readJson(response));

  assert.equal(response.status, 500);
  assert.deepEqual(JSON.parse(serialized), {
    ok: false,
    errorCode: "INTERNAL_ERROR",
  });
  assert.ok(!serialized.includes(rawMarker));
});

test("every handler response uses no-store", async () => {
  const { dependencies } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("disabled mode cannot initialize Supabase dependencies", async () => {
  const { dependencies, state } = createFakeDependencies(
    {
      ...ENABLED_ENVIRONMENT,
      MARKET_SYNC_ENABLED: "false",
    },
    { factoryError: new Error("Supabase must remain untouched") },
  );

  await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(state.factoryCalls, 0);
});

test("disabled mode cannot call any Provider", async () => {
  const { dependencies, state } = createFakeDependencies({
    ...ENABLED_ENVIRONMENT,
    MARKET_SYNC_ENABLED: "false",
  });

  await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`),
    dependencies,
  );

  assert.equal(state.syncCalls, 0);
});

test("non-POST requests cannot execute sync", async () => {
  const { dependencies, state } = createFakeDependencies();
  const response = await handleMarketSyncRequest(
    createRequest(`Bearer ${CRON_SECRET}`, "GET"),
    dependencies,
  );

  assert.equal(response.status, 405);
  assert.equal(state.factoryCalls, 0);
  assert.equal(state.syncCalls, 0);
});

test("route exports POST only and remains server-only", () => {
  const source = readFileSync(
    new URL("../app/api/internal/market-sync/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /import\s+["']server-only["']/u);
  assert.match(source, /export\s+function\s+POST/u);
  assert.doesNotMatch(source, /export\s+(?:async\s+)?function\s+GET/u);
  assert.doesNotMatch(source, /["']use client["']/u);
  assert.doesNotMatch(source, /components\//u);
});

test("route hard-codes the mock Provider and cannot construct CSFloat", () => {
  const source = readFileSync(
    new URL("../app/api/internal/market-sync/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /mockMarketDataProvider/u);
  assert.doesNotMatch(source, /csfloat/iu);
  assert.doesNotMatch(source, /CSFLOAT_API_KEY/u);
  assert.doesNotMatch(source, /getMarketDataProvider/u);
});

test("route supports server-side dependency injection without a URL smoke mode", () => {
  const source = readFileSync(
    new URL("../app/api/internal/market-sync/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /provider\s*=\s*mockMarketDataProvider/u);
  assert.match(source, /cacheKey\s*=\s*["']market:listings["']/u);
  assert.match(source, /readonly provider\?: MarketDataProvider/u);
  assert.match(source, /readonly cacheKey\?: string/u);
  assert.doesNotMatch(source, /searchParams|nextUrl|smoke=true|provider=mock/u);
});

test("authorization implementation uses timing-safe comparison", () => {
  const source = readFileSync(
    new URL(
      "../lib/services/internal-market-sync-handler.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /timingSafeEqual/u);
  assert.doesNotMatch(source, /console\.(?:log|error|warn)/u);
});
