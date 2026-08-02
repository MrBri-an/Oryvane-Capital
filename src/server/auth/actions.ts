"use server";

import { redirect } from "next/navigation";

import { getServerEnvironment } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/security/redirects";
import { enforceRateLimit } from "@/security/request";
import { forgotPasswordSchema, loginSchema, registrationSchema, resetPasswordSchema } from "@/validation/auth";

function value(formData: FormData, name: string) { const item = formData.get(name); return typeof item === "string" ? item : ""; }
function withMessage(path: string, type: "error" | "success", message: string) { return `${path}?${new URLSearchParams({ [type]: message })}`; }

export async function registerAction(formData: FormData) {
  await enforceRateLimit({ scope: "auth.register", limit: 5, windowSeconds: 3600, identifier: value(formData, "email") });
  const result = registrationSchema.safeParse({ fullName: value(formData, "fullName"), email: value(formData, "email"), phone: value(formData, "phone"), country: value(formData, "country"), password: value(formData, "password"), passwordConfirmation: value(formData, "passwordConfirmation"), termsAccepted: formData.get("termsAccepted"), privacyAccepted: formData.get("privacyAccepted"), riskAccepted: formData.get("riskAccepted") });
  if (!result.success) redirect(withMessage("/register", "error", result.error.issues[0]?.message ?? "Review your details and try again."));

  const { fullName, email, phone, country, password } = result.data;
  const env = getServerEnvironment();
  const supabase = await createClient();
  const acceptedAt = new Date().toISOString();
  const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/dashboard`, data: { full_name: fullName, phone, country, terms_accepted_at: acceptedAt, privacy_accepted_at: acceptedAt, risk_accepted_at: acceptedAt } } });
  if (error) redirect(withMessage("/register", "error", "We could not create the account. Please try again later."));
  redirect("/verify-email");
}

export async function loginAction(formData: FormData) {
  await enforceRateLimit({ scope: "auth.login", limit: 10, windowSeconds: 900, identifier: value(formData, "email") });
  const result = loginSchema.safeParse({ email: value(formData, "email"), password: value(formData, "password"), redirectTo: value(formData, "redirectTo") });
  if (!result.success) redirect(withMessage("/login", "error", "Email or password is incorrect."));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: result.data.email, password: result.data.password });
  if (error) redirect(withMessage("/login", "error", "Email or password is incorrect."));
  const { data: loginRestriction } = await supabase.from("account_restrictions").select("id").eq("type", "login").eq("active", true).lte("starts_at", new Date().toISOString()).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).limit(1).maybeSingle();
  if (loginRestriction) {
    await supabase.auth.signOut({ scope: "local" });
    redirect(withMessage("/login", "error", "Access is unavailable. Contact support if you believe this is an error."));
  }
  redirect(safeRedirectPath(result.data.redirectTo));
}

export async function forgotPasswordAction(formData: FormData) {
  await enforceRateLimit({ scope: "auth.recovery", limit: 5, windowSeconds: 3600, identifier: value(formData, "email") });
  const result = forgotPasswordSchema.safeParse({ email: value(formData, "email") });
  if (result.success) {
    const env = getServerEnvironment();
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(result.data.email, { redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password` });
  }
  redirect(withMessage("/forgot-password", "success", "If an account matches that email, password reset instructions will be sent."));
}

export async function resendVerificationAction(formData: FormData) {
  const result = forgotPasswordSchema.safeParse({ email: value(formData, "email") });
  if (result.success) {
    const env = getServerEnvironment();
    const supabase = await createClient();
    await supabase.auth.resend({ type: "signup", email: result.data.email, options: { emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/dashboard` } });
  }
  redirect(withMessage("/verify-email", "success", "If a matching unverified account exists, a new verification email will be sent."));
}

export async function resetPasswordAction(formData: FormData) {
  const result = resetPasswordSchema.safeParse({ password: value(formData, "password"), passwordConfirmation: value(formData, "passwordConfirmation") });
  if (!result.success) redirect(withMessage("/reset-password", "error", result.error.issues[0]?.message ?? "Choose a valid password."));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(withMessage("/forgot-password", "error", "This reset link is invalid or has expired. Request a new one."));
  const { error } = await supabase.auth.updateUser({ password: result.data.password });
  if (error) redirect(withMessage("/reset-password", "error", "We could not update the password. Request a new reset link."));
  await supabase.auth.signOut({ scope: "global" });
  redirect(withMessage("/login", "success", "Password updated. Sign in with your new password."));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
