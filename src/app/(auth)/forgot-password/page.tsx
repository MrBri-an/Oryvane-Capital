import type { Metadata } from "next";
import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { forgotPasswordAction } from "@/server/auth/actions";
export const metadata: Metadata = { title: "Forgot password", description: "Request secure Oryvane Capital password reset instructions." };
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) { const messages = await searchParams; return <AuthShell eyebrow="Account recovery" title="Reset your password" description="Enter your email. The response is deliberately the same whether or not an account exists." footer={<Link className="text-emerald-strong hover:underline" href="/login">Return to login</Link>}><AuthMessage {...messages} /><form action={forgotPasswordAction} className="grid gap-5"><Field htmlFor="email" label="Email address"><Input id="email" name="email" type="email" autoComplete="email" required /></Field><Button type="submit">Send reset instructions</Button></form></AuthShell>; }
