import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { CallToAction } from "@/components/public/call-to-action";
import { PageHero, PageShell, PublicSection } from "@/components/public/page-shell";
import { RiskNotice } from "@/components/public/risk-notice";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { investmentFrameworks } from "@/content/public-content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return investmentFrameworks.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const item = investmentFrameworks.find((framework) => framework.slug === slug); return item ? { title: item.name, description: item.summary } : { title: "Framework not found" }; }
export default async function InvestmentDetailPage({ params }: Props) { const { slug } = await params; const framework = investmentFrameworks.find((item) => item.slug === slug); if (!framework) notFound(); return <PageShell><PageHero eyebrow={framework.eyebrow} title={framework.name} description={framework.summary}><Link href="/investments" className={buttonVariants({ variant: "secondary" })}><ArrowLeft aria-hidden className="size-4" />All frameworks</Link></PageHero><RiskNotice /><PublicSection eyebrow="Illustrative structure" title="What this framework is meant to communicate."><div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"><div><p className="text-lg leading-8 text-muted">{framework.description}</p><Alert className="mt-8" tone="warning" title="Not an investment offer">No expected return, minimum, maximum, duration, fee, currency, asset allocation, or availability is represented here.</Alert></div><div className="rounded-xl border border-border bg-surface p-6"><h2 className="text-lg font-semibold">Information principles</h2><ul className="mt-5 grid gap-4">{framework.principles.map((principle) => <li className="flex gap-3 text-sm text-muted" key={principle}><CheckCircle2 aria-hidden className="size-5 shrink-0 text-emerald" />{principle}</li>)}</ul></div></div></PublicSection><CallToAction title="Understand the risks before any decision." description="Review the general risk disclosure and wait for complete, approved product information before considering participation." /></PageShell>; }
