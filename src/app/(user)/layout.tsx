import type { ReactNode } from "react";

import { AccountUnavailable } from "@/components/dashboard/account-unavailable";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardIdentity } from "@/server/dashboard/data";

export default async function UserLayout({ children }: { children: ReactNode }) {
  const identity = await getDashboardIdentity();
  if (!identity.profile || identity.isDenied) {
    return <AccountUnavailable status={identity.profile?.status ?? "profile_unavailable"} />;
  }
  return <DashboardShell profile={identity.profile}>{children}</DashboardShell>;
}
