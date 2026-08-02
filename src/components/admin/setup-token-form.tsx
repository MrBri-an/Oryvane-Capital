"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { verifyAdminSetupTokenAction } from "@/server/admin/setup-actions";

export function AdminSetupTokenForm() {
  const router = useRouter(); const [state, action, pending] = useActionState(verifyAdminSetupTokenAction, { ok: false });
  useEffect(() => { if (state.ok) router.refresh(); }, [router, state.ok]);
  return <form action={action} className="grid gap-5">{state.message?<Alert tone="danger" title="Setup unavailable">{state.message}</Alert>:null}<Field label="One-time setup code" htmlFor="admin-setup-token"><Input id="admin-setup-token" name="setupToken" type="password" autoComplete="off" required maxLength={512}/></Field><Button type="submit" disabled={pending}>{pending?"Verifying…":"Verify setup code"}</Button></form>;
}
