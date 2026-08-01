import type { Metadata } from "next";
import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { loginAction } from "@/server/auth/actions";
import { redirectAuthenticatedUser } from "@/server/auth/guards";
import { safeRedirectPath } from "@/security/redirects";
export const metadata: Metadata = { title: "Log in", description: "Sign in securely to your Oryvane Capital account." };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string; redirectTo?: string }> }) { await redirectAuthenticatedUser(); const params = await searchParams; return <AuthShell eyebrow="User access" title="Welcome back" description="Sign in with the email and password managed by Supabase Auth." footer={<>New to Oryvane? <Link className="text-emerald-strong hover:underline" href="/register">Create an account</Link></>}><AuthMessage error={params.error} success={params.success} /><form action={loginAction} className="grid gap-5"><input type="hidden" name="redirectTo" value={safeRedirectPath(params.redirectTo)} /><Field htmlFor="email" label="Email address"><Input id="email" name="email" type="email" autoComplete="email" required /></Field><Field htmlFor="password" label="Password"><Input id="password" name="password" type="password" autoComplete="current-password" maxLength={72} required /></Field><div className="flex justify-end"><Link className="text-sm text-emerald-strong hover:underline" href="/forgot-password">Forgot password?</Link></div><Button type="submit">Log in</Button></form></AuthShell>; }
