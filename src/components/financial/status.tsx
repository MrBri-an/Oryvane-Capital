import { Badge } from "@/components/ui/badge";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";
const transactionTones: Record<string, Tone> = { draft: "neutral", submitted: "info", "under review": "warning", approved: "success", processing: "warning", paid: "success", credited: "success", rejected: "danger", cancelled: "neutral", reversed: "danger", "awaiting confirmation": "warning" };
const investmentTones: Record<string, Tone> = { pending: "warning", "awaiting funding": "info", "under review": "warning", active: "success", matured: "gold", completed: "success", cancelled: "neutral", rejected: "danger", suspended: "danger" };
export function StatusBadge({ status, tone }: { status: string; tone?: Tone }) { return <Badge tone={tone ?? "neutral"}>{status}</Badge>; }
export function TransactionStatus({ status }: { status: string }) { return <StatusBadge status={status} tone={transactionTones[status.toLowerCase()] ?? "neutral"} />; }
export function InvestmentStatus({ status }: { status: string }) { return <StatusBadge status={status} tone={investmentTones[status.toLowerCase()] ?? "neutral"} />; }
