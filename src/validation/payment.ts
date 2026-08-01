import { z } from "zod";

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
export const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

const receiptSchema = z.custom<File | null>((value) => value === null || (typeof File !== "undefined" && value instanceof File), "Choose a valid receipt file.")
  .refine((file) => !file || file.size <= MAX_RECEIPT_BYTES, "Receipt must be 10 MiB or smaller.")
  .refine((file) => !file || RECEIPT_TYPES.includes(file.type as (typeof RECEIPT_TYPES)[number]), "Receipt must be a JPEG, PNG, WebP, or PDF.");

export const paymentFormSchema = z.object({
  method: z.enum(["bank_transfer", "bitcoin"]),
  amount: z.string().trim().regex(/^\d+(?:\.\d{1,18})?$/, "Enter a valid positive amount with up to 18 decimal places.").refine((value) => /[1-9]/.test(value), "Amount must be greater than zero."),
  senderName: z.string().trim().max(120).optional().default(""),
  externalReference: z.string().trim().min(1, "A transaction reference is required.").max(200),
  userNote: z.string().trim().max(1000, "Note must be 1,000 characters or fewer.").optional().default(""),
  receipt: receiptSchema,
}).superRefine((value, context) => {
  if (value.method === "bank_transfer") {
    if (value.senderName.length < 2) context.addIssue({ code: "custom", path: ["senderName"], message: "Sender name is required." });
    if (!value.receipt || value.receipt.size === 0) context.addIssue({ code: "custom", path: ["receipt"], message: "A payment receipt is required." });
  }
  if (value.method === "bitcoin" && !/^[0-9A-Fa-f]{64}$/.test(value.externalReference)) context.addIssue({ code: "custom", path: ["externalReference"], message: "Enter a valid 64-character Bitcoin transaction hash." });
});

export type PaymentFormValues = z.input<typeof paymentFormSchema>;
