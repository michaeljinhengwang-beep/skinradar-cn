import type { MarketDataProvider } from "../../types/data-provider.ts";
import type { MarketRepository } from "../../types/market-repository.ts";
import type {
  MarketSyncErrorCode,
  MarketSyncResult,
  MarketSyncStore,
} from "../../types/market-sync.ts";
import { MarketProviderError } from "../providers/errors.ts";
import { normalizeExternalMarketListings } from "../providers/normalizers/market.ts";

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
  readonly now?: () => Date;
};

function getSyncErrorCode(error: unknown): MarketSyncErrorCode {
  return error instanceof MarketProviderError
    ? error.code
    : "SYNC_WRITE_FAILED";
}

export function createMarketSyncService({
  provider,
  repository,
  syncStore,
  now = () => new Date(),
}: MarketSyncServiceOptions) {
  return {
    async sync(): Promise<MarketSyncResult> {
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
        const externalListings = await provider.getListings();
        received = externalListings.length;
        const listings = normalizeExternalMarketListings(externalListings);
        await repository.replaceListings({
          data: listings,
          source: provider.name,
          fetchedAt: now().toISOString(),
          fallback: false,
        });

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
          status: "success",
          provider: provider.name,
          received,
          written: listings.length,
          startedAt,
          completedAt,
        };
      } catch (error) {
        const errorCode = getSyncErrorCode(error);
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
