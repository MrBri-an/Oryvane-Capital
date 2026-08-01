import { describe,expect,it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { safeRedirectPath } from "@/security/redirects";
import { maskSensitiveDestination } from "@/security/masking";
const source=(file:string)=>readFileSync(path.join(process.cwd(),file),"utf8");
describe("security contracts",()=>{
 it("allows only approved local redirects",()=>{expect(safeRedirectPath("/dashboard")).toBe("/dashboard");expect(safeRedirectPath("/reset-password?token=local")).toBe("/reset-password?token=local");for(const unsafe of ["https://evil.test","//evil.test","/\\evil","/admin","/dashboard/../admin"])expect(safeRedirectPath(unsafe)).toBe("/dashboard");});
 it("masks bank and Bitcoin destinations",()=>{expect(maskSensitiveDestination("bank_transfer",{account_number:"1234 5678"})).toBe("•••• 5678");expect(maskSensitiveDestination("bitcoin",{bitcoin_address:"bc1q123456789xyz"})).toBe("•••• 9xyz");expect(maskSensitiveDestination("bitcoin",{})).toBe("—");});
 it("protects dashboard and repeats dashboard authorization in the server layout",()=>{expect(source("src/lib/supabase/middleware.ts")).toContain('pathname.startsWith("/dashboard")');expect(source("src/app/(user)/layout.tsx")).toContain("getDashboardIdentity");expect(source("src/server/dashboard/data.ts")).toContain("permittedUserId");});
 it("isolates admin routes and mandates AAL2",()=>{const auth=source("src/server/admin/authorization.ts");expect(auth).toContain('currentLevel !== "aal2"');expect(auth).toContain("get_current_admin_context");expect(source("src/app/(admin)/admin/(protected)/layout.tsx")).toContain("requireAdmin");});
 it("keeps permission-aware controls server-authorized",()=>{const actions=source("src/server/admin/operation-actions.ts");expect(actions).toContain("requireAdminPermission");expect(actions).toContain("reauthenticate");expect(source("src/components/admin/navigation.tsx")).toContain("permissions.includes");});
 it("enforces account status in dashboard and financial operations",()=>{expect(source("src/app/(user)/layout.tsx")).toContain("identity.isDenied");for(const file of ["src/server/payments/actions.ts","src/server/investments/actions.ts","src/server/withdrawals/actions.ts"])expect(source(file)).toMatch(/profile\.status\s*!==\s*"active"/);});
 it("does not import privileged image or service-role processing into browser code",()=>{const clientFiles=["src/components/payments/payment-form.tsx","src/components/withdrawals/withdrawal-form.tsx","src/components/admin/operation-dialog.tsx"].map(source).join("\n");expect(clientFiles).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|next\/image|from ["']sharp/);});
});
