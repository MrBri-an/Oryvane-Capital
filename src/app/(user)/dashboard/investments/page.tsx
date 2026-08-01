import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { DateValue, Money, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { InvestmentStatus } from "@/components/financial/status";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getInvestments } from "@/server/dashboard/data";
export const metadata: Metadata = { title: "Investments", description: "Review your investment records." };
export default async function InvestmentsPage() { const rows = await getInvestments(); return <DashboardSection eyebrow="Portfolio" title="Investments" description="Read-only investment records associated with your account.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Matures</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Reference value={row.id} /></TableCell><TableCell><Money amount={row.amount} currency={row.currency} /></TableCell><TableCell><InvestmentStatus status={row.status} /></TableCell><TableCell><DateValue value={row.started_at} /></TableCell><TableCell><DateValue value={row.matures_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={TrendingUp} title="No investments" description="Your verified investment records will appear here when they exist." />}</DashboardSection>; }
