"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/security/request";

const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(72) });
function value(data: FormData, key: string) { const item = data.get(key); return typeof item === "string" ? item : ""; }

export async function adminLoginAction(formData: FormData) {
  await enforceRateLimit({ scope: "admin.login", limit: 8, windowSeconds: 900, identifier: value(formData, "email") });
  const parsed = loginSchema.safeParse({ email: value(formData, "email"), password: value(formData, "password") });
  if (!parsed.success) redirect("/admin/login?error=Unable+to+sign+in.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/admin/login?error=Unable+to+sign+in.");
  const { data: active } = await supabase.rpc("is_current_user_active_admin");
  if (!active) { await supabase.auth.signOut({ scope: "local" }); redirect("/admin/login?error=Unable+to+sign+in."); }
  await supabase.rpc("record_admin_auth_event", { p_event_type: "admin_password_verified", p_severity: "info" });
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  redirect(assurance?.currentLevel === "aal2" ? "/admin" : "/admin/mfa");
}

export async function adminLogoutAction() {
  const supabase = await createClient();
  await supabase.rpc("record_admin_auth_event", { p_event_type: "admin_logout", p_severity: "info" });
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}
