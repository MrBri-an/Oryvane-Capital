"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/server/admin/authorization";

export type OperationState = { ok: boolean; message: string };
const uuid = z.string().uuid();
const reason = z.string().trim().min(3).max(1000);
const money = z.string().regex(/^\d+(?:\.\d{1,18})?$/).refine((v) => Number(v) > 0);
const currency = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,10}$/);
const totp = z.string().regex(/^\d{6}$/);
const text = (form: FormData, key: string) => { const value = form.get(key); return typeof value === "string" ? value : ""; };

async function reauthenticate(permission: string, code: string) {
  const context = await requireAdminPermission(permission);
  const parsed = totp.safeParse(code);
  if (!parsed.success) throw new Error("Enter a valid six-digit authenticator code.");
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((item) => item.status === "verified");
  if (!factor) throw new Error("A verified authenticator is required.");
  const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challenge.error) throw new Error("Reauthentication could not be started.");
  const verified = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.data.id, code: parsed.data });
  if (verified.error) throw new Error("Reauthentication failed.");
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.data?.currentLevel !== "aal2") throw new Error("An AAL2 session is required.");
  return { context, supabase };
}

async function run(operation: () => Promise<void>, paths: string[]): Promise<OperationState> {
  try { await operation(); paths.forEach((path) => revalidatePath(path)); return { ok: true, message: "Operation completed and audited." }; }
  catch { return { ok: false, message: "The protected operation could not be completed. Check the current status and your authorization." }; }
}

export async function startPaymentReviewAction(_: OperationState, form: FormData) { return run(async () => {
  const input = z.object({ id: uuid, code: totp }).parse({ id: text(form,"id"), code: text(form,"totp_code") });
  const { supabase } = await reauthenticate("payments.manage", input.code);
  const { error } = await supabase.rpc("admin_start_payment_review", { p_payment_id: input.id }); if (error) throw error;
}, ["/admin/payments","/admin/audit"]); }

export async function rejectPaymentAction(_: OperationState, form: FormData) { return run(async () => {
  const input = z.object({ id: uuid, reason, code: totp }).parse({ id:text(form,"id"),reason:text(form,"reason"),code:text(form,"totp_code") });
  const { supabase } = await reauthenticate("payments.reject", input.code);
  const { error } = await supabase.rpc("admin_reject_payment", { p_payment_id:input.id,p_reason:input.reason }); if(error) throw error;
}, ["/admin/payments","/admin/audit"]); }

export async function creditPaymentAction(_: OperationState, form: FormData) { return run(async () => {
  const input=z.object({id:uuid,amount:money,reason,code:totp}).parse({id:text(form,"id"),amount:text(form,"amount"),reason:text(form,"reason"),code:text(form,"totp_code")});
  const { supabase }=await reauthenticate("payments.manage",input.code);
  const { error }=await supabase.rpc("admin_approve_and_credit_payment",{p_payment_id:input.id,p_confirmed_amount:Number(input.amount),p_reason:input.reason}); if(error) throw error;
},["/admin/payments","/admin/users","/admin/audit"]); }

const adjustmentMap = { credit:["correction","credit"], debit:["administrative_debit","debit"], bonus:["bonus","credit"], investment_return:["investment_return","credit"], refund:["refund","credit"], correction:["correction","credit"], reversal:["reversal","credit"] } as const;
export async function adjustWalletAction(_:OperationState,form:FormData){return run(async()=>{
 const input=z.object({wallet_id:uuid,type:z.enum(Object.keys(adjustmentMap) as [keyof typeof adjustmentMap,...Array<keyof typeof adjustmentMap>]),amount:money,currency,reason,reference:z.string().trim().min(3).max(200),original:z.union([uuid,z.literal("")]),code:totp}).parse({wallet_id:text(form,"wallet_id"),type:text(form,"type"),amount:text(form,"amount"),currency:text(form,"currency"),reason:text(form,"reason"),reference:text(form,"reference"),original:text(form,"original_transaction_id"),code:text(form,"totp_code")});
 const {context,supabase}=await reauthenticate("finance.adjust",input.code); const [type,defaultDirection]=adjustmentMap[input.type];
 let direction=defaultDirection; if(input.type==="reversal"){if(!input.original)throw new Error("Original transaction required"); const original=await supabase.from("wallet_transactions").select("direction").eq("id",input.original).single(); if(original.error)throw original.error; direction=original.data.direction==="credit"?"debit":"credit";}
 const base={p_wallet_account_id:input.wallet_id,p_admin_auth_user_id:context.user_id,p_adjustment_type:type,p_adjustment_direction:direction,p_adjustment_amount:Number(input.amount),p_adjustment_currency:input.currency,p_adjustment_reason:input.reason,p_adjustment_reference:input.reference};
 const args=input.original?{...base,p_original_transaction_id:input.original}:base; const {error}=await supabase.rpc("perform_wallet_adjustment",args); if(error)throw error;
},["/admin/users","/admin/audit"]);}

export async function applyRestrictionAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({user:uuid,type:z.enum(["deposit","withdrawal","login"]),reason,code:totp}).parse({user:text(form,"user_id"),type:text(form,"type"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("restrictions.change",input.code);const{error}=await supabase.rpc("admin_apply_restriction",{p_user_id:input.user,p_type:input.type,p_reason:input.reason});if(error)throw error;},["/admin/users","/admin/audit"]);}
export async function removeRestrictionAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,reason,code:totp}).parse({id:text(form,"id"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("restrictions.change",input.code);const{error}=await supabase.rpc("admin_remove_restriction",{p_restriction_id:input.id,p_reason:input.reason});if(error)throw error;},["/admin/users","/admin/audit"]);}
export async function setAccountStatusAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({user:uuid,status:z.enum(["active","suspended","blocked"]),reason,code:totp}).parse({user:text(form,"user_id"),status:text(form,"status"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("restrictions.change",input.code);const{error}=await supabase.rpc("admin_set_account_status",{p_user_id:input.user,p_status:input.status,p_reason:input.reason});if(error)throw error;},["/admin/users","/admin/audit"]);}

