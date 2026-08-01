import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { TransactionStatus } from "@/components/financial/status";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getTransactions } from "@/server/dashboard/data";
export const metadata: Metadata = { title: "Transactions", description: "Review your immutable wallet transaction history." };
export default async function TransactionsPage() { const rows = await getTransactions(); return <DashboardSection eyebrow="Wallet history" title="Transactions" description="A read-only record of wallet movements. Corrections appear as separate reversing entries.">{rows.length ? <TableContainer><Table><thead><tr><TableHead>Type</TableHead><TableHead>Reference</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Label value={row.type} /></TableCell><TableCell><Reference value={row.reference} /></TableCell><TableCell className="max-w-64 text-muted">{row.reason}</TableCell><TableCell><DateValue value={row.created_at} /></TableCell><TableCell><TransactionStatus status={row.status} /></TableCell><TableCell className="text-right">{row.direction === "credit" ? "+" : "−"}<Money amount={row.amount} currency={row.currency} /></TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={ReceiptText} title="No transactions" description="Wallet transactions will appear here only when real records exist." />}</DashboardSection>; }
