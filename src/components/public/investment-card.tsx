import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CardEntrance } from "@/components/motion/motion-system";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { investmentFrameworks } from "@/content/public-content";
type Framework = (typeof investmentFrameworks)[number];
export function InvestmentCard({ framework }: { framework: Framework }) { return <CardEntrance className="h-full"><Card className="flex h-full flex-col"><Badge className="w-fit" tone="neutral">Framework preview</Badge><p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold">{framework.eyebrow}</p><h3 className="mt-2 text-2xl font-semibold">{framework.name}</h3><p className="mt-4 flex-1 text-sm leading-6 text-muted">{framework.summary}</p><Link href="/investments" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-strong">View active plans <ArrowUpRight aria-hidden className="size-4" /></Link></Card></CardEntrance>; }
