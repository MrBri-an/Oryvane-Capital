import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { resendVerificationAction } from "@/server/auth/actions";
export const metadata: Metadata = { title: "Verify your email", description: "Confirm your email address to continue with Oryvane Capital." };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) { const messages = await searchParams; return <AuthShell eyebrow="Email verification" title="Check your inbox" description="Use the verification link sent by Supabase Auth. Financial features remain unavailable until verification succeeds." footer={<Link className="text-emerald-strong hover:underline" href="/login">Continue to login</Link>}><AuthMessage {...messages} /><div className="mb-8 grid size-12 place-items-center rounded-full bg-emerald/10 text-emerald-strong"><MailCheck aria-hidden className="size-6" /></div><form action={resendVerificationAction} className="grid gap-5"><Field htmlFor="email" label="Resend verification email"><Input id="email" name="email" type="email" autoComplete="email" required /></Field><Button type="submit" variant="secondary">Resend email</Button></form></AuthShell>; }
