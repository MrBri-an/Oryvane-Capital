import type { ReactNode } from "react";

import { DashboardNavigation } from "@/components/dashboard/navigation";
import type { Profile } from "@/server/dashboard/data";

export function DashboardShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  return <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"><DashboardNavigation name={profile.full_name} status={profile.status} /><main id="dashboard-content" className="min-w-0 px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pt-8"><div className="mx-auto max-w-7xl">{children}</div></main></div>;
}
