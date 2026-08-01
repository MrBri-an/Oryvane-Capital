import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { DateValue, Label, Reference } from "@/components/dashboard/format";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getAdminUsers } from "@/server/admin/data";
export const metadata: Metadata = { title: "Admin users", description: "Read-only user and account status records." };
export default async function AdminUsersPage() { const rows = await getAdminUsers(); return <AdminSection title="Users" description="Protected profile records available to your role.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>User</TableHead><TableHead>Reference</TableHead><TableHead>Country</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Link href={`/admin/users/${row.id}`} className="font-semibold text-gold hover:underline">{row.full_name}</Link></TableCell><TableCell><Reference value={row.id} /></TableCell><TableCell>{row.country ?? "—"}</TableCell><TableCell><Label value={row.status} /></TableCell><TableCell><DateValue value={row.created_at} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={Users} title="No users" description="No real profile records are available." />}</AdminSection>; }
