import type { MarketDataProviderName } from "./data-provider.ts";
import type { MarketProviderErrorCode } from "../lib/providers/errors.ts";

export const MARKET_SYNC_STATUSES = [
  "running",
  "success",
  "failed",
  "partial",
] as const;

export type MarketSyncStatus = (typeof MARKET_SYNC_STATUSES)[number];
export type MarketSyncResultStatus = Extract<
  MarketSyncStatus,
  "success" | "failed"
>;
export type MarketSyncErrorCode =
  | MarketProviderErrorCode
  | "SYNC_WRITE_FAILED"
  | "STALE_SYNC_RECOVERED";

export type StartMarketSyncInput = {
  readonly provider: MarketDataProviderName;
  readonly startedAt: string;
};

export type CompleteMarketSyncInput = {
  readonly runId: string;
  readonly completedAt: string;
  readonly status: Exclude<MarketSyncStatus, "running">;
  readonly listingsReceived: number;
  readonly listingsWritten: number;
  readonly errorCode: MarketSyncErrorCode | null;
};

export interface MarketSyncStore {
  tryStartSync(input: StartMarketSyncInput): Promise<string | null>;
  completeSync(input: CompleteMarketSyncInput): Promise<void>;
}

export interface SupabaseMarketSyncDatabaseClient {
  tryInsertMarketSyncRun(input: StartMarketSyncInput): Promise<string | null>;
  updateMarketSyncRun(input: CompleteMarketSyncInput): Promise<void>;
}

export type MarketSyncResult = {
  readonly runId: string;
  readonly status: MarketSyncResultStatus;
  readonly provider: MarketDataProviderName;
  readonly received: number;
  readonly written: number;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly errorCode?: MarketSyncErrorCode;
};
