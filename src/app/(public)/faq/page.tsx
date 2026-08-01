import type { Metadata } from "next";
import { CallToAction } from "@/components/public/call-to-action";
import { FaqList } from "@/components/public/faq-list";
import { PageHero, PageShell, PublicSection } from "@/components/public/page-shell";
import { commonQuestions } from "@/content/public-content";
export const metadata: Metadata = { title: "Frequently asked questions", description: "Answers about the planned Oryvane Capital platform, investment risk, financial controls, and current availability." };
export default function FaqPage() { return <PageShell><PageHero eyebrow="FAQ" title="Questions deserve direct answers." description="Understand what is planned, what is not yet active, and what remains subject to final approval." /><PublicSection title="Common questions"><FaqList items={commonQuestions} /></PublicSection><CallToAction title="Still need clarity?" description="Visit the contact page to understand how enquiries will be handled before launch." /></PageShell>; }
