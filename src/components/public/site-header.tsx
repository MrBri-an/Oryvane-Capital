"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  ["About", "/about"], ["Investments", "/investments"], ["How it works", "/how-it-works"], ["Security", "/security"], ["FAQ", "/faq"], ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return <header className="sticky top-0 z-[var(--z-navigation)] border-b border-border/80 bg-background/95 backdrop-blur-md">
    <nav aria-label="Primary navigation" className="mx-auto flex min-h-18 max-w-[90rem] items-center justify-between gap-4 px-[var(--space-page)]">
      <Link href="/" className="flex min-h-11 items-center gap-2 rounded-sm font-heading text-lg font-bold tracking-[-0.03em]"><span aria-hidden className="grid size-7 place-items-center rounded-full border border-gold/60 text-xs text-gold">O</span>Oryvane Capital</Link>
      <div className="hidden items-center gap-1 lg:flex">{links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={cn("rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground", pathname === href && "bg-white/5 text-foreground")}>{label}</Link>)}</div>
      <div className="hidden items-center gap-2 sm:flex"><Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/login">Log in</Link><Link className={buttonVariants({ size: "sm" })} href="/register">Create account</Link></div>
      <button type="button" className="grid size-11 place-items-center rounded-md border border-border bg-surface lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}</button>
    </nav>
    <AnimatePresence>{open && <motion.div id="mobile-navigation" initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="border-t border-border bg-background px-[var(--space-page)] py-4 lg:hidden"><div className="mx-auto grid max-w-[90rem] gap-1">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-white/5 hover:text-foreground">{label}</Link>)}<div className="mt-3 grid grid-cols-2 gap-2 sm:hidden"><Link onClick={() => setOpen(false)} className={buttonVariants({ variant: "secondary" })} href="/login">Log in</Link><Link onClick={() => setOpen(false)} className={buttonVariants()} href="/register">Register</Link></div></div></motion.div>}</AnimatePresence>
  </header>;
}
