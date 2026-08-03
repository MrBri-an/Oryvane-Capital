"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpenCheck, Database, Fingerprint, LockKeyhole, Radio, Server, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { CurrencyIntelligence as CurrencyData, MarketSnapshot } from "@/server/market-data";

export function CurrencyIntelligence({ data }: { data: CurrencyData }) {
  const reduce = useReducedMotion();
  return <div data-testid="currency-intelligence" className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-[0_18px_55px_rgb(0_0_0/.22)]">
    <header className="flex items-center justify-between border-b border-border-strong bg-[#11211d] px-3 py-2.5 sm:px-4">
      <p className="font-reference text-[10px] font-semibold uppercase tracking-[.18em] text-cyan">Live currency rates</p>
      <span className="flex items-center gap-2 font-reference text-[9px] text-emerald-strong"><motion.i className="size-1.5 rounded-full bg-emerald" animate={reduce ? undefined : { opacity: [.45, 1, .45] }} transition={{ duration: 1.8, repeat: Infinity }}/>15M CACHE</span>
    </header>
    {data.fx.status === "unavailable" ? <p className="px-4 py-6 text-sm text-muted">Reference feed unavailable. No substitute values are shown.</p> : <div className="divide-y divide-border">{data.fx.rates.map((rate, index) => {
      const Icon = rate.direction === "up" ? ArrowUpRight : rate.direction === "down" ? ArrowDownRight : ArrowRight;
      return <motion.div key={rate.pair} initial={reduce ? false : { opacity: 0, y: 7 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .035, duration: .24 }} className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:grid-cols-[9rem_minmax(7rem,1fr)_8rem_6rem] sm:px-4">
        <strong className="font-reference text-[11px] font-semibold text-foreground sm:text-xs">{rate.pair}</strong>
        <time className="row-start-2 font-reference text-[9px] text-muted sm:row-start-auto sm:text-[10px]">{rate.updatedAt}</time>
        <span className="row-span-2 text-right font-reference text-xs font-semibold tabular-nums text-foreground sm:row-span-1 sm:text-sm">{rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: rate.rate < 10 ? 4 : 2 })}</span>
        <span className={`row-span-2 flex min-w-[4.2rem] items-center justify-end gap-1 text-right font-reference text-[10px] sm:row-span-1 sm:text-xs ${rate.direction === "up" ? "text-emerald-strong" : rate.direction === "down" ? "text-danger" : "text-muted"}`}><motion.span animate={reduce ? undefined : { y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: index * .08 }}><Icon className="size-3.5"/></motion.span>{rate.changePct >= 0 ? "+" : ""}{rate.changePct.toFixed(2)}%</span>
      </motion.div>;
    })}</div>}
  </div>;
}

const securityNodes = [
  { icon: Server, title: "Server authority", text: "Privileged and financial mutations remain server-held.", accent: "text-cyan" },
  { icon: Fingerprint, title: "Identity and MFA", text: "Approved identity, status, permissions, and AAL2 protect administrator entry.", accent: "text-emerald-strong" },
  { icon: Database, title: "Permissions and RLS", text: "Server checks and row ownership remain separate enforcement layers.", accent: "text-cyan" },
  { icon: BookOpenCheck, title: "Immutable ledger and audit", text: "Corrections add linked records while original history remains intact.", accent: "text-emerald-strong" },
];

