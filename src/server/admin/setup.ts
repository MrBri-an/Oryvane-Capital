import "server-only";

import { cookies } from "next/headers";
import { getServerEnvironment } from "@/config/env";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_SETUP_COOKIE, verifySetupGrant } from "@/security/admin-setup";

export async function getAdminSetupContext() {
  const env = getServerEnvironment();
  if (!env.INITIAL_SUPER_ADMIN_EMAIL || !env.ADMIN_SETUP_TOKEN || !env.SUPABASE_SERVICE_ROLE_KEY) return { available: false as const };
  const privileged = createPrivilegedClient();
  const { count, error: countError } = await privileged.from("admin_users").select("id", { count: "exact", head: true });
  if (countError || (count ?? 0) > 0) return { available: false as const };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email_confirmed_at || user.email?.toLowerCase() !== env.INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()) return { available: false as const };
  const grant = (await cookies()).get(ADMIN_SETUP_COOKIE)?.value;
  return { available: true as const, user, tokenVerified: verifySetupGrant(grant, user.id, env.ADMIN_SETUP_TOKEN) };
}
