"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDashboardIdentity } from "@/server/dashboard/data";
import { withdrawalSchema } from "@/validation/withdrawal";
import { enforceRateLimit } from "@/security/request";
export type WithdrawalState={status:"idle"|"success"|"error";message?:string;reference?:string};
export const initialWithdrawalState:WithdrawalState={status:"idle"};
const value=(form:FormData,key:string)=>{const item=form.get(key);return typeof item==="string"?item:""};
export async function submitWithdrawalAction(_:WithdrawalState,form:FormData):Promise<WithdrawalState>{
 await enforceRateLimit({scope:"withdrawal.request",limit:5,windowSeconds:3600});
 const identity=await getDashboardIdentity(); if(!identity.profile||identity.profile.status!=="active")return{status:"error",message:"Withdrawals are unavailable for this account."};
 const requestId=value(form,"requestId"); if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return{status:"error",message:"The request identifier is invalid. Refresh and try again."};
 const parsed=withdrawalSchema.safeParse({method:value(form,"method"),amount:value(form,"amount"),currency:value(form,"currency"),accountName:value(form,"accountName"),bankName:value(form,"bankName"),accountNumber:value(form,"accountNumber"),bitcoinAddress:value(form,"bitcoinAddress"),bitcoinNetwork:value(form,"bitcoinNetwork"),userNote:value(form,"userNote")});
 if(!parsed.success)return{status:"error",message:parsed.error.issues[0]?.message??"Review the withdrawal details."};
 const data=parsed.data; const destination=data.method==="bank_transfer"?{account_name:data.accountName,bank_name:data.bankName,account_number:data.accountNumber}:{bitcoin_address:data.bitcoinAddress,bitcoin_network:data.bitcoinNetwork};
 const supabase=await createClient(); const {data:reference,error}=await supabase.rpc("submit_withdrawal_request",{p_request_id:requestId,p_method:data.method,p_amount:Number(data.amount),p_currency:data.currency,p_destination:destination,p_user_note:data.userNote||undefined});
 if(error||!reference)return{status:"error",message:error?.code==="22003"?"The available balance is insufficient for this withdrawal.":"The withdrawal request could not be submitted."};
 revalidatePath("/dashboard/withdrawals");revalidatePath("/dashboard");return{status:"success",message:"Withdrawal submitted for review.",reference};
}
