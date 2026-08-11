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
  const entries = await Promise.all(
    MARKET_DATABASE_TABLES.map(async (table) => {
      try {
        await client.checkMarketTable(table);
        return [table, true] as const;
      } catch {
        return [table, false] as const;
      }
    }),
  );
  const tables = Object.fromEntries(entries) as Record<
    MarketDatabaseTable,
    boolean
  >;
  const ok = MARKET_DATABASE_TABLES.every((table) => tables[table]);

  return ok ? { ok, tables } : { ok, tables, errorCode: "TABLE_UNAVAILABLE" };
}
