"use client";

import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Radio } from "lucide-react";
import { useState } from "react";

import { MarketChart } from "@/components/market/market-chart";
import type { MarketCurrency, MarketSnapshot } from "@/server/market-data";

const symbols: Record<MarketCurrency, string> = { usd: "$", eur: "€", gbp: "£", ngn: "₦" };
const compact = (value: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value);

export function MarketTerminal({ snapshot }: { snapshot: MarketSnapshot }) {
  const [currency, setCurrency] = useState<MarketCurrency>("usd");
  const [selected, setSelected] = useState(0);
  const reduce = useReducedMotion();

  if (snapshot.status === "unavailable") return <section className="terminal-noise relative overflow-hidden rounded-2xl border border-border bg-surface/90 p-6 sm:p-8"><AlertTriangle className="size-6 text-warning"/><h2 className="mt-5 text-2xl">Market feed unavailable</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Live informational prices could not be retrieved. No substitute or invented figures are displayed.</p></section>;

  const asset = snapshot.assets[selected];
  return <section data-testid="market-terminal" className="cosmic-float terminal-noise relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border-strong bg-[#050c0a]/95 shadow-[0_32px_90px_rgb(0_0_0/.42)]">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5"><div className="flex items-center gap-2 font-reference text-[10px] text-emerald-strong sm:text-xs"><Radio className="size-3.5 animate-pulse motion-reduce:animate-none"/>MARKET FEED · 5M CACHE<div className="candlestick-strip ml-1 hidden h-4 items-end gap-1 xs:flex">{[8, 14, 10, 16, 12].map((height, index) => <i key={height} style={{ height, animationDelay: `${index * -.35}s` }}/>)}</div></div><div className="grid grid-cols-4 gap-1" aria-label="Quotation currency">{(["usd", "eur", "gbp", "ngn"] as const).map(item => <button key={item} onClick={() => setCurrency(item)} aria-pressed={currency === item} className={`min-h-11 rounded-md px-2.5 font-reference text-[10px] uppercase sm:min-h-9 sm:text-xs ${currency === item ? "bg-emerald text-background" : "text-muted hover:bg-white/5"}`}>{item}</button>)}</div></header>
    <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(15rem,.75fr)]"><div className="border-b border-border p-4 sm:p-5 md:border-b-0 md:border-r"><div className="flex items-end justify-between gap-3"><div className="min-w-0"><p className="font-reference text-[10px] text-muted sm:text-xs">{asset.symbol} / {currency.toUpperCase()}</p><motion.p key={`${asset.id}-${currency}`} initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="mt-1 truncate font-reference text-2xl font-semibold sm:text-4xl">{symbols[currency]}{asset.prices[currency].toLocaleString(undefined, { maximumFractionDigits: asset.prices[currency] < 1 ? 4 : 2 })}</motion.p></div><p className={`flex shrink-0 items-center gap-1 font-reference text-xs sm:text-sm ${asset.change24h !== null && asset.change24h >= 0 ? "text-emerald-strong" : "text-danger"}`}>{asset.change24h !== null && asset.change24h >= 0 ? <ArrowUpRight className="size-4"/> : <ArrowDownRight className="size-4"/>}{asset.change24h?.toFixed(2) ?? "—"}%</p></div><MarketChart history={asset.history} label={`${asset.name} seven-day price chart in US dollars`} className="mt-4"/><div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-reference text-[10px] text-muted"><span>MCAP {asset.marketCap === null ? "—" : `$${compact(asset.marketCap)}`}</span><span>VOL 24H {asset.volume24h === null ? "—" : `$${compact(asset.volume24h)}`}</span></div></div>
      <div className="grid grid-cols-1 divide-y divide-border">{snapshot.assets.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={`grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/[.025] ${selected === index ? "bg-emerald/[.06]" : ""}`}><span className="min-w-0"><strong className="font-reference text-xs sm:text-sm">{item.symbol}</strong><small className="ml-2 hidden text-muted xs:inline">{item.name}</small></span><span className="whitespace-nowrap text-right font-reference text-xs sm:text-sm">{symbols[currency]}{item.prices[currency].toLocaleString(undefined, { maximumFractionDigits: item.prices[currency] < 1 ? 4 : 2 })}<small className={`ml-2 ${item.change24h !== null && item.change24h >= 0 ? "text-emerald-strong" : "text-danger"}`}>{item.change24h?.toFixed(2) ?? "—"}%</small></span></button>)}</div></div>
    <footer className="border-t border-border px-4 py-2 text-[10px] leading-4 text-muted sm:px-5">Informational third-party data · Updated {new Date(snapshot.fetchedAt).toISOString().slice(11, 16)} UTC · Not Oryvane investment earnings.</footer>
  </section>;
}
