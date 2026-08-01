"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getDashboardIdentity } from "@/server/dashboard/data";
import { investmentRequestSchema } from "@/validation/investment";

export type InvestmentActionState = { status: "idle" | "success" | "error"; message?: string; investmentId?: string };
export const initialInvestmentState: InvestmentActionState = { status: "idle" };

export async function requestInvestmentAction(_previous: InvestmentActionState, formData: FormData): Promise<InvestmentActionState> {
  const identity = await getDashboardIdentity();
  if (!identity.profile || identity.profile.status !== "active") return { status: "error", message: "Investment requests are unavailable for this account." };
  const parsed = investmentRequestSchema.safeParse({ planId: formData.get("planId"), amount: formData.get("amount"), currency: formData.get("currency") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the requested amount." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_user_investment", { p_plan_id: parsed.data.planId, p_amount: parsed.data.amount as unknown as number, p_currency: parsed.data.currency });
  if (error || !data) {
    const messages: Record<string, string> = {
      "22003": "The amount is outside the plan limits or available funds are insufficient.",
      "23505": "An identical investment request already exists.",
      "42501": "Investment requests are unavailable for this account.",
      "P0002": "A matching funded wallet account was not found.",
    };
    return { status: "error", message: messages[error?.code ?? ""] ?? "The investment request could not be completed." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  return { status: "success", message: "Investment request created and funds reserved.", investmentId: data };
}
