import type { MarketDataProvider } from "../../types/data-provider.ts";
import type { MarketRepository } from "../../types/market-repository.ts";
import type {
  MarketSyncErrorCode,
  MarketSyncExecutionOptions,
  MarketSyncResult,
  MarketSyncStore,
} from "../../types/market-sync.ts";
import { MarketProviderError } from "../providers/errors.ts";
import { normalizeExternalMarketListings } from "../providers/normalizers/market.ts";
import { MarketSyncTimeoutError } from "./market-sync-timeout.ts";

export class SyncAlreadyRunningError extends Error {
  readonly code = "SYNC_ALREADY_RUNNING" as const;

  constructor() {
    super("A market sync is already running for this provider.");
    this.name = "SyncAlreadyRunningError";
  }
}

type MarketSyncServiceOptions = {
  readonly provider: MarketDataProvider;
  readonly repository: MarketRepository;
  readonly syncStore: MarketSyncStore;
  readonly listingsLimit?: number;
  readonly targetListings?: number;
  readonly now?: () => Date;
};

function getSyncErrorCode(
  error: unknown,
  signal?: AbortSignal,
): MarketSyncErrorCode {
  if (signal?.aborted || error instanceof MarketSyncTimeoutError) {
    return "TIMEOUT";
  }

  return error instanceof MarketProviderError
    ? error.code
    : "SYNC_WRITE_FAILED";
}

function assertSyncActive(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new MarketSyncTimeoutError();
  }
}

export function createMarketSyncService({
  provider,
  repository,
  syncStore,
  listingsLimit,
  targetListings,
  now = () => new Date(),
}: MarketSyncServiceOptions) {
  return {
    async sync(
      { signal }: MarketSyncExecutionOptions = {},
    ): Promise<MarketSyncResult> {
      const startedAt = now().toISOString();
      const runId = await syncStore.tryStartSync({
        provider: provider.name,
        startedAt,
      });

      if (!runId) {
        throw new SyncAlreadyRunningError();
      }

      let received = 0;

      try {
        assertSyncActive(signal);
        const externalListings = await provider.getListings({
          targetListings: targetListings ?? listingsLimit,
          signal,
        });
        assertSyncActive(signal);
        received = externalListings.length;
        const listings = normalizeExternalMarketListings(externalListings);
        await repository.replaceListings({
          data: listings,
          source: provider.name,
          fetchedAt: now().toISOString(),
          fallback: false,
        });
        assertSyncActive(signal);

        const completedAt = now().toISOString();
        await syncStore.completeSync({
          runId,
          completedAt,
          status: "success",
          listingsReceived: received,
          listingsWritten: listings.length,
          errorCode: null,
        });

        return {
          runId,
          status: "success",
          provider: provider.name,
          received,
          written: listings.length,
          startedAt,
          completedAt,
        };
      } catch (error) {
        if (error instanceof MarketProviderError) {
          received = Math.max(received, error.receivedListings);
        }
        const errorCode = getSyncErrorCode(error, signal);
        const completedAt = now().toISOString();
        await syncStore.completeSync({
          runId,
          completedAt,
          status: "failed",
          listingsReceived: received,
          listingsWritten: 0,
          errorCode,
        });

        return {
          runId,
          status: "failed",
          provider: provider.name,
          received,
          written: 0,
          startedAt,
          completedAt,
          errorCode,
        };
      }
    },
  };
}
