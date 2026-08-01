import type { Metadata } from "next";

import { DashboardSection } from "@/components/dashboard/section";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { updateProfileAction } from "@/server/dashboard/actions";
import { getDashboardIdentity } from "@/server/dashboard/data";

export const metadata: Metadata = { title: "Settings", description: "Manage approved nonfinancial profile details." };
type Props = { searchParams: Promise<{ saved?: string; error?: string }> };
export default async function SettingsPage({ searchParams }: Props) {
  const [identity, params] = await Promise.all([getDashboardIdentity(), searchParams]);
  const profile = identity.profile!;
  return <DashboardSection eyebrow="Account profile" title="Settings" description="Manage approved profile fields. Account status and financial data cannot be changed here.">
    {params.saved === "1" && <Alert className="mb-5" tone="success" title="Profile updated">Your approved profile fields were saved.</Alert>}
    {params.error && <Alert className="mb-5" tone="danger" title="Profile not updated">{params.error === "validation" ? "Check the entered values and try again." : params.error === "unavailable" ? "Profile changes are unavailable for this account status." : "The update could not be completed. Try again later."}</Alert>}
    {!identity.canUpdateProfile && <Alert className="mb-5" tone="warning" title="Changes unavailable">Restricted accounts may review their profile but cannot submit changes.</Alert>}
    <Card className="max-w-2xl"><CardHeader><CardTitle>Personal details</CardTitle><CardDescription>Only your name, phone number and country are editable.</CardDescription></CardHeader><form action={updateProfileAction} className="grid gap-5"><Field label="Full name" htmlFor="fullName"><Input id="fullName" name="fullName" defaultValue={profile.full_name} required minLength={2} maxLength={120} autoComplete="name" disabled={!identity.canUpdateProfile} /></Field><Field label="Phone number" htmlFor="phone"><Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} maxLength={40} autoComplete="tel" disabled={!identity.canUpdateProfile} /></Field><Field label="Country" htmlFor="country"><Input id="country" name="country" defaultValue={profile.country ?? ""} maxLength={80} autoComplete="country-name" disabled={!identity.canUpdateProfile} /></Field><div><Button type="submit" disabled={!identity.canUpdateProfile}>Save profile</Button></div></form></Card>
  </DashboardSection>;
}
