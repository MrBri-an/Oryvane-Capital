import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("cosmic-float relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(145deg,rgb(13_25_22/.96),rgb(6_12_11/.96))] p-4 shadow-[0_18px_50px_rgb(0_0_0/.22)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan/30 before:to-transparent sm:p-6", className)} {...props} />; }
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("mb-5 grid gap-1", className)} {...props} />; }
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("text-lg font-semibold", className)} {...props} />; }
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-sm text-muted", className)} {...props} />; }