export function SecurityArchitecture() {
  const reduce = useReducedMotion();
  return <div data-testid="security-architecture" className="relative isolate overflow-hidden rounded-2xl border border-border-strong bg-[#0d1916] p-4 shadow-[0_24px_70px_rgb(0_0_0/.24)] sm:p-6">
    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgb(80_213_255/.09),transparent_26rem),radial-gradient(circle_at_85%_75%,rgb(46_230_166/.08),transparent_24rem)]"/>
    <div className="relative grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
      <motion.article whileHover={reduce ? undefined : { y: -3 }} className="flex min-h-48 flex-col justify-between rounded-xl border border-emerald/35 bg-[#142720] p-5 shadow-[inset_0_1px_rgb(255_255_255/.04)]">
        <div className="flex size-11 items-center justify-center rounded-lg border border-emerald/40 bg-emerald/10"><ShieldCheck className="size-6 text-emerald-strong"/></div>
        <div><p className="font-reference text-[10px] uppercase tracking-[.2em] text-emerald-strong">Layered control plane</p><h3 className="mt-2 text-2xl font-semibold text-foreground">Verification crosses every boundary.</h3><p className="mt-3 text-sm leading-6 text-[#c4d3ce]">No interface element represents authority on its own. Each sensitive path is checked and recorded independently.</p></div>
      </motion.article>
      <div className="relative grid gap-3 sm:grid-cols-2">
        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden size-full sm:block" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M25 25H75M25 75H75M25 25V75M75 25V75" fill="none" stroke="rgb(80 213 255 / .42)" strokeWidth=".45" strokeDasharray="2 2"/><motion.path d="M25 25H75V75H25V25" fill="none" stroke="rgb(115 248 200 / .9)" strokeWidth=".8" strokeLinecap="round" pathLength="1" strokeDasharray=".08 .92" animate={reduce ? undefined : { strokeDashoffset: [0, -1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}/></svg>
        {securityNodes.map(({ icon: Icon, title, text, accent }, index) => <motion.article key={title} initial={reduce ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }} whileHover={reduce ? undefined : { y: -4 }} className="relative z-10 min-h-36 rounded-xl border border-[#356053] bg-[#14231f] p-4 shadow-[0_14px_35px_rgb(0_0_0/.22),inset_0_1px_rgb(255_255_255/.04)]">
          <div className="flex items-center justify-between"><Icon className={`size-5 ${accent}`}/><motion.i className="size-2 rounded-full bg-emerald shadow-[0_0_12px_var(--emerald)]" animate={reduce ? undefined : { scale: [.75, 1.2, .75], opacity: [.55, 1, .55] }} transition={{ duration: 2, repeat: Infinity, delay: index * .3 }}/></div>
          <h3 className="mt-6 text-base font-semibold text-foreground">{title}</h3><p className="mt-2 text-xs leading-5 text-[#b8cbc4]">{text}</p>
        </motion.article>)}
      </div>
    </div>
  </div>;
}

