import { CurrencyValue } from "@/components/financial/format-values";

export function DateValue({ value }: { value: string | null }) { return <span className="whitespace-nowrap">{value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "—"}</span>; }
export function Reference({ value }: { value: string }) { return <span className="font-reference text-xs text-muted">{value}</span>; }
export function Money({ amount, currency }: { amount: number; currency: string }) { return <CurrencyValue value={amount} currency={currency} className="whitespace-nowrap" maximumFractionDigits={2} />; }
export function Label({ value }: { value: string }) { return <span className="capitalize">{value.replaceAll("_", " ")}</span>; }
