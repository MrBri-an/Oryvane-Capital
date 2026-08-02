"use client";

import type { MarketSnapshot } from "@/server/market-data";

export function MarketTicker({ snapshot }: { snapshot: MarketSnapshot }) {
  if (snapshot.status === "unavailable") return <div className="border-y border-border bg-background/75 py-3 text-center font-reference text-[10px] uppercase tracking-[.22em] text-muted">Live market ticker temporarily unavailable · no substitute values shown</div>;
  const items = [...snapshot.assets, ...snapshot.assets];
  return <div className="ticker-shell overflow-hidden border-y border-border bg-background/78 py-3 backdrop-blur" aria-label="Live cryptocurrency market ticker"><div className="market-ticker flex w-max gap-10 whitespace-nowrap px-5">{items.map((asset, index) => <span className="flex items-center gap-3 font-reference text-xs" key={`${asset.id}-${index}`}><strong className="text-foreground">{asset.symbol}</strong><span className="text-muted">${asset.prices.usd.toLocaleString(undefined, { maximumFractionDigits: asset.prices.usd < 1 ? 4 : 2 })}</span><span className={asset.change24h !== null && asset.change24h >= 0 ? "text-emerald-strong" : "text-danger"}>{asset.change24h?.toFixed(2) ?? "—"}%</span></span>)}</div></div>;
}
