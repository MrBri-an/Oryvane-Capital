"use client";

import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

import type { MarketAsset, MarketCurrency, MarketSnapshot } from "@/server/market-data";

const currencySymbols: Record<MarketCurrency, string> = { usd: "$", eur: "€", gbp: "£", ngn: "₦" };

function sparkline(asset: MarketAsset) {
  const points = asset.history.filter((_, index) => index % 8 === 0).slice(-22);
  if (points.length < 2) return "";
  const values = points.map(([, value]) => value);
  const min = Math.min(...values); const range = Math.max(...values) - min || 1;
  return values.map((value, index) => `${(index / (values.length - 1)) * 100},${30 - ((value - min) / range) * 28}`).join(" ");
}

export function MarketHeatmap({ snapshot }: { snapshot: MarketSnapshot }) {
  const [currency, setCurrency] = useState<MarketCurrency>("usd");
  const reduce = useReducedMotion();
  const ranked = useMemo(() => snapshot.status === "available" ? [...snapshot.assets].sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0)) : [], [snapshot]);

  if (snapshot.status === "unavailable") return <section className="rounded-3xl border border-border bg-surface/90 p-6 sm:p-9"><AlertTriangle className="size-6 text-warning"/><h3 className="mt-5 text-2xl">Market map unavailable</h3><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Live market breadth could not be retrieved. No estimated tiles, movements, or rankings are displayed.</p></section>;

  const maxVolume = Math.max(...ranked.map(asset => asset.volume24h ?? 0), 1);
  const movers = [...ranked].filter(asset => asset.change24h !== null).sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
  const gainer = movers[0]; const decliner = movers.at(-1);

  return <section className="market-heatmap overflow-hidden rounded-3xl border border-border-strong bg-[#050c0a]/94 shadow-[0_35px_100px_rgb(0_0_0/.42)]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7"><div><p className="font-reference text-[10px] uppercase tracking-[.2em] text-cyan">Market breadth / live cache</p><h3 className="mt-1 text-xl">Capital-weighted movement map</h3></div><div className="flex gap-1" aria-label="Heatmap quotation currency">{(["usd", "eur", "gbp", "ngn"] as const).map(item => <button key={item} type="button" onClick={() => setCurrency(item)} aria-pressed={currency === item} className={`min-h-9 rounded-md px-3 font-reference text-xs uppercase ${currency === item ? "bg-cyan text-background" : "text-muted hover:bg-white/5"}`}>{item}</button>)}</div></header>
    <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-5 lg:grid-cols-6 lg:grid-rows-2">{ranked.map((asset, index) => {
      const positive = (asset.change24h ?? 0) >= 0; const path = sparkline(asset); const span = index === 0 ? "lg:col-span-3 lg:row-span-2" : index < 3 ? "lg:col-span-3" : "lg:col-span-2";
      return <motion.article key={asset.id} initial={reduce ? false : { opacity: 0, scale: .96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * .06 }} className={`relative min-h-44 overflow-hidden rounded-2xl border p-5 ${span} ${positive ? "border-emerald/25 bg-[radial-gradient(circle_at_90%_0%,rgb(46_230_166/.2),transparent_55%),rgb(7_23_18/.95)]" : "border-danger/25 bg-[radial-gradient(circle_at_90%_0%,rgb(239_125_116/.19),transparent_55%),rgb(24_10_10/.95)]"}`}>
        <div className="flex items-start justify-between gap-3"><div><p className="font-reference text-xs text-muted">{asset.symbol}</p><h4 className="mt-1 text-xl">{asset.name}</h4></div><span className={`flex items-center font-reference text-sm ${positive ? "text-emerald-strong" : "text-danger"}`}>{positive ? <ArrowUpRight className="size-4"/> : <ArrowDownRight className="size-4"/>}{asset.change24h?.toFixed(2) ?? "—"}%</span></div>
        <motion.p key={`${asset.id}-${currency}`} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 font-reference text-2xl font-semibold">{currencySymbols[currency]}{asset.prices[currency].toLocaleString(undefined, { maximumFractionDigits: asset.prices[currency] < 1 ? 4 : 2 })}</motion.p>
        <svg role="img" aria-label={`${asset.name} individual seven-day sparkline`} className="mt-4 h-9 w-full" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points={path} fill="none" stroke={positive ? "#73f8c8" : "#ef7d74"} strokeWidth="1.7" vectorEffect="non-scaling-stroke"/></svg>
        <div className="mt-4"><div className="flex justify-between font-reference text-[9px] uppercase tracking-wider text-muted"><span>24h volume</span><span>${asset.volume24h === null ? "—" : Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(asset.volume24h)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"><motion.div initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: (asset.volume24h ?? 0) / maxVolume }} viewport={{ once: true }} className={`h-full origin-left rounded-full ${positive ? "bg-emerald" : "bg-danger"}`}/></div></div>
      </motion.article>;
    })}</div>
    <footer className="grid gap-px border-t border-border bg-border sm:grid-cols-2"><Mover label="Top gainer" asset={gainer}/><Mover label="Top decliner" asset={decliner}/></footer>
    <p className="border-t border-border px-5 py-3 text-[11px] leading-5 text-muted"><BarChart3 className="mr-2 inline size-3.5"/>Tile area follows available market-cap rank; volume bars use real 24-hour USD volume. Informational third-party data only.</p>
  </section>;
}

function Mover({ label, asset }: { label: string; asset: MarketAsset | undefined }) { return <div className="bg-background/88 p-5"><p className="font-reference text-[10px] uppercase tracking-[.18em] text-muted">{label}</p>{asset ? <div className="mt-2 flex items-end justify-between gap-4"><strong className="text-xl">{asset.symbol}</strong><span className={(asset.change24h ?? 0) >= 0 ? "font-reference text-emerald-strong" : "font-reference text-danger"}>{asset.change24h?.toFixed(2)}%</span></div> : <p className="mt-2 text-sm text-muted">Unavailable</p>}</div>; }
