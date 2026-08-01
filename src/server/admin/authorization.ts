import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const contextSchema = z.object({ admin_id: z.string().uuid(), user_id: z.string().uuid(), status: z.literal("active"), role_id: z.string().uuid(), role_name: z.string(), permissions: z.array(z.string()), aal: z.literal("aal2") });
export type AdminContext = z.infer<typeof contextSchema>;

export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.rpc("get_current_admin_context");
  const parsed = contextSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
});

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") redirect("/admin/mfa");
  const context = await getAdminContext();
  if (!context || !context.permissions.includes("portal.access")) redirect("/admin/login?error=Access+is+not+authorized.");
  return context;
}

export async function requireAdminPermission(permission: string) {
  const context = await requireAdmin();
  if (!context.permissions.includes(permission)) notFound();
  return context;
}
