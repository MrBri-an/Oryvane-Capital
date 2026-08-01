import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-[color,background-color,border-color,opacity,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-strong disabled:pointer-events-none disabled:opacity-45 active:translate-y-px", {
  variants: {
    variant: {
      primary: "bg-emerald text-[#06120c] hover:bg-emerald-strong",
      secondary: "border border-border-strong bg-surface-raised text-foreground hover:border-emerald/70",
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
