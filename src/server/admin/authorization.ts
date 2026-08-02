import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { getAdminContextWithClient, type AdminContext } from "@/server/admin/access-context";

export type { AdminContext } from "@/server/admin/access-context";

function developmentDiagnostic(reason: string) {
  if (process.env.NODE_ENV !== "production") console.warn(`[admin-auth] ${reason}`);
}

export async function diagnoseAdministrator(userId: string) {
  if (process.env.NODE_ENV === "production") return;
  try {
    const privileged = createPrivilegedClient();
    const { data: administrator } = await privileged.from("admin_users").select("status, role_id").eq("user_id", userId).maybeSingle();
    if (!administrator) return developmentDiagnostic("Missing administrator.");
    if (administrator.status !== "active") return developmentDiagnostic("Inactive administrator.");
    const { data: role } = await privileged.from("admin_roles").select("id").eq("id", administrator.role_id).maybeSingle();
    if (!role) developmentDiagnostic("Missing role.");
  } catch {
    // Diagnostics must never interfere with authorization or disclose credentials.
  }
}

export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getAdminContextWithClient(supabase);
});

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: active } = await supabase.rpc("is_current_user_active_admin");
  if (!active) {
    await diagnoseAdministrator(user.id);
    redirect("/admin/login?error=Access+is+not+authorized.");
  }
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") {
    developmentDiagnostic("Session remained AAL1.");
    redirect("/admin/mfa");
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
  return context;
}

export async function requireAdminPermission(permission: string) {
  const context = await requireAdmin();
  if (!context.permissions.includes(permission)) notFound();
  return context;
}
