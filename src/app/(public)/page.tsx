import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, ScanSearch, ShieldCheck, WalletCards } from "lucide-react";

import { MarketTerminal } from "@/components/market/market-terminal";
import { MarketHeatmap } from "@/components/market/market-heatmap";
import { MarketTicker } from "@/components/market/market-ticker";
import { MarketUniverse } from "@/components/market/market-universe";
import { FeatureGrid } from "@/components/public/feature-grid";
import { CurrencyIntelligence, MarketAwareness, MarketCta, SecurityArchitecture } from "@/components/public/homepage-intelligence";
import { InvestmentCard } from "@/components/public/investment-card";
import { OperatingSequence } from "@/components/public/operating-sequence";
import { Container, PageShell, PublicSection } from "@/components/public/page-shell";
import { RiskNotice } from "@/components/public/risk-notice";
import { buttonVariants } from "@/components/ui/button";
import { investmentFrameworks } from "@/content/public-content";
import { getCurrencyIntelligence, getMarketSnapshot } from "@/server/market-data";

export const metadata: Metadata = { title: "The market, made legible", description: "A premium investment platform built around real visibility, protected operations, and accountable financial records." };

export default async function HomePage() {
  const [market, currency] = await Promise.all([getMarketSnapshot(), getCurrencyIntelligence()]);
  return <PageShell>
    <section className="terminal-noise relative min-h-[calc(100svh-4.5rem)] overflow-hidden border-b border-border"><MarketUniverse/><Container className="relative grid min-h-[calc(100svh-4.5rem)] items-center gap-12 py-20 lg:grid-cols-[.9fr_1.1fr] lg:py-24"><div><p className="font-reference text-[11px] font-semibold uppercase tracking-[.24em] text-cyan">Oryvane market observatory / 01</p><h1 className="mt-7 max-w-4xl text-[clamp(3.2rem,8vw,7.8rem)] font-semibold leading-[.9] tracking-[-.075em] text-balance">Capital,<br/><span className="bg-gradient-to-r from-emerald-strong via-cyan to-foreground bg-clip-text text-transparent">in focus.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-xl sm:leading-8">A high-clarity investment experience where market context meets protected financial operations—and every important action leaves a record.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className={buttonVariants({size:"lg"})}>Enter the platform <ArrowRight className="size-4"/></Link><Link href="/investments" className={buttonVariants({variant:"secondary",size:"lg"})}>Explore investments</Link></div><p className="mt-6 max-w-xl font-reference text-[10px] leading-5 text-muted">MARKET DATA IS INFORMATIONAL · RETURNS ARE NOT GUARANTEED · NOT FINANCIAL ADVICE</p></div><div className="relative lg:translate-y-5"><div className="absolute -inset-8 rounded-full bg-emerald/8 blur-3xl"/><MarketTerminal snapshot={market}/></div></Container></section>
    <MarketTicker snapshot={market}/><RiskNotice/>
    <PublicSection eyebrow="Market intelligence" title="Breadth, momentum, and liquidity at a glance." description="A capital-weighted heatmap compares five major assets through real prices, 24-hour movement, volume, and individual sparkline signatures."><MarketHeatmap snapshot={market}/></PublicSection>
    <PublicSection className="bg-surface-subtle/70" eyebrow="The Oryvane layer" title="Structure turns information into confidence." description="A composed financial interface with a hard boundary between what users can see and what authorised operations may change."><FeatureGrid items={[{icon:WalletCards,title:"One financial field of view",description:"Balances, investments, requests, and immutable activity form one legible operating picture."},{icon:FileCheck2,title:"Permanent operational memory",description:"Important changes preserve their references and history instead of rewriting the past."},{icon:ScanSearch,title:"Human judgment, explicit status",description:"Sensitive reviews remain controlled, attributable, and visible through deliberate states."}]}/></PublicSection>
    <section className="relative py-12 sm:py-16"><Container><CurrencyIntelligence data={currency}/></Container></section>
    <PublicSection className="sequence-section bg-surface-subtle/70" eyebrow="Operating sequence" title="Understand. Submit. Verify. Track."><OperatingSequence /></PublicSection>
    <PublicSection className="framework-section relative overflow-hidden" eyebrow="Investment frameworks" title="Read the architecture before the opportunity." description="Framework previews explain interface structure only. Live plans appear exclusively from approved database records."><div className="framework-orbit" aria-hidden/><div className="relative grid gap-4 md:grid-cols-3">{investmentFrameworks.map(item=><InvestmentCard framework={item} key={item.slug}/>)}</div></PublicSection>
    <PublicSection className="bg-surface-subtle/70" eyebrow="Security architecture" title="Designed so trust is never a visual effect." description="Authentication, data ownership, administrator assurance, and financial mutation remain separate layers with independent controls."><SecurityArchitecture/><div className="mt-6"><Link href="/security" className={buttonVariants({variant:"secondary"})}>Explore security <ShieldCheck className="size-4"/></Link></div></PublicSection>
    <PublicSection eyebrow="Signal, not spectacle" title="Market-aware without becoming a crypto template." description="Real market direction and provider health remain explicitly separate from user account performance."><MarketAwareness market={market} currency={currency}/></PublicSection>
    <MarketCta live={market.status === "available" && currency.fx.status === "available"}/>
  </PageShell>;
}
