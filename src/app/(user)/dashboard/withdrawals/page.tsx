import type { Metadata } from "next";
import { WalletCards } from "lucide-react";
import { DateValue,Label,Money,Reference } from "@/components/dashboard/format";
import { DashboardSection } from "@/components/dashboard/section";
import { TransactionStatus } from "@/components/financial/status";
import { EmptyState } from "@/components/ui/states";
import { Table,TableCell,TableContainer,TableHead } from "@/components/ui/table";
import { WithdrawalForm } from "@/components/withdrawals/withdrawal-form";
import { getDashboardIdentity,getWithdrawals,getWithdrawalWallets } from "@/server/dashboard/data";
import { maskSensitiveDestination } from "@/security/masking";
export const metadata:Metadata={title:"Withdrawals",description:"Submit and review protected withdrawal requests."};
const maskDestination=maskSensitiveDestination;
export default async function WithdrawalsPage(){const[rows,wallets,identity]=await Promise.all([getWithdrawals(),getWithdrawalWallets(),getDashboardIdentity()]);return <DashboardSection eyebrow="Payout requests" title="Withdrawals" description="Withdrawal amounts are reserved immediately and remain pending until protected administrator review."><WithdrawalForm currencies={wallets.map(w=>w.currency)} canSubmit={identity.profile?.status==="active"}/><section className="mt-10" aria-labelledby="withdrawal-history"><h2 id="withdrawal-history" className="mb-4 text-xl font-semibold">Withdrawal history</h2>{rows.length?<TableContainer><Table><thead><tr><TableHead>Reference</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Destination</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Review note</TableHead></tr></thead><tbody>{rows.map(row=><tr key={row.id}><TableCell><Reference value={row.internal_reference}/></TableCell><TableCell><Label value={row.method}/></TableCell><TableCell><Money amount={row.amount} currency={row.currency}/></TableCell><TableCell><span className="font-reference text-xs">{maskDestination(row.method,row.destination)}</span></TableCell><TableCell><TransactionStatus status={row.status}/></TableCell><TableCell><DateValue value={row.submitted_at}/></TableCell><TableCell className="max-w-64 text-muted">{row.rejection_reason??"—"}</TableCell></tr>)}</tbody></Table></TableContainer>:<EmptyState icon={WalletCards} title="No withdrawal requests" description="Your real withdrawal requests will appear here after submission."/>}</section></DashboardSection>}
