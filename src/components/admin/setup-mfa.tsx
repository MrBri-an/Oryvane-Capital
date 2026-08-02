"use client";

import { QRCodeSVG } from "qrcode.react";
import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { createClient } from "@/lib/supabase/client";
import { completeAdminSetupAction } from "@/server/admin/setup-actions";

type Factor = { id: string; uri?: string; secret?: string };
export function AdminSetupMfa() {
  const [factor,setFactor]=useState<Factor|null>(null); const [code,setCode]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [verified,setVerified]=useState(false);
  const [completeState,completeAction,completing]=useActionState(completeAdminSetupAction,{ok:false});
  async function begin(){setBusy(true);setError("");const supabase=createClient();const listed=await supabase.auth.mfa.listFactors();const existing=listed.data?.totp.find(item=>item.status==="verified");if(existing){setFactor({id:existing.id});setBusy(false);return;}const enrolled=await supabase.auth.mfa.enroll({factorType:"totp",friendlyName:"Oryvane Super Administrator"});if(enrolled.error){setError("Authenticator enrolment could not be started.");}else setFactor({id:enrolled.data.id,uri:enrolled.data.totp.uri,secret:enrolled.data.totp.secret});setBusy(false);}
  async function verify(){if(!factor||code.length!==6)return;setBusy(true);setError("");const supabase=createClient();const challenge=await supabase.auth.mfa.challenge({factorId:factor.id});if(challenge.error){setError("Authenticator verification could not be completed.");setBusy(false);return;}const result=await supabase.auth.mfa.verify({factorId:factor.id,challengeId:challenge.data.id,code});if(result.error){setError("Authenticator verification could not be completed.");}else setVerified(true);setBusy(false);}
  if(verified)return <div className="grid gap-4"><Alert tone="success" title="MFA confirmed">The verified session meets the AAL2 requirement.</Alert>{completeState.message?<Alert tone="danger" title="Setup unavailable">{completeState.message}</Alert>:null}<form action={completeAction}><Button type="submit" disabled={completing}>{completing?"Creating…":"Create super administrator"}</Button></form></div>;
  if(!factor)return <div className="grid gap-4"><p className="text-sm text-muted">Enrol a TOTP authenticator before the administrator record can be created.</p>{error?<Alert tone="danger" title="Unable to continue">{error}</Alert>:null}<Button type="button" onClick={begin} disabled={busy}>{busy?"Preparing…":"Begin MFA enrolment"}</Button></div>;
  return <div className="grid gap-5">{error?<Alert tone="danger" title="Unable to verify">{error}</Alert>:null}{factor.uri?<div className="rounded-xl border border-border bg-surface p-5"><div className="mx-auto w-fit rounded-lg bg-white p-3"><QRCodeSVG value={factor.uri} size={184} title="Administrator authenticator enrollment QR code"/></div><p className="mt-4 text-sm font-semibold">Manual setup secret</p><code className="mt-2 block break-all text-xs text-muted">{factor.secret}</code></div>:null}<Field label="Six-digit authenticator code" htmlFor="setup-mfa-code"><Input id="setup-mfa-code" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} required/></Field><Button type="button" onClick={verify} disabled={busy||code.length!==6}>{busy?"Verifying…":"Confirm MFA"}</Button></div>;
}
