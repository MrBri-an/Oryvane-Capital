"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerEnvironment } from "@/config/env";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_SETUP_COOKIE, ADMIN_SETUP_TTL_SECONDS, createSetupGrant, setupTokenMatches, verifySetupGrant } from "@/security/admin-setup";
import { securityLog } from "@/security/logging";
import { enforceRateLimit } from "@/security/request";

export type SetupState = { ok: boolean; message?: string };
const tokenSchema = z.string().min(1).max(512);

async function eligible() {
  const env = getServerEnvironment();
  if (!env.INITIAL_SUPER_ADMIN_EMAIL || !env.ADMIN_SETUP_TOKEN || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email_confirmed_at || user.email?.toLowerCase() !== env.INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()) return null;
  const privileged = createPrivilegedClient(); const { count, error } = await privileged.from("admin_users").select("id", { count: "exact", head: true });
  if (error || (count ?? 0) !== 0) return null;
  return { env, user, supabase, privileged };
}

export async function verifyAdminSetupTokenAction(_: SetupState, formData: FormData): Promise<SetupState> {
  try {
    await enforceRateLimit({ scope: "admin.setup.token", limit: 5, windowSeconds: 3600 });
    const context = await eligible(); const parsed = tokenSchema.safeParse(formData.get("setupToken"));
    if (!context || !parsed.success || !setupTokenMatches(parsed.data, context.env.ADMIN_SETUP_TOKEN!)) throw new Error();
    (await cookies()).set(ADMIN_SETUP_COOKIE, createSetupGrant(context.user.id, context.env.ADMIN_SETUP_TOKEN!), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin/setup", maxAge: ADMIN_SETUP_TTL_SECONDS });
    securityLog({ event: "admin.setup_token_verified", outcome: "allowed", actorId: context.user.id });
    return { ok: true };
  } catch { securityLog({ event: "admin.setup_token_rejected", outcome: "denied" }); return { ok: false, message: "Setup could not be authorized." }; }
}

export async function completeAdminSetupAction(previous: SetupState, formData: FormData): Promise<SetupState> {
  void previous; void formData;
  try {
    await enforceRateLimit({ scope: "admin.setup.complete", limit: 3, windowSeconds: 3600 });
    const context = await eligible(); if (!context) throw new Error();
    const cookieStore = await cookies(); if (!verifySetupGrant(cookieStore.get(ADMIN_SETUP_COOKIE)?.value, context.user.id, context.env.ADMIN_SETUP_TOKEN!)) throw new Error();
    const { data: assurance } = await context.supabase.auth.mfa.getAuthenticatorAssuranceLevel(); if (assurance?.currentLevel !== "aal2") throw new Error();
    const { data: authUser, error: authError } = await context.privileged.auth.admin.getUserById(context.user.id);
    if (authError || !authUser.user.factors?.some((factor) => factor.factor_type === "totp" && factor.status === "verified")) throw new Error();
    const { error } = await context.privileged.rpc("bootstrap_first_admin", { p_user_id: context.user.id, p_role_name: "Super administrator" }); if (error) throw error;
    cookieStore.delete(ADMIN_SETUP_COOKIE); securityLog({ event: "admin.bootstrap_completed", outcome: "allowed", actorId: context.user.id });
  } catch { securityLog({ event: "admin.bootstrap_rejected", outcome: "denied" }); return { ok: false, message: "Administrator setup could not be completed." }; }
  redirect("/admin");
}
