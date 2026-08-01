"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { initialPaymentState, submitPaymentAction } from "@/server/payments/actions";
import { MAX_RECEIPT_BYTES, paymentFormSchema, type PaymentFormValues } from "@/validation/payment";

export function PaymentForm({ method, currency }: { method: "bank_transfer" | "bitcoin"; currency: string }) {
  const [state, dispatch, actionPending] = useActionState(submitPaymentAction, initialPaymentState);
  const [transitionPending, startTransition] = useTransition();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentFormSchema), defaultValues: { method, amount: "", senderName: "", externalReference: "", userNote: "", receipt: null } });
  const pending = actionPending || transitionPending;
  useEffect(() => { if (state.status === "success") reset({ method, amount: "", senderName: "", externalReference: "", userNote: "", receipt: null }); }, [method, reset, state.status]);

  const submit = handleSubmit((values) => {
    if (pending) return;
    const data = new FormData();
    data.set("method", method);
    data.set("amount", values.amount);
    data.set("senderName", values.senderName ?? "");
    data.set("externalReference", values.externalReference);
    data.set("userNote", values.userNote ?? "");
    if (values.receipt) data.set("receipt", values.receipt);
    startTransition(() => dispatch(data));
  });

  return <form onSubmit={submit} noValidate className="grid gap-5">
    {state.status === "success" && <Alert tone="success" title="Payment submitted">{state.message} Your internal reference is <span className="font-reference text-foreground">{state.reference}</span>.</Alert>}
    {state.status === "error" && <Alert tone="danger" title="Submission failed">{state.message}</Alert>}
    <input type="hidden" {...register("method")} />
    <div className="grid gap-5 sm:grid-cols-2"><Field label={method === "bitcoin" ? "Amount sent" : "Amount"} htmlFor={`${method}-amount`} error={errors.amount?.message}><Input id={`${method}-amount`} inputMode="decimal" placeholder="0.00" aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? `${method}-amount-error` : undefined} {...register("amount")} /></Field><Field label="Currency" htmlFor={`${method}-currency`} hint="Configured by Oryvane Capital."><Input id={`${method}-currency`} value={currency} readOnly aria-readonly="true" /></Field></div>
    {method === "bank_transfer" && <Field label="Sender name" htmlFor="bank-sender" error={errors.senderName?.message}><Input id="bank-sender" autoComplete="name" maxLength={120} aria-invalid={Boolean(errors.senderName)} {...register("senderName")} /></Field>}
    <Field label={method === "bitcoin" ? "Bitcoin transaction hash" : "Bank transaction reference"} htmlFor={`${method}-reference`} error={errors.externalReference?.message}><Input id={`${method}-reference`} className={method === "bitcoin" ? "font-reference" : undefined} maxLength={200} autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-invalid={Boolean(errors.externalReference)} {...register("externalReference")} /></Field>
    <Field label={`Payment receipt${method === "bitcoin" ? " (optional)" : ""}`} htmlFor={`${method}-receipt`} hint="JPEG, PNG, WebP, or PDF. Maximum 10 MiB." error={errors.receipt?.message}><Controller name="receipt" control={control} render={({ field: { onChange, ref, name } }) => <Input id={`${method}-receipt`} ref={ref} name={name} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" aria-invalid={Boolean(errors.receipt)} onChange={(event) => onChange(event.target.files?.[0] ?? null)} />} /></Field>
    <Field label="Note (optional)" htmlFor={`${method}-note`} error={errors.userNote?.message}><Textarea id={`${method}-note`} maxLength={1000} placeholder="Add context for the payment review team." aria-invalid={Boolean(errors.userNote)} {...register("userNote")} /></Field>
    <p className="text-xs leading-5 text-muted">Receipts remain private. Maximum upload size: {MAX_RECEIPT_BYTES / 1024 / 1024} MiB. Submitting does not credit your account; the payment remains pending review.</p>
    <div><Button type="submit" disabled={pending} aria-disabled={pending}>{pending ? "Submitting securely…" : "Submit for review"}</Button></div>
  </form>;
}
