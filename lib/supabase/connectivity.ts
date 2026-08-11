import {
  MARKET_DATABASE_TABLES,
  type MarketDatabaseTable,
  type SupabaseMarketConnectivityClient,
} from "../../types/market-database.ts";

export type SupabaseMarketConnectivityResult = {
  readonly ok: boolean;
  readonly tables: Readonly<Record<MarketDatabaseTable, boolean>>;
  readonly errorCode?: "TABLE_UNAVAILABLE";
};

export async function checkSupabaseMarketDatabase(
  client: SupabaseMarketConnectivityClient,
): Promise<SupabaseMarketConnectivityResult> {
  const tables: Record<MarketDatabaseTable, boolean> = {
    market_listings: false,
    market_cache_state: false,
    market_sync_runs: false,
  };

  for (const table of MARKET_DATABASE_TABLES) {
    try {
      await client.checkMarketTable(table);
      tables[table] = true;
    } catch {
      tables[table] = false;
    }
  }

  const ok = MARKET_DATABASE_TABLES.every((table) => tables[table]);

  return ok ? { ok, tables } : { ok, tables, errorCode: "TABLE_UNAVAILABLE" };
}
