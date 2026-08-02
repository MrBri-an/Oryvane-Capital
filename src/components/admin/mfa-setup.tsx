"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { createClient } from "@/lib/supabase/client";
import { verifyAdminMfaAction } from "@/server/admin/auth-actions";

type Factor = { id: string; uri?: string; secret?: string };
export function AdminMfaSetup() {
  const searchParams = useSearchParams(); const [factor, setFactor] = useState<Factor | null>(null); const [code, setCode] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(true);
  useEffect(() => { let live = true; void (async () => { const supabase = createClient(); const { data } = await supabase.auth.mfa.listFactors(); const verified = data?.totp.find((item) => item.status === "verified"); if (verified) { if (live) setFactor({ id: verified.id }); } else { const enrolled = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Oryvane Admin" }); if (enrolled.error) { if (live) setError("Authenticator enrollment could not be started."); } else if (live) setFactor({ id: enrolled.data.id, uri: enrolled.data.totp.uri, secret: enrolled.data.totp.secret }); } if (live) setBusy(false); })(); return () => { live = false; }; }, []);
  const displayedError = error || searchParams.get("error");
  if (busy && !factor) return <p role="status" className="text-sm text-muted">Preparing authenticator verification…</p>;
  return <form action={verifyAdminMfaAction} className="grid gap-5">{displayedError && <Alert tone="danger" title="Unable to verify">{displayedError}</Alert>}<input type="hidden" name="factorId" value={factor?.id ?? ""} />{factor?.uri && <div className="grid gap-5 rounded-xl border border-border bg-surface p-5"><div className="mx-auto rounded-lg bg-white p-3"><QRCodeSVG value={factor.uri} size={184} title="Authenticator enrollment QR code" /></div><div><p className="text-sm font-semibold">Can’t scan the code?</p><code className="mt-2 block break-all text-xs text-muted">{factor.secret}</code></div></div>}<Field label="Six-digit authenticator code" htmlFor="admin-mfa-code"><Input id="admin-mfa-code" name="code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></Field><Button type="submit" disabled={busy || !factor || code.length !== 6}>Verify and continue</Button></form>;
}
