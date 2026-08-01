import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("w-full overflow-x-auto rounded-lg border border-border", className)} {...props} />; }
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <table className={cn("w-full min-w-[36rem] border-collapse text-left text-sm", className)} {...props} />; }
export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th scope="col" className={cn("border-b border-border bg-surface-raised px-4 py-3 font-semibold text-muted", className)} {...props} />; }
export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("border-b border-border px-4 py-3 last:border-b-0", className)} {...props} />; }
