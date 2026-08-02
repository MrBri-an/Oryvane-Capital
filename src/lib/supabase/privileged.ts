import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getServerEnvironment } from "@/config/env";
import type { Database } from "@/types/database";

export function createPrivilegedClient() {
  const env = getServerEnvironment();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Privileged server configuration is unavailable.");
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
