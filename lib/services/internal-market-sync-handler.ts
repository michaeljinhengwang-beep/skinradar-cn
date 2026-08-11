import { createHash, timingSafeEqual } from "node:crypto";
import { MarketProviderError } from "../providers/errors.ts";
import { SyncAlreadyRunningError } from "./market-sync-service.ts";
import { SupabaseConfigurationError } from "../supabase/server-config.ts";
import type { MarketSyncResult } from "../../types/market-sync.ts";

export type InternalMarketSyncEnvironment = Readonly<
  Record<string, string | undefined>
>;

type MarketSyncExecutor = {
  sync(): Promise<MarketSyncResult>;
};

export type InternalMarketSyncDependencies = {
  readonly environment: InternalMarketSyncEnvironment;
  readonly createSyncService: () => MarketSyncExecutor;
};

export type InternalMarketSyncConfig = {
  readonly cronSecret: string | null;
  readonly enabled: boolean;
  readonly provider: "mock" | null;
};

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
} as const;

function jsonResponse(body: object, status: number) {
  return Response.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function secureEqual(left: string, right: string) {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function readBearerToken(header: string | null) {
  if (!header) {
    return null;
  }

  const match = /^Bearer ([^\s]+)$/iu.exec(header);
  return match?.[1] ?? null;
}

function isAuthorized(request: Request, cronSecret: string) {
  const token = readBearerToken(request.headers.get("authorization"));
  return token !== null && secureEqual(token, cronSecret);
}

function providerFailureStatus(errorCode: string) {
  return ["AUTH_REQUIRED", "RATE_LIMITED", "PROVIDER_UNAVAILABLE"].includes(
    errorCode,
  )
    ? 503
    : 500;
}

export function resolveInternalMarketSyncConfig(
  environment: InternalMarketSyncEnvironment,
): InternalMarketSyncConfig {
  const cronSecret = environment.CRON_SECRET?.trim() || null;
  const enabled =
    environment.MARKET_SYNC_ENABLED?.trim().toLowerCase() === "true";
  const configuredProvider =
    environment.MARKET_SYNC_PROVIDER?.trim().toLowerCase() || "mock";

  return {
    cronSecret,
    enabled,
    provider: configuredProvider === "mock" ? "mock" : null,
  };
}

export async function handleMarketSyncRequest(
  request: Request,
  dependencies: InternalMarketSyncDependencies,
) {
  if (request.method !== "POST") {
    return jsonResponse(
      { ok: false, errorCode: "METHOD_NOT_ALLOWED" },
      405,
    );
  }

  const config = resolveInternalMarketSyncConfig(dependencies.environment);

  if (!config.cronSecret) {
    return jsonResponse(
      { ok: false, errorCode: "SYNC_CONFIGURATION_ERROR" },
      503,
    );
  }

  if (!isAuthorized(request, config.cronSecret)) {
    return jsonResponse({ ok: false, errorCode: "UNAUTHORIZED" }, 401);
  }

  if (!config.enabled) {
    return jsonResponse({ ok: false, errorCode: "SYNC_DISABLED" }, 503);
  }

  if (config.provider !== "mock") {
    return jsonResponse(
      { ok: false, errorCode: "SYNC_PROVIDER_NOT_ALLOWED" },
      503,
    );
  }

  try {
    const result = await dependencies.createSyncService().sync();

    if (result.status !== "success") {
      const errorCode = result.errorCode ?? "SYNC_WRITE_FAILED";
      return jsonResponse(
        { ok: false, errorCode },
        providerFailureStatus(errorCode),
      );
    }

    return jsonResponse(
      {
        ok: true,
        runId: result.runId,
        provider: result.provider,
        status: result.status,
        received: result.received,
        written: result.written,
      },
      200,
    );
  } catch (error: unknown) {
    if (error instanceof SyncAlreadyRunningError) {
      return jsonResponse(
        { ok: false, errorCode: error.code },
        409,
      );
    }

    if (error instanceof MarketProviderError) {
      return jsonResponse(
        { ok: false, errorCode: error.code },
        providerFailureStatus(error.code),
      );
    }

    if (error instanceof SupabaseConfigurationError) {
      return jsonResponse(
        { ok: false, errorCode: "SYNC_CONFIGURATION_ERROR" },
        503,
      );
    }

    return jsonResponse(
      { ok: false, errorCode: "INTERNAL_ERROR" },
      500,
    );
  }
}
