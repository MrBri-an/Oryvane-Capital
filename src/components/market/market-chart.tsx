import { cn } from "@/lib/utils";

function points(values: number[], width: number, height: number) { const min = Math.min(...values), max = Math.max(...values), range = max - min || 1; return values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${height - ((value - min) / range) * height}`).join(" "); }
export function MarketChart({ history, label, className }: { history: Array<[number, number]>; label: string; className?: string }) {
  const sampled = history.filter((_, index) => index % Math.max(1, Math.floor(history.length / 48)) === 0).map(([, value]) => value);
  if (sampled.length < 2) return <div className={cn("grid min-h-40 place-items-center rounded-xl border border-dashed border-border text-sm text-muted", className)}>Seven-day chart unavailable</div>;
  const rising = sampled.at(-1)! >= sampled[0];
  return <figure className={className}><svg role="img" aria-label={label} viewBox="0 0 640 240" className="h-auto w-full overflow-visible"><defs><linearGradient id={`fill-${rising}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={rising ? "#2ee6a6" : "#ef7d74"} stopOpacity=".28"/><stop offset="1" stopColor={rising ? "#2ee6a6" : "#ef7d74"} stopOpacity="0"/></linearGradient></defs><polyline points={`0,240 ${points(sampled,640,210)} 640,240`} fill={`url(#fill-${rising})`} stroke="none"/><polyline points={points(sampled,640,210)} fill="none" stroke={rising ? "#2ee6a6" : "#ef7d74"} strokeWidth="3" vectorEffect="non-scaling-stroke" className="chart-path"/></svg><figcaption className="sr-only">{label}. The seven-day direction is {rising ? "upward" : "downward"}.</figcaption></figure>;
}
