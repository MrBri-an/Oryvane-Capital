import type { ReactNode } from "react";
import { AdminNavigation } from "@/components/admin/navigation";
import type { AdminContext } from "@/server/admin/authorization";
export function AdminShell({ context, children }: { context: AdminContext; children: ReactNode }) { return <div className="min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]"><AdminNavigation role={context.role_name} permissions={context.permissions} /><main id="admin-content" className="min-w-0 px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pt-8"><div className="mx-auto max-w-7xl">{children}</div></main></div>; }
