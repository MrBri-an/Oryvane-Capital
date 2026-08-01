import type { Metadata } from "next";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { adminLoginAction } from "@/server/admin/auth-actions";
export const metadata: Metadata = { title: "Admin login", description: "Separate authorized administrator access." };
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const params = await searchParams; return <AuthShell eyebrow="Admin portal" title="Restricted access" description="Sign in with an approved administrator account. Authenticator MFA is mandatory."><AuthMessage error={params.error} /><form action={adminLoginAction} className="grid gap-5"><Field label="Administrator email" htmlFor="admin-email"><Input id="admin-email" name="email" type="email" autoComplete="username" required /></Field><Field label="Password" htmlFor="admin-password"><Input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={72} required /></Field><Button type="submit">Continue securely</Button></form><p className="mt-6 text-xs leading-5 text-muted">There is no administrator registration route. Access requires an approved active record, assigned role, permissions, and AAL2.</p></AuthShell>; }
