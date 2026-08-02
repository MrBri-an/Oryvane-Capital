import "server-only";
import { getServerEnvironment } from "@/config/env";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { securityLog } from "@/security/logging";

export async function scanPaymentReceipt(paymentId: string, path: string, bytes: ArrayBuffer, contentType: string) {
  const env = getServerEnvironment();
  if (!env.RECEIPT_SCANNER_URL || !env.RECEIPT_SCANNER_API_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    securityLog({ event: "receipt.scan_unavailable", outcome: "failed", resourceId: paymentId, reason: "scanner_not_configured" });
    return "unavailable" as const;
  }
  let status: "clean" | "infected" | "failed" = "failed";
  try {
    const response = await fetch(env.RECEIPT_SCANNER_URL, { method: "POST", headers: { authorization: `Bearer ${env.RECEIPT_SCANNER_API_KEY}`, "content-type": contentType, "x-receipt-path": path }, body: bytes, cache: "no-store", signal: AbortSignal.timeout(30_000) });
    const result = await response.json() as { status?: string };
    status = response.ok && result.status === "clean" ? "clean" : result.status === "infected" ? "infected" : "failed";
  } catch { status = "failed"; }
  const privileged = createPrivilegedClient();
  await privileged.rpc("record_payment_receipt_scan", { p_payment_id: paymentId, p_status: status, p_scanner: new URL(env.RECEIPT_SCANNER_URL).host });
  securityLog({ event: "receipt.scan_completed", outcome: status === "clean" ? "allowed" : "failed", resourceId: paymentId, reason: status });
  return status;
}
