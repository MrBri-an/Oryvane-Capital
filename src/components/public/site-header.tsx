"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [["Home", "/"], ["About", "/about"], ["Investments", "/investments"], ["How it works", "/how-it-works"], ["Security", "/security"], ["FAQ", "/faq"], ["Contact", "/contact"]] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return <motion.header animate={reduce ? undefined : { y: scrolled ? 6 : 0, scale: scrolled ? .985 : 1 }} className={`sticky top-0 z-[var(--z-navigation)] border-b border-border/70 backdrop-blur-xl transition-colors ${scrolled ? "mx-2 rounded-b-2xl bg-background/92 shadow-[0_18px_55px_rgb(0_0_0/.4)]" : "bg-background/72"}`}>
    <nav aria-label="Primary navigation" className="mx-auto flex min-h-18 max-w-[90rem] items-center justify-between gap-4 px-[var(--space-page)]">
      <Link href="/" className="flex min-h-11 items-center gap-2 rounded-sm font-heading text-lg font-bold tracking-[-0.04em]"><span aria-hidden className="grid size-8 place-items-center rounded-full border border-emerald/60 bg-emerald/10 text-xs text-emerald-strong shadow-[0_0_24px_rgb(46_230_166/.15)]">O</span>Oryvane Capital</Link>
      <div className="hidden items-center gap-1 lg:flex">{links.map(([label, href]) => <motion.div key={href} whileHover={reduce ? undefined : { y: -2, scale: 1.04 }} whileTap={reduce ? undefined : { scale: .97 }}><Link href={href} aria-current={isActive(href) ? "page" : undefined} className={cn("relative block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground", isActive(href) && "text-foreground")}>{isActive(href) && <motion.span layoutId="active-route" className="absolute inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-cyan to-transparent shadow-[0_0_10px_var(--cyan)]"/>}<span className="relative">{label}</span></Link></motion.div>)}</div>
      <div className="hidden items-center gap-2 sm:flex"><Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/login">Log in</Link><Link className={buttonVariants({ size: "sm" })} href="/register">Create account</Link></div>
      <button type="button" className="grid size-11 place-items-center rounded-md border border-border bg-surface lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}</button>
    </nav>
    <AnimatePresence>{open && <motion.div id="mobile-navigation" initial={reduce ? false : { opacity: 0, y: -18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: .98 }} className="border-t border-border bg-background/95 px-[var(--space-page)] py-4 lg:hidden"><div className="mx-auto grid max-w-[90rem] gap-1">{links.map(([label, href], index) => <motion.div key={href} initial={reduce ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .035 }}><Link href={href} aria-current={isActive(href) ? "page" : undefined} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-white/5 hover:text-foreground aria-[current=page]:bg-emerald/10 aria-[current=page]:text-emerald-strong">{label}</Link></motion.div>)}<div className="mt-3 grid grid-cols-2 gap-2 sm:hidden"><Link onClick={() => setOpen(false)} className={buttonVariants({ variant: "secondary" })} href="/login">Log in</Link><Link onClick={() => setOpen(false)} className={buttonVariants()} href="/register">Register</Link></div></div></motion.div>}</AnimatePresence>
  </motion.header>;
}
