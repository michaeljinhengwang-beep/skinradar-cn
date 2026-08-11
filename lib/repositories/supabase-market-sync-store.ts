import type {
  MarketSyncStore,
  SupabaseMarketSyncDatabaseClient,
} from "../../types/market-sync.ts";

export function createSupabaseMarketSyncStore(
  client: SupabaseMarketSyncDatabaseClient,
): MarketSyncStore {
  return {
    tryStartSync(input) {
      return client.tryInsertMarketSyncRun(input);
    },
    completeSync(input) {
      return client.updateMarketSyncRun(input);
    },
  };
}
