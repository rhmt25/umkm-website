import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "./env";

/** Server-only client for provisioning accounts. Never import this from a Client Component. */
export function createAdminClient() {
  const { url } = getSupabasePublicEnv();

  return createClient(url, getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