export async function sendNotificationAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({user:uuid,type:z.enum(["general","financial","security","account"]),title:z.string().trim().min(2).max(160),body:z.string().trim().min(2).max(4000),code:totp}).parse({user:text(form,"user_id"),type:text(form,"type"),title:text(form,"title"),body:text(form,"body"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("notifications.send",input.code);const{error}=await supabase.rpc("admin_send_notification",{p_user_id:input.user,p_type:input.type,p_title:input.title,p_body:input.body});if(error)throw error;},["/admin/users","/admin/audit"]);}

export async function updateInvestmentStatusAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,status:z.enum(["under_review","active","suspended","matured","completed"]),reason,code:totp}).parse({id:text(form,"id"),status:text(form,"status"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("investments.manage",input.code);const{error}=await supabase.rpc("admin_update_investment_status",{p_investment_id:input.id,p_status:input.status,p_reason:input.reason});if(error)throw error;},["/admin/investments","/admin/audit"]);}

export async function savePlanAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:z.union([uuid,z.literal("")]),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),name:z.string().min(2).max(120),short:z.string().min(2).max(500),full:z.string().min(2).max(5000),minimum:money,maximum:z.union([money,z.literal("")]),currency,duration:z.coerce.number().int().positive(),returns:z.string().min(2).max(1000),risk:z.string().min(2).max(50),terms:z.string().min(2).max(10000),status:z.enum(["draft","active","paused","closed","archived"]),code:totp}).parse({id:text(form,"id"),slug:text(form,"slug"),name:text(form,"name"),short:text(form,"short_description"),full:text(form,"full_description"),minimum:text(form,"minimum_amount"),maximum:text(form,"maximum_amount"),currency:text(form,"currency"),duration:text(form,"duration_days"),returns:text(form,"return_description"),risk:text(form,"risk_level"),terms:text(form,"terms"),status:text(form,"status"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("plans.manage",input.code);const{error}=await supabase.rpc("admin_save_investment_plan",{p_id:(input.id||null) as unknown as string,p_slug:input.slug,p_name:input.name,p_short_description:input.short,p_full_description:input.full,p_minimum:Number(input.minimum),p_maximum:(input.maximum?Number(input.maximum):null) as unknown as number,p_currency:input.currency,p_duration_days:input.duration,p_return_description:input.returns,p_risk_level:input.risk,p_terms:input.terms,p_status:input.status});if(error)throw error;},["/admin/investments","/investments","/admin/audit"]);}

export async function releaseInvestmentAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,status:z.enum(["rejected","cancelled"]),reason,code:totp}).parse({id:text(form,"id"),status:text(form,"status"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("investments.manage",input.code);const{error}=await supabase.rpc("admin_release_investment",{p_investment_id:input.id,p_target_status:input.status,p_reason:input.reason});if(error)throw error;},["/admin/investments","/admin/users","/admin/audit"]);}
export async function matureInvestmentAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,reason,code:totp}).parse({id:text(form,"id"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("investments.manage",input.code);const{error}=await supabase.rpc("admin_mature_investment",{p_investment_id:input.id,p_reason:input.reason});if(error)throw error;},["/admin/investments","/admin/users","/admin/audit"]);}
export async function postInvestmentEarningsAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,amount:money,reference:z.string().trim().min(3).max(200),reason,start:z.union([z.iso.date(),z.literal("")]),end:z.union([z.iso.date(),z.literal("")]),code:totp}).parse({id:text(form,"id"),amount:text(form,"amount"),reference:text(form,"reference"),reason:text(form,"reason"),start:text(form,"period_start"),end:text(form,"period_end"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("investments.manage",input.code);const{error}=await supabase.rpc("admin_post_investment_earnings",{p_investment_id:input.id,p_amount:Number(input.amount),p_reference:input.reference,p_reason:input.reason,p_period_start:input.start||undefined,p_period_end:input.end||undefined});if(error)throw error;},["/admin/investments","/admin/users","/admin/audit"]);}
export async function completeInvestmentAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,reason,code:totp}).parse({id:text(form,"id"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("investments.manage",input.code);const{error}=await supabase.rpc("admin_complete_investment",{p_investment_id:input.id,p_reason:input.reason});if(error)throw error;},["/admin/investments","/admin/audit"]);}
export async function transitionWithdrawalAction(_:OperationState,form:FormData){return run(async()=>{const input=z.object({id:uuid,operation:z.enum(["start_review","approve","reject","processing","paid","reverse"]),reason:z.string().trim().max(1000),code:totp}).superRefine((v,ctx)=>{if(["reject","reverse"].includes(v.operation)&&v.reason.length<3)ctx.addIssue({code:"custom",message:"A reason is required.",path:["reason"]});}).parse({id:text(form,"id"),operation:text(form,"operation"),reason:text(form,"reason"),code:text(form,"totp_code")});const{supabase}=await reauthenticate("withdrawals.manage",input.code);const{error}=await supabase.rpc("admin_transition_withdrawal",{p_withdrawal_id:input.id,p_action:input.operation,p_reason:input.reason});if(error)throw error;},["/admin/withdrawals","/admin/users","/admin/audit"]);}
