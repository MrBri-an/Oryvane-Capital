import type { ReactNode } from "react";

import { DashboardNavigation } from "@/components/dashboard/navigation";
import type { Profile } from "@/server/dashboard/data";

export function DashboardShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  return <div className="market-grid min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"><DashboardNavigation name={profile.full_name} status={profile.status} /><main id="dashboard-content" className="relative min-w-0 px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10"><div aria-hidden className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald/5 blur-3xl" /><div className="relative mx-auto max-w-7xl">{children}</div></main></div>;
}
