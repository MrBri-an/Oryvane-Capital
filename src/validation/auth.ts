import { z } from "zod";

export const emailSchema = z.email("Enter a valid email address.").trim().toLowerCase().max(254);

export const passwordSchema = z.string()
  .min(12, "Use at least 12 characters.")
  .max(72, "Use no more than 72 characters.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a symbol.");

const requiredAcceptance = z.preprocess((value) => value === "on" || value === true, z.literal(true, { error: "Acceptance is required." }));

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: emailSchema,
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(24).regex(/^\+?[0-9 ()-]+$/, "Enter a valid phone number."),
  country: z.string().trim().min(2, "Enter your country.").max(80),
  password: passwordSchema,
  passwordConfirmation: z.string(),
  termsAccepted: requiredAcceptance,
  privacyAccepted: requiredAcceptance,
  riskAccepted: requiredAcceptance,
}).refine(({ password, passwordConfirmation }) => password === passwordConfirmation, { path: ["passwordConfirmation"], message: "Passwords do not match." });

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(72), redirectTo: z.string().optional() });
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ password: passwordSchema, passwordConfirmation: z.string() }).refine(({ password, passwordConfirmation }) => password === passwordConfirmation, { path: ["passwordConfirmation"], message: "Passwords do not match." });
