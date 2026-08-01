import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CurrencyValue } from "@/components/financial/format-values";
import { CardEntrance } from "@/components/motion/motion-system";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
type Plan = { slug: string; name: string; short_description: string; minimum_amount: number; currency: string; duration_days: number; risk_level: string; status: string };
export function InvestmentPlanCard({ plan }: { plan: Plan }) { return <CardEntrance className="h-full"><Card className="flex h-full flex-col"><div className="flex flex-wrap items-center justify-between gap-2"><Badge tone="success">{plan.status}</Badge><Badge tone="gold">{plan.risk_level} risk</Badge></div><h3 className="mt-6 text-2xl font-semibold">{plan.name}</h3><p className="mt-4 flex-1 text-sm leading-6 text-muted">{plan.short_description}</p><dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm"><div><dt className="text-muted">Minimum</dt><dd className="mt-1 font-semibold"><CurrencyValue value={plan.minimum_amount} currency={plan.currency} /></dd></div><div><dt className="text-muted">Duration</dt><dd className="mt-1 font-semibold">{plan.duration_days} days</dd></div></dl><Link href={`/investments/${plan.slug}`} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-strong">Review plan <ArrowUpRight aria-hidden className="size-4" /></Link></Card></CardEntrance>; }
