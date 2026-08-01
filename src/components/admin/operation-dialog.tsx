"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import type { OperationState } from "@/server/admin/operation-actions";

const initial: OperationState = { ok: false, message: "" };
export function OperationDialog({ label, title, description, action, hidden, children, tone="secondary" }: { label:string; title:string; description:string; action:(state:OperationState,form:FormData)=>Promise<OperationState>; hidden?:Record<string,string>; children?:ReactNode; tone?:"primary"|"secondary"|"danger" }) {
 const [open,setOpen]=useState(false); const [state,formAction,pending]=useActionState(action,initial);
 return <><Button type="button" variant={tone} size="sm" onClick={()=>setOpen(true)}>{label}</Button><Modal open={open} onClose={()=>setOpen(false)} title={title} description={description}><form action={formAction} className="grid gap-4">{Object.entries(hidden??{}).map(([name,value])=><input key={name} type="hidden" name={name} value={value}/>)}{children}<Field label="Current authenticator code" htmlFor={`${title}-totp`}><Input id={`${title}-totp`} name="totp_code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></Field><label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1 accent-emerald"/><span>I confirm this protected operation and understand that it will be audited.</span></label>{state.message?<Alert tone={state.ok?"success":"danger"} title={state.ok?"Operation complete":"Operation failed"}>{state.message}</Alert>:null}<div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={()=>setOpen(false)}>{state.ok?"Close":"Cancel"}</Button>{!state.ok?<Button type="submit" variant={tone} disabled={pending}>{pending?"Verifying…":"Confirm operation"}</Button>:null}</div></form></Modal></>;
}
