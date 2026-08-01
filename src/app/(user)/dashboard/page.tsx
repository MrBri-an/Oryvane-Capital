import type { Metadata } from "next";
import { ArrowDownToLine, ArrowUpFromLine, Clock3, Landmark, ReceiptText, TrendingUp } from "lucide-react";

import { Money, DateValue, Label, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { TransactionStatus } from "@/components/financial/status";
import { CardEntrance } from "@/components/motion/motion-system";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getDashboardIdentity, getOverviewData } from "@/server/dashboard/data";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard", description: "Your Oryvane Capital account overview." };

export default async function DashboardPage() {
  const [identity, data] = await Promise.all([getDashboardIdentity(), getOverviewData()]);
  const activity: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "Pending deposits", value: data.pendingDeposits, icon: Clock3 },
    { label: "Pending withdrawals", value: data.pendingWithdrawals, icon: ReceiptText },
    { label: "Active investments", value: data.activeInvestments, icon: TrendingUp },
  ];
  return <DashboardSection eyebrow="Account overview" title={`Welcome, ${identity.profile?.full_name}`} description="A current view of your protected account records.">
    {identity.profile?.status !== "active" && <Alert className="mb-6" tone="warning" title={identity.isRestricted ? "Account restricted" : "Verification pending"}>{identity.isRestricted ? "You may review permitted records, but account actions are unavailable." : "You can review your account while verification is completed. Financial actions remain unavailable."}</Alert>}
    {data.wallets.length ? <section aria-label="Wallet balances" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.wallets.flatMap((wallet) => {
      const figures: Array<{ label: string; value: number; icon: LucideIcon }> = [
        { label: "Total balance", value: wallet.total_balance, icon: Landmark },
        { label: "Available balance", value: wallet.available_balance, icon: ArrowDownToLine },
        { label: "Invested amount", value: wallet.invested_amount, icon: TrendingUp },
        { label: "Total earnings", value: wallet.total_earnings, icon: ArrowUpFromLine },
      ];
      return figures.map(({ label, value, icon: Icon }) => <CardEntrance key={`${wallet.id}-${label}`}><Card className="h-full"><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted">{label}</p><Icon aria-hidden className="size-4 text-gold" /></div><p className="mt-4 text-2xl font-semibold"><Money amount={value} currency={wallet.currency} /></p><p className="mt-2 text-xs text-muted">As of <DateValue value={wallet.updated_at} /></p></Card></CardEntrance>);
    })}</section> : <EmptyState icon={Landmark} title="No wallet account yet" description="Balances will appear here only after a wallet account is securely provisioned." />}
    <section aria-label="Pending activity" className="mt-6 grid gap-4 sm:grid-cols-3">{activity.map(({ label, value, icon: Icon }) => <Card key={label}><div className="flex items-center justify-between"><p className="text-sm text-muted">{label}</p><Icon aria-hidden className="size-4 text-gold" /></div><p className="mt-3 font-financial text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p></Card>)}</section>
    <section className="mt-9" aria-labelledby="recent-heading"><h2 id="recent-heading" className="mb-4 text-xl font-semibold">Recent transactions</h2>{data.recentTransactions.length ? <TableContainer><Table><thead><tr><TableHead>Type</TableHead><TableHead>Reference</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></tr></thead><tbody>{data.recentTransactions.map((item) => <tr key={item.id}><TableCell><Label value={item.type} /></TableCell><TableCell><Reference value={item.reference} /></TableCell><TableCell><DateValue value={item.created_at} /></TableCell><TableCell><TransactionStatus status={item.status} /></TableCell><TableCell className="text-right"><span className={item.direction === "credit" ? "text-emerald-strong" : "text-foreground"}>{item.direction === "credit" ? "+" : "−"}<Money amount={item.amount} currency={item.currency} /></span></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={ReceiptText} title="No transactions" description="Verified wallet transactions will appear here when they exist." />}</section>
  </DashboardSection>;
}
