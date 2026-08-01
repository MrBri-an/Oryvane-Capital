import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getAdminPayments } from "@/server/admin/data";

export const metadata: Metadata = { title: "Admin payments", description: "Read-only payment submissions." };

export default async function AdminPaymentsPage() {
  const rows = await getAdminPayments();
  return <AdminSection title="Payments" description="Read-only payment submissions. Review actions are intentionally unavailable in Phase 10A.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Reference</TableHead><TableHead>User</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Reference value={row.internal_reference} /></TableCell><TableCell>{row.profiles?.full_name ?? "—"}</TableCell><TableCell><Label value={row.method} /></TableCell><TableCell><Money amount={row.submitted_amount} currency={row.currency} /></TableCell><TableCell><Label value={row.status} /></TableCell><TableCell><DateValue value={row.submitted_at ?? row.created_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={ReceiptText} title="No payment submissions" description="No real payment records are available." />}</AdminSection>;
}
