"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState,useState } from "react";
import { useForm,useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field,Input,Select,Textarea } from "@/components/ui/form-controls";
import { initialWithdrawalState,submitWithdrawalAction } from "@/server/withdrawals/actions";
import { withdrawalSchema,type WithdrawalInput } from "@/validation/withdrawal";

export function WithdrawalForm({currencies,canSubmit}:{currencies:string[];canSubmit:boolean}){
 const[state,action,pending]=useActionState(submitWithdrawalAction,initialWithdrawalState);
 const[requestId]=useState(()=>crypto.randomUUID());
 const{register,control,formState:{errors}}=useForm<WithdrawalInput>({resolver:zodResolver(withdrawalSchema),defaultValues:{method:"bank_transfer",currency:currencies[0]??""}});
 const method=useWatch({control,name:"method"});
 if(!canSubmit)return <Alert tone="warning" title="Withdrawals unavailable">Your account must be active and unrestricted before submitting a withdrawal.</Alert>;
 if(!currencies.length)return <Alert tone="warning" title="No available wallet">A funded wallet is required before a withdrawal can be requested.</Alert>;
 return <form action={action} className="grid gap-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
  <input type="hidden" name="requestId" value={requestId}/>
  <div className="grid gap-5 sm:grid-cols-2">
   <Field label="Method" htmlFor="withdrawal-method" error={errors.method?.message}><Select id="withdrawal-method" {...register("method")}><option value="bank_transfer">Bank withdrawal</option><option value="bitcoin">Bitcoin withdrawal</option></Select></Field>
   <Field label="Currency" htmlFor="withdrawal-currency" error={errors.currency?.message}><Select id="withdrawal-currency" {...register("currency")}>{currencies.map(c=><option key={c}>{c}</option>)}</Select></Field>
   <Field label="Amount" htmlFor="withdrawal-amount" error={errors.amount?.message}><Input id="withdrawal-amount" inputMode="decimal" {...register("amount")}/></Field>
  </div>
  {method==="bank_transfer"?<div className="grid gap-5 sm:grid-cols-2">
   <Field label="Account name" htmlFor="account-name" error={errors.accountName?.message}><Input id="account-name" autoComplete="name" {...register("accountName")}/></Field>
   <Field label="Bank name" htmlFor="bank-name" error={errors.bankName?.message}><Input id="bank-name" {...register("bankName")}/></Field>
   <Field label="Account number" htmlFor="account-number" error={errors.accountNumber?.message}><Input id="account-number" autoComplete="off" {...register("accountNumber")}/></Field>
  </div>:<div className="grid gap-5 sm:grid-cols-2">
   <Field label="Bitcoin address" htmlFor="bitcoin-address" error={errors.bitcoinAddress?.message}><Input id="bitcoin-address" className="font-reference" autoComplete="off" {...register("bitcoinAddress")}/></Field>
   <Field label="Bitcoin network" htmlFor="bitcoin-network" error={errors.bitcoinNetwork?.message}><Input id="bitcoin-network" placeholder="Bitcoin" {...register("bitcoinNetwork")}/></Field>
  </div>}
  <Field label="Optional note" htmlFor="withdrawal-note" error={errors.userNote?.message}><Textarea id="withdrawal-note" maxLength={1000} {...register("userNote")}/></Field>
  {state.message?<Alert tone={state.status==="success"?"success":"danger"} title={state.status==="success"?"Request submitted":"Unable to submit"}>{state.message}{state.reference?<span className="mt-2 block font-reference text-xs">{state.reference}</span>:null}</Alert>:null}
  <Button type="submit" disabled={pending}>{pending?"Reserving funds…":"Submit withdrawal"}</Button>
 </form>;
}
