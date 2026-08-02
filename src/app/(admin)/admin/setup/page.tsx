import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { AdminSetupMfa } from "@/components/admin/setup-mfa";
import { AdminSetupTokenForm } from "@/components/admin/setup-token-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAdminSetupContext } from "@/server/admin/setup";

export const metadata: Metadata = { title: "Administrator setup", description: "One-time protected administrator setup." };
export const dynamic = "force-dynamic";

export default async function AdminSetupPage(){const context=await getAdminSetupContext();if(!context.available)notFound();const steps=["Account verified","Setup code verified","MFA enrolment","MFA confirmation","Administrator creation","Setup complete"];return <AuthShell eyebrow="One-time control" title="Create the first administrator" description="This route permanently closes after the first administrator is created."><ol className="mb-8 grid gap-2" aria-label="Setup progress">{steps.map((step,index)=>{const complete=index===0||(context.tokenVerified&&index===1);return <li key={step} className="flex items-center gap-2 text-sm text-muted">{complete?<CheckCircle2 aria-hidden className="size-4 text-emerald-strong"/>:<Circle aria-hidden className="size-4"/>}{step}</li>})}</ol>{context.tokenVerified?<AdminSetupMfa/>:<AdminSetupTokenForm/>}</AuthShell>}
