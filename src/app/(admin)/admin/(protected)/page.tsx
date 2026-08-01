import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { Card } from "@/components/ui/card";
import { getAdminOverview } from "@/server/admin/data";
export const metadata: Metadata = { title: "Admin overview", description: "Permission-aware read-only administration overview." };
export default async function AdminPage() { const { context, cards } = await getAdminOverview(); return <AdminSection title="Control centre" description="A read-only view of the operational records permitted by your assigned role."><div className="mb-6 flex flex-wrap gap-3 text-sm"><span className="rounded-full border border-border px-3 py-1.5">{context.role_name}</span><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/40 px-3 py-1.5 text-emerald-strong"><ShieldCheck aria-hidden className="size-4" />AAL2 session</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((item) => <Link key={item.href} href={item.href}><Card className="h-full transition-colors hover:border-gold/60"><p className="text-sm text-muted">{item.label}</p><div className="mt-4 flex items-end justify-between"><p className="font-financial text-3xl font-semibold">{item.count.toLocaleString()}</p><ArrowUpRight aria-hidden className="size-5 text-gold" /></div></Card></Link>)}</div></AdminSection>; }
