import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { DateValue, Label, Money, Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { PaymentMethods } from "@/components/payments/payment-methods";
import { TransactionStatus } from "@/components/financial/status";
import { EmptyState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { getPaymentConfiguration } from "@/config/payments";
import { getDashboardIdentity, getDeposits } from "@/server/dashboard/data";

export const metadata: Metadata = { title: "Deposits", description: "Submit and review your payment records." };

export default async function DepositsPage() {
  const [rows, identity] = await Promise.all([getDeposits(), getDashboardIdentity()]);
  const configuration = getPaymentConfiguration();
  return <DashboardSection eyebrow="Funding records" title="Deposits" description="Submit external bank or Bitcoin payments for review. Submissions never credit your balance automatically.">
    <PaymentMethods configuration={configuration} canSubmit={identity.profile?.status === "active"} />
    <section className="mt-10" aria-labelledby="deposit-history"><h2 id="deposit-history" className="mb-4 text-xl font-semibold">Deposit history</h2>{rows.length ? <TableContainer><Table><thead><tr><TableHead>Internal reference</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>External reference</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead>Review note</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell><Reference value={row.internal_reference} /></TableCell><TableCell><Label value={row.method} /></TableCell><TableCell><Money amount={row.submitted_amount} currency={row.currency} /></TableCell><TableCell><Reference value={row.external_reference ?? "—"} /></TableCell><TableCell><DateValue value={row.submitted_at ?? row.created_at} /></TableCell><TableCell><TransactionStatus status={row.status} /></TableCell><TableCell className="max-w-64 text-muted">{row.rejection_reason ?? "—"}</TableCell></tr>)}</tbody></Table></TableContainer> : <EmptyState icon={CreditCard} title="No deposit submissions" description="Your real bank and Bitcoin submissions will appear here after you submit them." />}</section>
  </DashboardSection>;
}
