import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
export const metadata: Metadata = { title: "Risk disclosure", description: "Review the general risks associated with investments and the limits of Oryvane Capital's current public information." };
const sections = [
  { title: "Capital and performance risk", paragraphs: ["Investment values can rise or fall. You may receive back less than you commit, and returns are not guaranteed. Past performance, where lawfully presented in future, would not guarantee future results."] },
  { title: "Liquidity and timing", paragraphs: ["Some investments may be difficult to exit or may restrict access to committed funds. Final duration, cancellation, maturity, and withdrawal rules have not been approved."] },
  { title: "Market and concentration risk", paragraphs: ["Markets, sectors, currencies, counterparties, and economic conditions can change. Concentrated exposure can increase the effect of adverse events."] },
  { title: "Currency and digital-asset risk", paragraphs: ["Currency conversion can change value. Digital assets can experience significant volatility, network delays, irreversible transfers, custody risks, and regulatory change."] },
  { title: "Operational and technology risk", paragraphs: ["Manual review, third-party services, cybersecurity events, human error, outages, and delayed processing can affect service availability or timing despite controls."] },
  { title: "Suitability and independent advice", paragraphs: ["An investment suitable for one person may not suit another. Consider your objectives, knowledge, financial position, ability to bear loss, and need for liquidity. Seek appropriately qualified independent advice where needed."] },
  { title: "Product-specific disclosure", paragraphs: ["This summary cannot describe every risk. Complete approved terms, fees, underlying assets, eligibility, conflicts, and product-specific risks must be reviewed before any future participation."] },
] as const;
export default function RiskDisclosurePage() { return <LegalPage eyebrow="Risk" title="Risk disclosure" description="Investing involves uncertainty. Understand the potential for loss and the limits of general information before making any decision." sections={sections} />; }
