"use client";

import { Bell, CircleDollarSign, CreditCard, LayoutDashboard, LogOut, Menu, Settings, TrendingUp, WalletCards, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { logoutAction } from "@/server/auth/actions";
import { cn } from "@/lib/utils";

const items = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/investments", "Investments", TrendingUp],
  ["/dashboard/transactions", "Transactions", CircleDollarSign],
  ["/dashboard/deposits", "Deposits", CreditCard],
  ["/dashboard/withdrawals", "Withdrawals", WalletCards],
  ["/dashboard/notifications", "Notifications", Bell],
  ["/dashboard/settings", "Settings", Settings],
] as const;

export function DashboardNavigation({ name, status }: { name: string; status: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = <><div className="border-b border-border p-5"><Link href="/" className="font-heading text-xl font-semibold tracking-[-0.03em]">Oryvane <span className="text-gold">Capital</span></Link><p className="mt-4 truncate text-sm font-medium">{name}</p><p className="mt-1 text-xs capitalize text-muted">{status.replaceAll("_", " ")}</p></div><nav aria-label="Dashboard" className="grid gap-1 p-3">{items.map(([href, label, Icon]) => { const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2", active && "bg-emerald/10 text-emerald-strong")}><Icon aria-hidden className="size-4" />{label}</Link>; })}</nav><form action={logoutAction} className="mt-auto p-3"><button type="submit" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}><LogOut aria-hidden className="size-4" />Log out</button></form></>;
  return <><a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-emerald focus:px-4 focus:py-2 focus:text-[#06120c]">Skip to dashboard content</a><header className="fixed inset-x-0 top-0 z-[40] flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden"><Link href="/" className="font-heading font-semibold">Oryvane Capital</Link><Button type="button" size="icon" variant="secondary" aria-label={open ? "Close dashboard navigation" : "Open dashboard navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}</Button></header><aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface-subtle lg:flex">{nav}</aside>{open && <div className="fixed inset-0 z-[39] bg-black/70 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}<aside className={cn("fixed inset-y-0 left-0 z-[40] flex w-[min(85vw,19rem)] flex-col border-r border-border bg-surface-subtle transition-transform duration-200 motion-reduce:transition-none lg:hidden", open ? "translate-x-0" : "-translate-x-full")} aria-hidden={!open} inert={!open}>{nav}</aside></>;
}
