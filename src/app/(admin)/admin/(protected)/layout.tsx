import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/server/admin/authorization";
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) { const context = await requireAdmin(); return <AdminShell context={context}>{children}</AdminShell>; }
