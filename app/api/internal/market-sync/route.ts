import "server-only";

import { mockMarketDataProvider } from "@/lib/providers/mock-market-provider";
import { createSupabaseMarketRepository } from "@/lib/repositories/supabase-market-repository";
import { createSupabaseMarketSyncStore } from "@/lib/repositories/supabase-market-sync-store";
import { handleMarketSyncRequest } from "@/lib/services/internal-market-sync-handler";
import { createMarketSyncService } from "@/lib/services/market-sync-service";
import { createSupabaseMarketDatabaseAdapter } from "@/lib/supabase/database-adapter";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createInternalMarketSyncService() {
  const client = createSupabaseServerClient(process.env);
  const adapter = createSupabaseMarketDatabaseAdapter(client, {
    environment: process.env,
  });
  const repository = createSupabaseMarketRepository({
    client: adapter,
    environment: process.env,
  });
  const syncStore = createSupabaseMarketSyncStore(adapter);

  return createMarketSyncService({
    provider: mockMarketDataProvider,
    repository,
    syncStore,
  });
}

export function POST(request: Request) {
  return handleMarketSyncRequest(request, {
    environment: process.env,
    createSyncService: createInternalMarketSyncService,
  });
}
