"use client";

import { Bell, CircleDollarSign, HelpCircle, Inbox } from "lucide-react";
import { useState } from "react";

import { AccountFigure } from "@/components/financial/account-figure";
import { CurrencyValue, PercentageValue } from "@/components/financial/format-values";
import { InvestmentStatus, StatusBadge, TransactionStatus } from "@/components/financial/status";
import { AnimatedFinancialFigure, CardEntrance, PageTransition, ScrollReveal } from "@/components/motion/motion-system";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Table, TableCell, TableContainer, TableHead } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

const swatches = [
  ["Obsidian", "bg-background"], ["Surface", "bg-surface"], ["Raised", "bg-surface-raised"], ["Emerald", "bg-emerald"], ["Muted gold", "bg-gold"], ["Danger", "bg-danger"], ["Warning", "bg-warning"], ["Information", "bg-info"],
];

function PreviewSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <ScrollReveal className="border-t border-border py-10 sm:py-14"><div className="mb-7"><h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p></div>{children}</ScrollReveal>; }

export function DesignSystemPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  return <PageTransition className="mx-auto w-full max-w-[90rem] px-[var(--space-page)] py-8 sm:py-12">
    <header className="pb-10 sm:pb-16"><Badge tone="gold">Private preview</Badge><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Oryvane Capital design system</h1><p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">A restrained foundation for trustworthy public, user, and administrative experiences. This route is unlinked and marked no-index.</p></header>

    <PreviewSection title="Colour and type" description="Obsidian surfaces, controlled emerald action colour, muted gold highlights, and warm readable text."><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{swatches.map(([name, color]) => <div key={name}><div className={`aspect-[3/2] rounded-lg border border-border ${color}`} /><p className="mt-2 text-sm text-muted">{name}</p></div>)}</div><div className="mt-10 grid gap-6 md:grid-cols-3"><div><p className="text-xs uppercase tracking-widest text-muted">Manrope</p><p className="mt-2 font-heading text-3xl font-semibold">Financial clarity</p></div><div><p className="text-xs uppercase tracking-widest text-muted">Geist Sans</p><p className="mt-2 text-lg">Interface content remains calm and legible.</p></div><div><p className="text-xs uppercase tracking-widest text-muted">Geist Mono</p><p className="font-reference mt-2 break-all text-sm">REFERENCE-FORMAT-PREVIEW</p></div></div></PreviewSection>

    <PreviewSection title="Actions and status" description="All interactive targets provide keyboard focus, disabled states, and mobile-friendly dimensions."><div className="flex flex-wrap gap-3"><Button>Primary action</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Quiet action</Button><Button variant="danger">Destructive</Button><Button disabled>Unavailable</Button></div><div className="mt-6 flex flex-wrap gap-2"><Badge>Neutral</Badge><Badge tone="success">Successful</Badge><Badge tone="warning">Review</Badge><Badge tone="danger">Attention</Badge><StatusBadge status="Restricted" tone="warning" /></div></PreviewSection>

    <PreviewSection title="Form controls" description="Labels, descriptions, native semantics, and visible focus are built into the form foundation."><Card className="max-w-2xl"><div className="grid gap-5 sm:grid-cols-2"><Field htmlFor="preview-name" label="Account label" hint="Preview input; no data is submitted."><Input id="preview-name" placeholder="Enter a label" /></Field><Field htmlFor="preview-type" label="Category"><Select id="preview-type" defaultValue=""><option value="" disabled>Select a category</option><option>Standard</option><option>Priority</option></Select></Field><Field htmlFor="preview-note" label="Internal note"><Textarea id="preview-note" placeholder="Add context" /></Field><div className="self-end"><Checkbox label="I understand this is a component preview" /></div></div></Card></PreviewSection>

    <PreviewSection title="Cards and financial formatting" description="Illustrative formatting samples only; these figures do not represent an account, product, return, or promise."><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardEntrance><AccountFigure icon={<CircleDollarSign className="size-5" />} label="Currency format sample" value={<CurrencyValue currency="USD" value={0} />} detail="Neutral zero-value presentation" /></CardEntrance><CardEntrance><AccountFigure label="Percentage format sample" value={<PercentageValue value={0} />} detail="No performance claim" /></CardEntrance><CardEntrance><AccountFigure label="Animated numeral sample" value={<span className="font-financial"><AnimatedFinancialFigure value={100} /> units</span>} detail="Motion disabled when reduced motion is preferred" /></CardEntrance></div></PreviewSection>

    <PreviewSection title="Feedback and overlays" description="Alerts, toast notifications, tooltips, loading placeholders, and modal behavior."><div className="grid gap-4 md:grid-cols-2"><Alert title="Informational message">Supporting detail uses a calm, readable hierarchy.</Alert><Alert tone="success" title="Action completed">Success is communicated with more than colour alone.</Alert><Alert tone="warning" title="Review required">Important context remains visible and direct.</Alert><Alert tone="danger" title="Unable to continue">Errors use an alert role for assistive technology.</Alert></div><div className="mt-6 flex flex-wrap items-center gap-3"><Button onClick={() => setModalOpen(true)} variant="secondary">Open modal</Button><Button onClick={() => toast.success("Preview notification", { description: "Toast behavior is ready for later product phases." })} variant="secondary"><Bell aria-hidden className="size-4" />Show toast</Button><Tooltip label="Context shown on hover and keyboard focus"><Button aria-label="More information" size="icon" variant="ghost"><HelpCircle aria-hidden className="size-5" /></Button></Tooltip></div><Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Accessible modal" description="Escape, the close control, and the backdrop close this preview."><p className="text-sm text-muted">This component uses the native dialog focus model and restrained opacity and transform transitions.</p><div className="mt-6 flex justify-end"><Button onClick={() => setModalOpen(false)}>Done</Button></div></Modal></PreviewSection>

    <PreviewSection title="Tabs and responsive table" description="Arrow-key tabs and horizontally contained data tables remain usable at 320px."><Tabs label="Preview categories" items={[{ id: "overview", label: "Overview", content: <p className="text-sm text-muted">Tab panels are labelled and keyboard reachable.</p> }, { id: "history", label: "History", content: <p className="text-sm text-muted">Left and right arrow keys move between tabs.</p> }]} /><TableContainer className="mt-6"><Table><caption className="sr-only">Status formatting preview</caption><thead><tr><TableHead>Reference</TableHead><TableHead>Transaction</TableHead><TableHead>Investment</TableHead></tr></thead><tbody><tr><TableCell className="font-reference">FORMAT-PREVIEW</TableCell><TableCell><TransactionStatus status="Under Review" /></TableCell><TableCell><InvestmentStatus status="Active" /></TableCell></tr></tbody></Table></TableContainer></PreviewSection>

    <PreviewSection title="Empty and loading states" description="Clear state communication avoids fabricated records and decorative distraction."><div className="grid gap-4 md:grid-cols-2"><EmptyState icon={Inbox} title="No items to display" description="When real records are unavailable, the interface explains the state without inventing content." action={<Button variant="secondary">Available action</Button>} /><Card><CardHeader><CardTitle>Loading foundation</CardTitle><CardDescription>Skeleton and announced loading patterns.</CardDescription></CardHeader><div className="grid gap-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-4/5" /></div><LoadingState label="Loading preview" /></Card></div></PreviewSection>
  </PageTransition>;
}
