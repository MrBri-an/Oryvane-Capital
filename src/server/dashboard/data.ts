import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/guards";
import type { Database } from "@/types/database";

type AccountStatus = Database["public"]["Enums"]["account_status"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const deniedStatuses: AccountStatus[] = ["suspended", "blocked", "closed"];

export const getDashboardIdentity = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, country, avatar_path, status, terms_accepted_at, privacy_accepted_at, risk_accepted_at, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: error ? null : profile,
    profileError: error?.message ?? null,
    isDenied: profile ? deniedStatuses.includes(profile.status) : true,
    isRestricted: profile?.status === "restricted",
    canUpdateProfile: profile?.status === "active" || profile?.status === "pending_verification",
  };
});

async function permittedUserId() {
  const identity = await getDashboardIdentity();
  if (!identity.profile || identity.isDenied) notFound();
  return identity.user.id;
}

function ensure<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error || data === null) throw new Error(`Unable to load ${label}.`);
  return data;
}

export async function getOverviewData() {
  const userId = await permittedUserId();
  const supabase = await createClient();
  const [wallets, deposits, withdrawals, investments, transactions] = await Promise.all([
    supabase.from("wallet_accounts").select("id, currency, total_balance, available_balance, invested_amount, total_earnings, updated_at").eq("user_id", userId).order("currency"),
    supabase.from("payment_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["submitted", "under_review", "awaiting_confirmation", "approved"]),
    supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["submitted", "under_review", "approved", "processing"]),
    supabase.from("user_investments").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
    supabase.from("wallet_transactions").select("id, amount, currency, direction, type, status, reference, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(6),
  ]);
  if (deposits.error || withdrawals.error || investments.error) throw new Error("Unable to load account summaries.");
  return {
    wallets: ensure(wallets.data, wallets.error, "wallet accounts"),
    pendingDeposits: deposits.count ?? 0,
    pendingWithdrawals: withdrawals.count ?? 0,
    activeInvestments: investments.count ?? 0,
    recentTransactions: ensure(transactions.data, transactions.error, "recent transactions"),
  };
}

export async function getInvestments() {
  const userId = await permittedUserId();
  const supabase = await createClient();
  const result = await supabase.from("user_investments").select("id, amount, currency, status, started_at, matures_at, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  return ensure(result.data, result.error, "investments");
}

export async function getTransactions() {
  const userId = await permittedUserId();
  const supabase = await createClient();
  const result = await supabase.from("wallet_transactions").select("id, amount, currency, direction, type, status, reference, reason, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  return ensure(result.data, result.error, "transactions");
}

export async function getDeposits() {
  const userId = await permittedUserId();
  const supabase = await createClient();
  const result = await supabase.from("payment_submissions").select("id, method, status, submitted_amount, confirmed_amount, currency, external_reference, submitted_at, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  return ensure(result.data, result.error, "deposit submissions");
}

export async function getWithdrawals() {
  const userId = await permittedUserId();
  const supabase = await createClient();
  const result = await supabase.from("withdrawal_requests").select("id, method, status, amount, currency, payment_reference, submitted_at, paid_at").eq("user_id", userId).order("submitted_at", { ascending: false });
  return ensure(result.data, result.error, "withdrawal requests");
}

export async function getNotifications() {
  const userId = await permittedUserId();
  const supabase = await createClient();
  const result = await supabase.from("notifications").select("id, type, title, body, read_at, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  return ensure(result.data, result.error, "notifications");
}
