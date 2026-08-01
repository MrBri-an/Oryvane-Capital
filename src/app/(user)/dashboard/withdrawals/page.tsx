import type { Metadata } from "next";
import { WalletCards } from "lucide-react";
import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { TransactionStatus } from "@/components/financial/status";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getWithdrawals } from "@/server/dashboard/data";
export const metadata: Metadata = { title: "Withdrawals", description: "Review your withdrawal request records." };
export default async function WithdrawalsPage() { const rows = await getWithdrawals(); return <DashboardSection eyebrow="Payout records" title="Withdrawals" description="Read-only withdrawal history. New withdrawal requests are not available in this phase.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Reference</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Paid</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Reference value={row.payment_reference ?? row.id} /></TableCell><TableCell><Label value={row.method} /></TableCell><TableCell><Money amount={row.amount} currency={row.currency} /></TableCell><TableCell><TransactionStatus status={row.status} /></TableCell><TableCell><DateValue value={row.submitted_at} /></TableCell><TableCell><DateValue value={row.paid_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={WalletCards} title="No withdrawal requests" description="Withdrawal records will appear here only when real requests exist." />}</DashboardSection>; }
