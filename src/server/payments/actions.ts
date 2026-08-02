"use server";

import { revalidatePath } from "next/cache";

import { getPaymentConfiguration } from "@/config/payments";
import { createClient } from "@/lib/supabase/server";
import { getDashboardIdentity } from "@/server/dashboard/data";
import { paymentFormSchema, RECEIPT_TYPES } from "@/validation/payment";
import { enforceRateLimit } from "@/security/request";
import { scanPaymentReceipt } from "@/server/payments/scanning";

export type PaymentActionState = { status: "idle" | "success" | "error"; message?: string; reference?: string };
export const initialPaymentState: PaymentActionState = { status: "idle" };

const extensions: Record<(typeof RECEIPT_TYPES)[number], string[]> = {
  "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"], "application/pdf": ["pdf"],
};

function fileFrom(formData: FormData) {
  const value = formData.get("receipt");
  return value instanceof File && value.size > 0 ? value : null;
}

function signatureMatches(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (type === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  return false;
}

async function validateFile(file: File) {
  const allowed = RECEIPT_TYPES.includes(file.type as (typeof RECEIPT_TYPES)[number]);
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  if (!allowed || !extensions[file.type as keyof typeof extensions]?.includes(extension)) return false;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return signatureMatches(file.type, bytes);
}

export async function submitPaymentAction(_previous: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  await enforceRateLimit({ scope: "payment.submit", limit: 5, windowSeconds: 3600 });
  const identity = await getDashboardIdentity();
  if (!identity.profile || identity.profile.status !== "active") return { status: "error", message: "Payment submission is unavailable for this account." };

  const parsed = paymentFormSchema.safeParse({ method: formData.get("method"), amount: formData.get("amount"), senderName: formData.get("senderName"), externalReference: formData.get("externalReference"), userNote: formData.get("userNote"), receipt: fileFrom(formData) });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the payment details and try again." };

  const config = getPaymentConfiguration();
  if (parsed.data.method === "bank_transfer" && !config.bank) return { status: "error", message: "Bank transfer is not currently configured." };
  if (parsed.data.method === "bitcoin" && !config.bitcoin) return { status: "error", message: "Bitcoin payments are not currently configured." };
  if (parsed.data.receipt && !(await validateFile(parsed.data.receipt))) return { status: "error", message: "The receipt content does not match an accepted file type." };

  const supabase = await createClient();
  const externalReference = parsed.data.externalReference.trim();
  const { data: duplicate } = await supabase.from("payment_submissions").select("id").eq("user_id", identity.user.id).eq("method", parsed.data.method).ilike("external_reference", externalReference).not("status", "in", '(rejected,cancelled)').limit(1).maybeSingle();
  if (duplicate) return { status: "error", message: "This payment reference has already been submitted." };

  const submissionId = crypto.randomUUID();
  const currency = parsed.data.method === "bank_transfer" ? config.bank!.currency : "BTC";
  const { error: insertError } = await supabase.from("payment_submissions").insert({ id: submissionId, user_id: identity.user.id, method: parsed.data.method, submitted_amount: parsed.data.amount as unknown as number, currency, sender_name: parsed.data.method === "bank_transfer" ? parsed.data.senderName : null, external_reference: externalReference, user_note: parsed.data.userNote || null });
  if (insertError) return { status: "error", message: insertError.code === "23505" ? "This Bitcoin transaction hash has already been submitted." : "The payment draft could not be created." };

  let receiptPath: string | null = null;
  let scanStatus: "clean" | "infected" | "failed" | "unavailable" | null = null;
  if (parsed.data.receipt) {
    const extension = parsed.data.receipt.name.toLowerCase().split(".").pop();
    receiptPath = `${identity.user.id}/${submissionId}/quarantine/receipt.${extension}`;
    const bytes = await parsed.data.receipt.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from("payment-receipts").upload(receiptPath, bytes, { contentType: parsed.data.receipt.type, upsert: false });
    if (uploadError) return { status: "error", message: "The receipt could not be uploaded. Your draft was not submitted for review." };
    const { error: pathError } = await supabase.from("payment_submissions").update({ receipt_path: receiptPath }).eq("id", submissionId).eq("user_id", identity.user.id).eq("status", "draft");
    if (pathError) { await supabase.storage.from("payment-receipts").remove([receiptPath]); return { status: "error", message: "The receipt could not be attached. Your draft was not submitted for review." }; }
    scanStatus = await scanPaymentReceipt(submissionId, receiptPath, bytes, parsed.data.receipt.type);
  }

  const { data: internalReference, error: submitError } = await supabase.rpc("submit_payment_for_review", { p_payment_id: submissionId });
  if (submitError || !internalReference) {
    if (receiptPath) {
      await supabase.storage.from("payment-receipts").remove([receiptPath]);
      await supabase.from("payment_submissions").update({ receipt_path: null }).eq("id", submissionId).eq("user_id", identity.user.id).eq("status", "draft");
    }
    return { status: "error", message: submitError?.code === "23505" ? "This Bitcoin transaction hash has already been submitted." : "The payment could not be submitted for review." };
  }

  revalidatePath("/dashboard/deposits");
  revalidatePath("/dashboard");
  return { status: "success", message: scanStatus && scanStatus !== "clean" ? "Payment submitted, but its receipt remains quarantined until malware scanning succeeds." : "Payment submitted for review.", reference: internalReference };
}
