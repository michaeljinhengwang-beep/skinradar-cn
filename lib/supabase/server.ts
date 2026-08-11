import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SkinRadarSupabaseDatabase } from "../../types/supabase-database.ts";
import {
  getSupabaseServerConfig,
  type SupabaseServerEnvironment,
} from "./server-config.ts";
import { SUPABASE_SERVER_CLIENT_OPTIONS } from "./server-options.ts";

export function createSupabaseServerClient(
  environment: SupabaseServerEnvironment = process.env,
) {
  const config = getSupabaseServerConfig(environment);
  return createClient<SkinRadarSupabaseDatabase>(
    config.url,
    config.secretKey,
    SUPABASE_SERVER_CLIENT_OPTIONS,
  );
}
