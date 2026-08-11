import "server-only";

import { mockMarketDataProvider } from "@/lib/providers/mock-market-provider";
import { createSupabaseMarketRepository } from "@/lib/repositories/supabase-market-repository";
import { createSupabaseMarketSyncStore } from "@/lib/repositories/supabase-market-sync-store";
import { handleMarketSyncRequest } from "@/lib/services/internal-market-sync-handler";
import { createMarketSyncService } from "@/lib/services/market-sync-service";
import { createSupabaseMarketDatabaseAdapter } from "@/lib/supabase/database-adapter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MarketDataProvider } from "@/types/data-provider";
import type { SupabaseServerEnvironment } from "@/lib/supabase/server-config";

type InternalMarketSyncServiceOptions = {
  readonly environment?: SupabaseServerEnvironment;
  readonly provider?: MarketDataProvider;
  readonly cacheKey?: string;
};

export function createInternalMarketSyncService({
  environment = process.env,
  provider = mockMarketDataProvider,
  cacheKey = "market:listings",
}: InternalMarketSyncServiceOptions = {}) {
  const client = createSupabaseServerClient(environment);
  const adapter = createSupabaseMarketDatabaseAdapter(client, {
    environment,
  });
  const repository = createSupabaseMarketRepository({
    client: adapter,
    environment,
    cacheKey,
  });
  const syncStore = createSupabaseMarketSyncStore(adapter);

  return createMarketSyncService({
    provider,
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
