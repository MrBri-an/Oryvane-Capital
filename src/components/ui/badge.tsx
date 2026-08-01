import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex min-h-6 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", { variants: { tone: {
  neutral: "border-border bg-surface-raised text-muted", success: "border-emerald/35 bg-emerald/10 text-emerald-strong", warning: "border-warning/35 bg-warning/10 text-warning", danger: "border-danger/35 bg-danger/10 text-danger", info: "border-info/35 bg-info/10 text-info", gold: "border-gold/35 bg-gold/10 text-gold",
}}, defaultVariants: { tone: "neutral" } });
export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) { return <span className={cn(badgeVariants({ tone }), className)} {...props} />; }
