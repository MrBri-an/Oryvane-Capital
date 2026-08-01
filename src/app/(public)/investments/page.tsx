import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import { InvestmentPlanCard } from "@/components/investments/investment-plan-card";
import { PageHero, PageShell, PublicSection } from "@/components/public/page-shell";
import { RiskNotice } from "@/components/public/risk-notice";
import { EmptyState } from "@/components/ui/states";
import { getActiveInvestmentPlans } from "@/server/investments/data";

export const metadata: Metadata = { title: "Investment plans", description: "Review currently active Oryvane Capital investment plans, terms, limits and risks." };
export default async function InvestmentsPage() {
  const plans = await getActiveInvestmentPlans();
  return <PageShell><PageHero eyebrow="Investment plans" title="Decisions grounded in complete terms." description="Review currently active plans, funding limits, duration, return information and risk before requesting an investment." /><RiskNotice /><PublicSection title="Available plans" description="Only plans currently marked active are shown. Availability dates and participant limits may still apply.">{plans.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <InvestmentPlanCard key={plan.id} plan={plan} />)}</div> : <EmptyState icon={TrendingUp} title="No active investment plans" description="There are currently no active plans available. No placeholder products are shown." />}</PublicSection></PageShell>;
}
