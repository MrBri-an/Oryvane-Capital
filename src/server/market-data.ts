import "server-only";

const assetDefinitions = [
  ["bitcoin", "BTC", "Bitcoin"], ["ethereum", "ETH", "Ethereum"], ["solana", "SOL", "Solana"],
  ["binancecoin", "BNB", "BNB"], ["ripple", "XRP", "XRP"],
] as const;
export const marketCurrencies = ["usd", "eur", "gbp", "ngn"] as const;
export type MarketCurrency = (typeof marketCurrencies)[number];
export type MarketAsset = { id: string; symbol: string; name: string; prices: Record<MarketCurrency, number>; change24h: number | null; marketCap: number | null; volume24h: number | null; updatedAt: string; history: Array<[number, number]> };
export type MarketSnapshot = { status: "available"; assets: MarketAsset[]; fetchedAt: string } | { status: "unavailable"; assets: []; fetchedAt: string };
export type FxRate = { pair: string; rate: number; changePct: number; direction: "up" | "down" | "flat"; updatedAt: string };
export type PolicyRate = { currency: string; bank: string; rate: number | null; verifiedAt: string | null };
export type CurrencyIntelligence = { fx: { status: "available"; rates: FxRate[]; fetchedAt: string } | { status: "unavailable"; rates: []; fetchedAt: string }; policy: { status: "available" | "partial" | "unavailable"; rates: PolicyRate[]; fetchedAt: string } };
const fxPairs = [["EUR","USD"],["GBP","USD"],["USD","JPY"],["USD","CHF"],["USD","CAD"],["AUD","USD"],["EUR","JPY"],["GBP","EUR"]] as const;
const policyDefinitions = [["USD","Federal Reserve","central_bank_us"],["EUR","European Central Bank","central_bank_eu"],["GBP","Bank of England","central_bank_uk"],["JPY","Bank of Japan","central_bank_jp"],["CHF","Swiss National Bank","central_bank_ch"],["CAD","Bank of Canada","central_bank_ca"],["AUD","Reserve Bank of Australia","central_bank_au"],["NZD","Reserve Bank of New Zealand","central_bank_nz"]] as const;

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

function cross(rows: Record<string,number>, base:string, quote:string) { const a=base==="EUR"?1:rows[base], b=quote==="EUR"?1:rows[quote]; if(!Number.isFinite(a)||!Number.isFinite(b)) throw new Error("Incomplete FX data"); return b/a; }
async function getFxRates() { const fetchedAt=new Date().toISOString(); try { const end=fetchedAt.slice(0,10), start=new Date(Date.now()-8*86400000).toISOString().slice(0,10); const symbols=[...new Set(fxPairs.flat())].filter(x=>x!=="EUR").join(","); const response=await fetch(`https://api.frankfurter.dev/v1/${start}..${end}?base=EUR&symbols=${symbols}`,{next:{revalidate:900},signal:AbortSignal.timeout(6000)}); if(!response.ok) throw new Error(); const payload=await response.json() as {rates?:Record<string,Record<string,number>>}; const dates=Object.keys(payload.rates??{}).sort(); if(!payload.rates||dates.length<2) throw new Error(); const first=payload.rates[dates[0]], last=payload.rates[dates.at(-1)!]; return {status:"available" as const,rates:fxPairs.map(([base,quote])=>{const rate=cross(last,base,quote), prior=cross(first,base,quote), changePct=(rate-prior)/prior*100; return {pair:`${base} / ${quote}`,rate,changePct,direction:changePct>.0001?"up" as const:changePct<-.0001?"down" as const:"flat" as const,updatedAt:dates.at(-1)!}}),fetchedAt}; } catch { return {status:"unavailable" as const,rates:[] as [],fetchedAt}; } }
async function getPolicyRates() { const fetchedAt=new Date().toISOString(), key=process.env.API_NINJAS_KEY; if(!key) return {status:"unavailable" as const,rates:policyDefinitions.map(([currency,bank])=>({currency,bank,rate:null,verifiedAt:null})),fetchedAt}; const rates=await Promise.all(policyDefinitions.map(async([currency,bank,id])=>{try{const response=await fetch(`https://api.api-ninjas.com/v2/interestrate?rate=${id}`,{headers:{"X-Api-Key":key},next:{revalidate:14400},signal:AbortSignal.timeout(6000)}); if(!response.ok)throw new Error(); const value=await response.json() as {rate_pct?:number;last_updated?:string}; if(!Number.isFinite(value.rate_pct)||!value.last_updated)throw new Error(); return {currency,bank,rate:value.rate_pct!,verifiedAt:value.last_updated};}catch{return {currency,bank,rate:null,verifiedAt:null}}})); const count=rates.filter(x=>x.rate!==null).length; return {status:count===rates.length?"available" as const:count?"partial" as const:"unavailable" as const,rates,fetchedAt}; }
export async function getCurrencyIntelligence():Promise<CurrencyIntelligence>{const [fx,policy]=await Promise.all([getFxRates(),getPolicyRates()]);return {fx,policy};}
