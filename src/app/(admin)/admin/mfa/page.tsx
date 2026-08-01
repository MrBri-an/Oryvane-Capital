import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminMfaSetup } from "@/components/admin/mfa-setup";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Admin MFA", description: "Complete mandatory administrator authenticator verification." };
export default async function AdminMfaPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/admin/login"); const { data: active } = await supabase.rpc("is_current_user_active_admin"); if (!active) { await supabase.auth.signOut({ scope: "local" }); redirect("/admin/login?error=Access+is+not+authorized."); } const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(); if (assurance?.currentLevel === "aal2") redirect("/admin"); return <AuthShell eyebrow="Mandatory MFA" title="Verify your administrator session" description="Use a TOTP authenticator to reach the required AAL2 assurance level."><AdminMfaSetup /></AuthShell>; }
