"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { initialInvestmentState, requestInvestmentAction } from "@/server/investments/actions";
import { investmentRequestSchema, type InvestmentRequestValues } from "@/validation/investment";

export function InvestmentRequestForm({ planId, currency, minimum, maximum }: { planId: string; currency: string; minimum: number; maximum: number | null }) {
  const [state, action, pending] = useActionState(requestInvestmentAction, initialInvestmentState);
  const [transitionPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentRequestValues>({ resolver: zodResolver(investmentRequestSchema), defaultValues: { planId, currency, amount: "" } });
  useEffect(() => { if (state.status === "success") reset({ planId, currency, amount: "" }); }, [currency, planId, reset, state.status]);
  const submitting = pending || transitionPending;
  const submit = handleSubmit((values) => { if (submitting) return; const data = new FormData(); data.set("planId", planId); data.set("currency", currency); data.set("amount", values.amount); startTransition(() => action(data)); });
  return <form onSubmit={submit} noValidate className="grid gap-5">
    {state.status === "success" && <Alert tone="success" title="Request created">{state.message}</Alert>}
    {state.status === "error" && <Alert tone="danger" title="Request unsuccessful">{state.message}</Alert>}
    <input type="hidden" {...register("planId")} /><input type="hidden" {...register("currency")} />
    <Field label="Investment amount" htmlFor="investment-amount" hint={`Enter an amount in ${currency}.`} error={errors.amount?.message}><div className="relative"><Input id="investment-amount" inputMode="decimal" placeholder={String(minimum)} min={minimum} max={maximum ?? undefined} aria-invalid={Boolean(errors.amount)} className="pr-16" {...register("amount")} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">{currency}</span></div></Field>
    <p className="text-xs leading-5 text-muted">Submitting reserves the requested amount from your available balance. Investment values may rise or fall. Review the applicable terms before proceeding.</p>
    <Button type="submit" disabled={submitting}>{submitting ? "Reserving funds…" : "Request investment"}</Button>
  </form>;
}
