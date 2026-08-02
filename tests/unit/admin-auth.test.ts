import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { getAdminContextWithClient } from "@/server/admin/access-context";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");
const userId = "3eaf6efb-6879-45d9-88ef-07c7dcb8168e";
const adminId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const roleId = "a0000000-0000-0000-0000-000000000001";

function clientWithContext(permissions: string[]) {
  return {
    rpc: vi.fn().mockResolvedValue({
      data: { admin_id: adminId, user_id: userId, status: "active", role_id: roleId, role_name: "Super administrator", permissions, aal: "aal2" },
      error: null,
    }),
  } as unknown as SupabaseClient<Database>;
}

describe("administrator MFA authorization repair", () => {
  it("accepts the Super administrator context with portal access", async () => {
    const context = await getAdminContextWithClient(clientWithContext(["portal.access", "admins.view"]));
    expect(context).toMatchObject({ user_id: userId, role_id: roleId, role_name: "Super administrator", aal: "aal2" });
    expect(context?.permissions).toContain("portal.access");
  });

  it("denies a context whose required permission is missing", async () => {
    const context = await getAdminContextWithClient(clientWithContext(["users.view"]));
    expect(context?.permissions.includes("portal.access")).toBe(false);
    expect(source("src/server/admin/authorization.ts")).toContain('context.permissions.includes("portal.access")');
  });

  it("refreshes the post-verification session before checking AAL2 and the user again", () => {
    const action = source("src/server/admin/auth-actions.ts");
    const verify = action.indexOf("mfa.verify");
    const session = action.indexOf("auth.getSession()", verify);
    const assurance = action.indexOf("getAuthenticatorAssuranceLevel()", session);
    const user = action.indexOf("auth.getUser()", assurance);
    expect(verify).toBeGreaterThan(-1);
    expect(session).toBeGreaterThan(verify);
    expect(assurance).toBeGreaterThan(session);
    expect(user).toBeGreaterThan(assurance);
  });

  it("denies stale AAL1 and inactive administrators", () => {
    const authorization = source("src/server/admin/authorization.ts");
    expect(authorization).toContain('currentLevel !== "aal2"');
    expect(authorization).toContain("is_current_user_active_admin");
    expect(authorization).toContain("Inactive administrator.");
  });

  it("uses admin_users.role_id and admin_permissions.key without legacy assumptions", () => {
    const sql = [
      source("supabase/migrations/20260801211000_phase6_rls_and_functions.sql"),
      source("supabase/migrations/20260802000000_phase10a_admin_foundation.sql"),
    ].join("\n");
    expect(sql).toContain("arp.role_id = au.role_id");
    expect(sql).toContain("ap.id = arp.permission_id");
    expect(sql).toContain("ap.key = permission_key");
    expect(sql).not.toContain("admin_user_roles");
    expect(sql).not.toContain("admin_permissions.code");
  });
});
