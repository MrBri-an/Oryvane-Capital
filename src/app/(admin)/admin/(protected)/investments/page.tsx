import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { DateValue, Label, Money } from "@/components/dashboard/format";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getAdminInvestments } from "@/server/admin/data";

export const metadata: Metadata = { title: "Admin investments", description: "Read-only user investments." };

export default async function AdminInvestmentsPage() {
  const rows = await getAdminInvestments();
  return <AdminSection title="Investments" description="Read-only investment records. Activation and earnings controls are intentionally unavailable.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>User</TableHead><TableHead>Plan</TableHead><TableHead>Principal</TableHead><TableHead>Earnings</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell>{row.profiles?.full_name ?? "—"}</TableCell><TableCell>{row.investment_plans?.name ?? "—"}</TableCell><TableCell><Money amount={row.amount} currency={row.currency} /></TableCell><TableCell><Money amount={row.earnings_amount} currency={row.currency} /></TableCell><TableCell><Label value={row.status} /></TableCell><TableCell><DateValue value={row.created_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={Landmark} title="No investments" description="No real investment records are available." />}</AdminSection>;
}
