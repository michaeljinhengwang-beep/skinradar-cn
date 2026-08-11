import "server-only";

import { checkSupabaseMarketDatabase } from "./connectivity.ts";
import { createSupabaseMarketDatabaseAdapter } from "./database-adapter.ts";
import { createSupabaseServerClient } from "./server.ts";
import type { SupabaseServerEnvironment } from "./server-config.ts";

export async function checkConfiguredSupabaseMarketDatabase(
  environment: SupabaseServerEnvironment = process.env,
) {
  const client = createSupabaseServerClient(environment);
  const adapter = createSupabaseMarketDatabaseAdapter(client, { environment });
  return checkSupabaseMarketDatabase(adapter);
}
