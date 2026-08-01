import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { InvestmentStatus } from "@/components/financial/status";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getInvestments } from "@/server/dashboard/data";

export const metadata: Metadata = { title: "Investments", description: "Review your investment requests, principal, earnings and updates." };
export default async function InvestmentsPage() {
  const rows = await getInvestments();
  return <DashboardSection eyebrow="Portfolio" title="Investments" description="Your real investment requests and protected financial records.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Investment plan</TableHead><TableHead>Principal</TableHead><TableHead>Earnings</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Matures</TableHead><TableHead>Latest update</TableHead></tr></thead><tbody>{rows.map((row) => { const latest = [...row.investment_updates].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]; return <tr key={row.id}><TableCell>{row.investment_plans ? <div><Link href={`/investments/${row.investment_plans.slug}`} className="font-semibold text-emerald-strong hover:underline">{row.investment_plans.name}</Link><div className="mt-1"><Reference value={row.id} /></div></div> : <Reference value={row.id} />}</TableCell><TableCell><Money amount={row.amount} currency={row.currency} /></TableCell><TableCell><Money amount={row.earnings_amount} currency={row.currency} /></TableCell><TableCell><InvestmentStatus status={row.status} /></TableCell><TableCell><DateValue value={row.started_at} /></TableCell><TableCell><DateValue value={row.matures_at} /></TableCell><TableCell className="max-w-72">{latest ? <div><p><Label value={latest.update_type} /></p><p className="mt-1 text-xs text-muted">{latest.description}</p><p className="mt-1 text-xs text-muted"><DateValue value={latest.created_at} /></p></div> : <span className="text-muted">No updates</span>}</TableCell></tr>; })}</tbody></Table></TableContainer> : <EmptyState icon={TrendingUp} title="No investments" description="Your real investment requests will appear here after funds are reserved." action={<Link href="/investments" className={buttonVariants({ variant: "secondary" })}>Browse active plans</Link>} />}</DashboardSection>;
}
