import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { TransactionStatus } from "@/components/financial/status";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getDeposits } from "@/server/dashboard/data";
export const metadata: Metadata = { title: "Deposits", description: "Review your payment submission records." };
export default async function DepositsPage() { const rows = await getDeposits(); return <DashboardSection eyebrow="Funding records" title="Deposits" description="Read-only payment submission history. Deposit submission is not available in this phase.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Reference</TableHead><TableHead>Method</TableHead><TableHead>Submitted</TableHead><TableHead>Confirmed</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Reference value={row.external_reference ?? row.id} /></TableCell><TableCell><Label value={row.method} /></TableCell><TableCell><Money amount={row.submitted_amount} currency={row.currency} /></TableCell><TableCell>{row.confirmed_amount === null ? "—" : <Money amount={row.confirmed_amount} currency={row.currency} />}</TableCell><TableCell><TransactionStatus status={row.status} /></TableCell><TableCell><DateValue value={row.submitted_at ?? row.created_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={CreditCard} title="No deposit submissions" description="Verified payment submissions will appear here when they exist." />}</DashboardSection>; }
