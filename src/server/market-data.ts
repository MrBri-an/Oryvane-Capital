import "server-only";

const assetDefinitions = [
  ["bitcoin", "BTC", "Bitcoin"], ["ethereum", "ETH", "Ethereum"], ["solana", "SOL", "Solana"],
  ["binancecoin", "BNB", "BNB"], ["ripple", "XRP", "XRP"],
] as const;
export const marketCurrencies = ["usd", "eur", "gbp", "ngn"] as const;
export type MarketCurrency = (typeof marketCurrencies)[number];
export type MarketAsset = { id: string; symbol: string; name: string; prices: Record<MarketCurrency, number>; change24h: number | null; marketCap: number | null; volume24h: number | null; updatedAt: string; history: Array<[number, number]> };
export type MarketSnapshot = { status: "available"; assets: MarketAsset[]; fetchedAt: string } | { status: "unavailable"; assets: []; fetchedAt: string };

function headers() { const key = process.env.COINGECKO_API_KEY; return key ? { "x-cg-demo-api-key": key } : undefined; }
async function gecko(path: string) {
  const response = await fetch(`https://api.coingecko.com/api/v3${path}`, { headers: headers(), next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error("Market data provider unavailable");
  return response.json() as Promise<unknown>;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const fetchedAt = new Date().toISOString();
  try {
    const ids = assetDefinitions.map(([id]) => id).join(",");
    const priceData = await gecko(`/simple/price?ids=${ids}&vs_currencies=${marketCurrencies.join(",")}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`) as Record<string, Record<string, number>>;
    const histories = await Promise.all(assetDefinitions.map(async ([id]) => {
      const chart = await gecko(`/coins/${id}/market_chart?vs_currency=usd&days=7&interval=hourly`) as { prices?: Array<[number, number]> };
      return chart.prices?.filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1])) ?? [];
    }));
    const assets = assetDefinitions.map(([id, symbol, name], index) => {
      const row = priceData[id];
      if (!row || !marketCurrencies.every((currency) => Number.isFinite(row[currency]))) throw new Error("Incomplete market data");
      return { id, symbol, name, prices: Object.fromEntries(marketCurrencies.map((currency) => [currency, row[currency]])) as Record<MarketCurrency, number>, change24h: Number.isFinite(row.usd_24h_change) ? row.usd_24h_change : null, marketCap: Number.isFinite(row.usd_market_cap) ? row.usd_market_cap : null, volume24h: Number.isFinite(row.usd_24h_vol) ? row.usd_24h_vol : null, updatedAt: new Date((row.last_updated_at ?? Date.now() / 1000) * 1000).toISOString(), history: histories[index] };
    });
    return { status: "available", assets, fetchedAt };
  } catch {
    return { status: "unavailable", assets: [], fetchedAt };
  }
}
