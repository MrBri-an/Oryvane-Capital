"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvironment } from "@/config/public-env";
import type { Database } from "@/types/database";

export function createClient() {
  const env = getPublicEnvironment();
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
