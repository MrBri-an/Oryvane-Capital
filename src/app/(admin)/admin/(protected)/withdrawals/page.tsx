import type { Metadata } from "next";
import { ArrowUpFromLine } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { DateValue, Label, Money } from "@/components/dashboard/format";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getAdminWithdrawals } from "@/server/admin/data";

export const metadata: Metadata = { title: "Admin withdrawals", description: "Read-only withdrawal requests." };

export default async function AdminWithdrawalsPage() {
  const rows = await getAdminWithdrawals();
  return <AdminSection title="Withdrawals" description="Read-only withdrawal requests. Approval and payment controls are intentionally unavailable.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>User</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Paid</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell>{row.profiles?.full_name ?? "—"}</TableCell><TableCell><Label value={row.method} /></TableCell><TableCell><Money amount={row.amount} currency={row.currency} /></TableCell><TableCell><Label value={row.status} /></TableCell><TableCell><DateValue value={row.submitted_at} /></TableCell><TableCell><DateValue value={row.paid_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={ArrowUpFromLine} title="No withdrawal requests" description="No real withdrawal records are available." />}</AdminSection>;
}
