import type { ReactNode } from "react";
import { AdminNavigation } from "@/components/admin/navigation";
import type { AdminContext } from "@/server/admin/authorization";
export function AdminShell({ context, children }: { context: AdminContext; children: ReactNode }) { return <div className="min-h-screen bg-[linear-gradient(135deg,#030706_0%,#07100e_55%,#030706_100%)] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]"><AdminNavigation role={context.role_name} permissions={context.permissions} /><main id="admin-content" className="min-w-0 px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10"><div className="mx-auto max-w-7xl">{children}</div></main></div>; }
