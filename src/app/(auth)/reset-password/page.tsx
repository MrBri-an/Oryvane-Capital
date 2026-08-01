import type { Metadata } from "next";
import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { resetPasswordAction } from "@/server/auth/actions";
export const metadata: Metadata = { title: "Choose a new password", description: "Securely update your Oryvane Capital password." };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const messages = await searchParams; return <AuthShell eyebrow="Account recovery" title="Choose a new password" description="Use 12–72 characters with upper- and lower-case letters, a number, and a symbol." footer={<Link className="text-emerald-strong hover:underline" href="/forgot-password">Request a new reset link</Link>}><AuthMessage {...messages} /><form action={resetPasswordAction} className="grid gap-5"><Field htmlFor="password" label="New password" hint="12–72 characters, including upper-case, lower-case, number, and symbol."><Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></Field><Field htmlFor="passwordConfirmation" label="Confirm new password"><Input id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></Field><Button type="submit">Update password</Button></form></AuthShell>; }
