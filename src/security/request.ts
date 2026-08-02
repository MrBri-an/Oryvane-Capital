import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { getServerEnvironment } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import { securityLog } from "@/security/logging";

type RateLimitOptions = { scope: string; limit: number; windowSeconds: number; identifier?: string };

export async function validateSensitiveRequest() {
  const values = await headers();
  const env = getServerEnvironment();
  const expected = new URL(env.NEXT_PUBLIC_SITE_URL);
  const origin = values.get("origin");
  const forwardedHost = values.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? values.get("host");
  const forwardedProto = values.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto ?? expected.protocol.slice(0, -1);
  if (!host || host.toLowerCase() !== expected.host.toLowerCase() || protocol !== expected.protocol.slice(0, -1)) { securityLog({ event: "request.host_rejected", outcome: "denied", reason: "host_mismatch" }); throw new Error("Request origin is not allowed."); }
  if (origin && new URL(origin).origin !== expected.origin) { securityLog({ event: "request.origin_rejected", outcome: "denied", reason: "origin_mismatch" }); throw new Error("Request origin is not allowed."); }
  return values;
}

export async function enforceRateLimit(options: RateLimitOptions) {
  const values = await validateSensitiveRequest();
  const address = values.get("x-forwarded-for")?.split(",")[0]?.trim() ?? values.get("x-real-ip") ?? "unknown";
  const material = `${options.scope}:${address}:${options.identifier?.trim().toLowerCase() ?? ""}`;
  const key = createHash("sha256").update(material).digest("hex");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_rate_limit", { p_scope: options.scope, p_key_hash: key, p_limit: options.limit, p_window_seconds: options.windowSeconds });
  if (error || !data) { securityLog({ event: "request.rate_limited", outcome: "denied", reason: options.scope }); throw new Error("Request rate limit exceeded."); }
}
