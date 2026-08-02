"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/security/request";
import { getAdminContextWithClient } from "@/server/admin/access-context";
import { diagnoseAdministrator } from "@/server/admin/authorization";

const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(72) });
const mfaSchema = z.object({ factorId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) });
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

function developmentDiagnostic(reason: string) {
  if (process.env.NODE_ENV !== "production") console.warn(`[admin-auth] ${reason}`);
}

export async function verifyAdminMfaAction(formData: FormData) {
  const parsed = mfaSchema.safeParse({ factorId: value(formData, "factorId"), code: value(formData, "code") });
  if (!parsed.success) redirect("/admin/mfa?error=The+verification+code+is+invalid+or+expired.");

  const supabase = await createClient();
  const before = await supabase.auth.getUser();
  if (!before.data.user) redirect("/admin/login");
  const { data: activeBefore } = await supabase.rpc("is_current_user_active_admin");
  if (!activeBefore) redirect("/admin/login?error=Access+is+not+authorized.");

  const challenge = await supabase.auth.mfa.challenge({ factorId: parsed.data.factorId });
  if (challenge.error) redirect("/admin/mfa?error=The+verification+challenge+could+not+be+created.");
  const verified = await supabase.auth.mfa.verify({ factorId: parsed.data.factorId, challengeId: challenge.data.id, code: parsed.data.code });
  if (verified.error) redirect("/admin/mfa?error=The+verification+code+is+invalid+or+expired.");

  // Verification rotates the session. Re-read it from this cookie-writing Server Action;
  // never authorize with the password-only session captured before MFA.
  const refreshed = await supabase.auth.getSession();
  if (refreshed.error || !refreshed.data.session) {
    developmentDiagnostic("Cookie refresh failure.");
    redirect("/admin/mfa?error=The+secure+session+could+not+be+refreshed.");
  }
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") {
    developmentDiagnostic("Session remained AAL1.");
    redirect("/admin/mfa?error=The+secure+session+was+not+elevated.");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    developmentDiagnostic("Cookie refresh failure.");
    redirect("/admin/login");
  }
  const { data: active } = await supabase.rpc("is_current_user_active_admin");
  if (!active) {
    await diagnoseAdministrator(user.id);
    redirect("/admin/login?error=Access+is+not+authorized.");
  }
  const context = await getAdminContextWithClient(supabase);
  if (!context) {
    developmentDiagnostic("Missing role.");
    redirect("/admin/login?error=Access+is+not+authorized.");
  }
  if (!context.permissions.includes("portal.access")) {
    developmentDiagnostic("Missing portal.access.");
    redirect("/admin/login?error=Access+is+not+authorized.");
  }
  await supabase.rpc("record_admin_auth_event", { p_event_type: "admin_mfa_verified", p_severity: "info" });
  redirect("/admin");
}
