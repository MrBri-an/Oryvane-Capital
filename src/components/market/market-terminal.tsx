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
  return <section className="cosmic-float terminal-noise relative overflow-hidden rounded-2xl border border-border-strong bg-[#050c0a]/95 shadow-[0_40px_120px_rgb(0_0_0/.48)]">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6"><div className="flex items-center gap-2 font-reference text-xs text-emerald-strong"><Radio className="size-3.5 animate-pulse motion-reduce:animate-none"/>MARKET FEED · 5M CACHE<div className="candlestick-strip ml-2 flex h-5 items-end gap-1">{[8, 16, 11, 19, 13].map((height, index) => <i key={height} style={{ height, animationDelay: `${index * -.35}s` }}/>)}</div></div><div className="flex gap-1" aria-label="Quotation currency">{(["usd", "eur", "gbp", "ngn"] as const).map(item => <button key={item} onClick={() => setCurrency(item)} aria-pressed={currency === item} className={`min-h-9 rounded-md px-3 font-reference text-xs uppercase ${currency === item ? "bg-emerald text-background" : "text-muted hover:bg-white/5"}`}>{item}</button>)}</div></header>
    <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.75fr)]"><div className="border-b border-border p-5 sm:p-8 lg:border-b-0 lg:border-r"><div className="flex items-end justify-between gap-4"><div><p className="font-reference text-xs text-muted">{asset.symbol} / {currency.toUpperCase()}</p><motion.p key={`${asset.id}-${currency}`} initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="mt-2 font-reference text-3xl font-semibold sm:text-5xl">{symbols[currency]}{asset.prices[currency].toLocaleString(undefined, { maximumFractionDigits: asset.prices[currency] < 1 ? 4 : 2 })}</motion.p></div><p className={`flex items-center gap-1 font-reference text-sm ${asset.change24h !== null && asset.change24h >= 0 ? "text-emerald-strong" : "text-danger"}`}>{asset.change24h !== null && asset.change24h >= 0 ? <ArrowUpRight className="size-4"/> : <ArrowDownRight className="size-4"/>}{asset.change24h?.toFixed(2) ?? "—"}%</p></div><MarketChart history={asset.history} label={`${asset.name} seven-day price chart in US dollars`} className="mt-8"/><div className="mt-3 flex gap-8 font-reference text-[11px] text-muted"><span>MCAP {asset.marketCap === null ? "—" : `$${compact(asset.marketCap)}`}</span><span>VOL 24H {asset.volume24h === null ? "—" : `$${compact(asset.volume24h)}`}</span></div></div>
      <div className="divide-y divide-border">{snapshot.assets.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[.025] ${selected === index ? "bg-emerald/[.06]" : ""}`}><span><strong className="font-reference text-sm">{item.symbol}</strong><small className="ml-2 text-muted">{item.name}</small></span><span className="text-right font-reference text-sm">{symbols[currency]}{item.prices[currency].toLocaleString(undefined, { maximumFractionDigits: item.prices[currency] < 1 ? 4 : 2 })}<small className={`ml-3 ${item.change24h !== null && item.change24h >= 0 ? "text-emerald-strong" : "text-danger"}`}>{item.change24h?.toFixed(2) ?? "—"}%</small></span></button>)}</div></div>
    <footer className="border-t border-border px-5 py-3 text-[11px] leading-5 text-muted sm:px-8">Informational third-party market data. Updated {new Date(snapshot.fetchedAt).toISOString().slice(11, 16)} UTC. Crypto prices are not Oryvane investment earnings and are not guaranteed.</footer>
  </section>;
}
