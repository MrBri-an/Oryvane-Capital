import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
const icons = { info: Info, success: CircleCheck, warning: CircleAlert, danger: CircleAlert };
const tones = { info: "border-info/40 bg-info/8 text-info", success: "border-emerald/40 bg-emerald/8 text-emerald-strong", warning: "border-warning/40 bg-warning/8 text-warning", danger: "border-danger/40 bg-danger/8 text-danger" };
export function Alert({ tone = "info", title, children, className, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: keyof typeof tones; title: string }) { const Icon = icons[tone]; return <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-lg border p-4", tones[tone], className)} {...props}><Icon aria-hidden className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold text-foreground">{title}</p><div className="mt-1 text-sm text-muted">{children}</div></div></div>; }
