import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("w-full overflow-x-auto rounded-2xl border border-border bg-surface/60 shadow-[0_18px_60px_rgb(0_0_0/.2)]", className)} {...props} />; }
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <table className={cn("w-full min-w-[36rem] border-collapse text-left text-sm", className)} {...props} />; }
export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th scope="col" className={cn("border-b border-border bg-surface-raised/90 px-4 py-3 font-reference text-[11px] font-semibold uppercase tracking-wider text-muted", className)} {...props} />; }
export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("border-b border-border/80 px-4 py-3.5 last:border-b-0", className)} {...props} />; }
