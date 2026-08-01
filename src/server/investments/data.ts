import "server-only";

import { createClient } from "@/lib/supabase/server";

const planFields = "id, slug, name, short_description, full_description, minimum_amount, maximum_amount, currency, duration_days, return_description, risk_level, terms, available_from, available_until, participant_limit, featured, status" as const;

export async function getActiveInvestmentPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("investment_plans").select(planFields).eq("status", "active").order("featured", { ascending: false }).order("name");
  if (error) throw new Error("Unable to load investment plans.");
  return data;
}

export async function getActiveInvestmentPlan(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("investment_plans").select(planFields).eq("slug", slug).eq("status", "active").maybeSingle();
  if (error) throw new Error("Unable to load the investment plan.");
  return data;
}

export async function getInvestmentViewer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authenticated: false, status: null } as const;
  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
  return { authenticated: true, status: profile?.status ?? null } as const;
}