export function MarketAwareness({ market, currency }: { market: MarketSnapshot; currency: CurrencyData }) {
  const reduce = useReducedMotion();
  const crypto = market.status === "available" ? market.assets.slice(0, 3) : [];
  const fx = currency.fx.status === "available" ? currency.fx.rates.slice(0, 3) : [];
  return <div data-testid="market-awareness" className="relative isolate overflow-hidden rounded-2xl border border-border-strong bg-[#0d1916] p-4 shadow-[0_24px_70px_rgb(0_0_0/.24)] sm:p-6">
    <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(rgb(80_213_255/.035)_1px,transparent_1px),linear-gradient(90deg,rgb(80_213_255/.035)_1px,transparent_1px)] bg-[size:38px_38px]"/>
    <div className="relative grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        <SignalGroup title="Crypto direction" status={market.status}>{crypto.length ? crypto.map(asset => <SignalRow key={asset.id} label={`${asset.symbol} / USD`} value={asset.change24h === null ? "—" : `${asset.change24h >= 0 ? "+" : ""}${asset.change24h.toFixed(2)}%`} positive={asset.change24h !== null && asset.change24h >= 0}/>) : <UnavailableSignals/>}</SignalGroup>
        <SignalGroup title="Currency direction" status={currency.fx.status}>{fx.length ? fx.map(rate => <SignalRow key={rate.pair} label={rate.pair} value={rate.direction.toUpperCase()} positive={rate.direction !== "down"}/>) : <UnavailableSignals/>}</SignalGroup>
        <div className="rounded-xl border border-[#315448] bg-[#12231e] p-3 sm:col-span-2"><div className="flex items-center justify-between"><span className="font-reference text-[10px] uppercase tracking-[.16em] text-[#c0d2cc]">Normalized signal activity</span><motion.span className="flex items-center gap-2 font-reference text-[9px] text-emerald-strong" animate={reduce ? undefined : { opacity: [.55, 1, .55] }} transition={{ duration: 1.8, repeat: Infinity }}><i className="size-1.5 rounded-full bg-emerald"/>ACTIVE</motion.span></div><svg viewBox="0 0 500 42" className="mt-2 h-10 w-full" role="img" aria-label="Normalized market activity signal"><motion.path d="M0 30L45 24L90 32L135 12L180 23L230 10L280 25L330 17L380 29L430 9L500 15" fill="none" stroke="var(--cyan)" strokeWidth="2" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }}/></svg></div>
      </div>
      <aside className="grid gap-3">{[["Provider status", market.status === "available" && currency.fx.status === "available" ? "Feeds available" : "Partial availability"], ["Cache status", "Crypto 5m · FX 15m"], ["Data boundary", "Market context ≠ account performance"]].map(([label, value], index) => <motion.div key={label} whileHover={reduce ? undefined : { x: 3 }} className="rounded-xl border border-[#315448] bg-[#142720] p-4"><div className="flex items-center justify-between"><Activity className="size-4 text-cyan"/><motion.i className="size-2 rounded-full bg-emerald" animate={reduce ? undefined : { opacity: [.4, 1, .4] }} transition={{ duration: 1.7, repeat: Infinity, delay: index * .25 }}/></div><p className="mt-4 font-reference text-[10px] uppercase tracking-[.14em] text-[#aabeb7]">{label}</p><p className="mt-1 text-sm font-medium text-foreground">{value}</p></motion.div>)}</aside>
    </div>
  </div>;
}

function SignalGroup({ title, status, children }: { title: string; status: string; children: React.ReactNode }) { return <motion.section whileHover={{ y: -3 }} className="rounded-xl border border-[#315448] bg-[#142720] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">{title}</h3><span className="font-reference text-[9px] text-emerald-strong">{status.toUpperCase()}</span></div>{children}</motion.section>; }
function SignalRow({ label, value, positive }: { label: string; value: string; positive: boolean }) { return <div className="flex items-center justify-between border-t border-[#29473e] py-2.5 first:border-0"><span className="font-reference text-xs text-[#dbe7e3]">{label}</span><span className={`font-reference text-xs ${positive ? "text-emerald-strong" : "text-danger"}`}>{value}</span></div>; }
function UnavailableSignals() { return <p className="py-4 text-xs text-[#b8cbc4]">Live feed unavailable. No substitute figures.</p>; }

export function MarketCta({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  return <section className="px-[var(--space-page)] pb-20"><div data-testid="market-cta" className="relative mx-auto max-w-[80rem] overflow-hidden rounded-2xl border border-emerald/25 bg-surface p-6 sm:p-9"><motion.i aria-hidden className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-emerald/[.12] to-transparent" animate={reduce ? undefined : { x: ["0%", "500%"] }} transition={{ duration: 6, repeat: Infinity, repeatDelay: 2 }}/><div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]"><div><span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 font-reference text-[10px] text-emerald-strong"><Radio className="size-3"/>{live ? "MARKET CONTEXT ONLINE" : "MARKET FEED PARTIAL"}</span><h2 className="mt-5 text-3xl font-semibold leading-none tracking-[-.05em] sm:text-5xl">See the field. <span className="text-emerald-strong">Move with control.</span></h2><p className="mt-3 max-w-xl text-sm text-muted">Legible market context, protected actions, and accountable records.</p></div><div className="flex flex-wrap gap-3"><Link href="/register" className={buttonVariants({ size: "lg" })}>Create account <ArrowRight className="size-4"/></Link><Link href="/login" className={buttonVariants({ variant: "secondary", size: "lg" })}><LockKeyhole className="size-4"/> Log in</Link></div></div></div></section>;
}
