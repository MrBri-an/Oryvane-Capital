import { ArrowUpRight, Clock3, Gauge, Scale, ScanSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CardEntrance } from "@/components/motion/motion-system";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { investmentFrameworks } from "@/content/public-content";
type Framework = (typeof investmentFrameworks)[number];
const identities = {
  "capital-preservation": { icon: ShieldCheck, accent: "text-emerald-strong", label: "Risk boundary first" },
  "diversified-growth": { icon: Scale, accent: "text-cyan", label: "Balanced review" },
  "strategic-opportunities": { icon: ScanSearch, accent: "text-gold", label: "Enhanced diligence" },
} as const;

export function InvestmentCard({ framework }: { framework: Framework }) {
  const identity = identities[framework.slug];
  const Icon = identity.icon;
  return <CardEntrance className="h-full"><Card data-testid="framework-card" className="framework-card group relative flex h-full overflow-hidden p-5 sm:p-6">
    <span className="framework-sweep" aria-hidden />
    <div className="relative flex h-full w-full flex-col">
      <div className="flex items-start justify-between gap-4"><span className={`grid size-11 place-items-center rounded-xl border border-current/20 bg-white/[.025] ${identity.accent}`}><Icon className="size-5" aria-hidden /></span><Badge className="w-fit" tone="neutral">Framework preview</Badge></div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.18em] text-gold">{framework.eyebrow}</p>
      <h3 className="mt-1.5 text-xl font-semibold sm:text-2xl">{framework.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{framework.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 font-reference text-[9px] uppercase tracking-wide text-muted"><span className="flex items-center gap-1.5 rounded-lg border border-border bg-background/35 px-2.5 py-2"><Gauge className="size-3 text-cyan"/>{identity.label}</span><span className="flex items-center gap-1.5 rounded-lg border border-border bg-background/35 px-2.5 py-2"><Clock3 className="size-3 text-gold"/>Terms set per plan</span></div>
      <Link href="/investments" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-strong">View active plans <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
    </div>
  </Card></CardEntrance>;
}
