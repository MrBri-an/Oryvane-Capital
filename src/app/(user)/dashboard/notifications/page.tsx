import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { DateValue, Label } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { markNotificationReadAction } from "@/server/dashboard/actions";
import { getDashboardIdentity, getNotifications } from "@/server/dashboard/data";

export const metadata: Metadata = { title: "Notifications", description: "Review your account notifications." };
export default async function NotificationsPage() {
  const [rows, identity] = await Promise.all([getNotifications(), getDashboardIdentity()]);
  return <DashboardSection eyebrow="Account updates" title="Notifications" description="Security, account and financial notices associated with your account.">{rows.length ? <div className="grid gap-3">{rows.map((row) => <Card key={row.id} className={row.read_at ? "" : "border-emerald/40"}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{row.title}</h2>{!row.read_at && <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-xs font-semibold text-emerald-strong">Unread</span>}</div><p className="mt-2 text-sm leading-6 text-muted">{row.body}</p><p className="mt-3 text-xs text-muted"><Label value={row.type} /> · <DateValue value={row.created_at} /></p></div>{!row.read_at && !identity.isRestricted && <form action={markNotificationReadAction}><input type="hidden" name="notificationId" value={row.id} /><Button type="submit" size="sm" variant="secondary">Mark as read</Button></form>}</div></Card>)}</div> : <EmptyState icon={Bell} title="No notifications" description="Account notifications will appear here when they exist." />}</DashboardSection>;
}
