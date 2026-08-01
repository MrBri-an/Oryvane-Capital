import type { Metadata } from "next";
import { InvestmentCard } from "@/components/public/investment-card";
import { PageHero, PageShell, PublicSection } from "@/components/public/page-shell";
import { RiskNotice } from "@/components/public/risk-notice";
import { Alert } from "@/components/ui/alert";
import { investmentFrameworks } from "@/content/public-content";
export const metadata: Metadata = { title: "Investment frameworks", description: "Review illustrative Oryvane Capital investment information frameworks and the risks that apply before product terms are approved." };
export default function InvestmentsPage() { return <PageShell><PageHero eyebrow="Investment frameworks" title="Start with the shape of the decision." description="Explore how future investment information may be organised. These frameworks are not live products and contain no promised return, approved duration, fee, limit, or currency." /><RiskNotice /><PublicSection title="Frameworks under consideration" description="Each preview focuses on decision quality and disclosure structure rather than promotional performance claims."><div className="grid gap-4 md:grid-cols-3">{investmentFrameworks.map((framework) => <InvestmentCard key={framework.slug} framework={framework} />)}</div><Alert className="mt-10" title="No product is currently offered">Availability, suitability, underlying assets, geographic access, values, currencies, and final terms remain subject to approval.</Alert></PublicSection></PageShell>; }
