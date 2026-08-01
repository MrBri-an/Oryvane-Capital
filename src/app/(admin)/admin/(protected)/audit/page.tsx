import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getAdminAudit } from "@/server/admin/data";

export const metadata: Metadata = { title: "Admin audit", description: "Append-only administration audit records." };

export default async function AdminAuditPage() {
  const rows = await getAdminAudit();
  return <AdminSection title="Audit log" description="Append-only administrative events available to authorized auditors.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>Admin</TableHead><TableHead>Amount</TableHead><TableHead>Reference</TableHead><TableHead>Time</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Label value={row.action} /></TableCell><TableCell>{row.resource_type}{row.resource_id ? <span className="block"><Reference value={row.resource_id} /></span> : null}</TableCell><TableCell><Reference value={row.admin_id} /></TableCell><TableCell>{row.amount !== null && row.currency ? <Money amount={row.amount} currency={row.currency} /> : "—"}</TableCell><TableCell>{row.reference ? <Reference value={row.reference} /> : "—"}</TableCell><TableCell><DateValue value={row.created_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={ScrollText} title="No audit records" description="No real administrative audit events are available." />}</AdminSection>;
}
