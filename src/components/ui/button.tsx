import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-strong disabled:pointer-events-none disabled:opacity-45 active:scale-[.985]", {
  variants: {
    variant: {
      primary: "bg-emerald text-[#03100b] shadow-[0_0_32px_rgb(46_230_166/.14)] hover:-translate-y-0.5 hover:bg-emerald-strong hover:shadow-[0_0_44px_rgb(46_230_166/.25)]",
      secondary: "border border-border-strong bg-surface-raised/80 text-foreground hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-surface-raised",
      ghost: "text-foreground hover:bg-white/6",
      danger: "bg-danger text-[#1a0807] hover:brightness-110",
    },
    size: { sm: "min-h-9 px-3 text-xs", md: "min-h-11 px-4", lg: "min-h-12 px-6 text-base", icon: "size-11 p-0" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
