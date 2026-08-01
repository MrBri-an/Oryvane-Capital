import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
export const metadata: Metadata = { title: "Terms summary", description: "Read the interim Oryvane Capital public website terms summary while final legal terms await approval." };
const sections = [
  { title: "Public information", paragraphs: ["This website currently provides general information about the planned Oryvane Capital platform. It does not activate an account, process a payment, execute an investment, or create an advisory relationship."] },
  { title: "No offer or advice", paragraphs: ["Nothing on this website is financial, legal, tax, or investment advice. Framework previews are not offers, recommendations, or approved products."] },
  { title: "Acceptable use", points: ["Do not attempt to interfere with the website or bypass access controls.", "Do not misrepresent your identity or use the website for unlawful purposes.", "Do not rely on placeholder or preview content as final product terms."] },
  { title: "Risk", paragraphs: ["Investment values can rise or fall and returns are not guaranteed. Future participation will require review of complete product-specific terms and disclosures."] },
  { title: "Final terms", paragraphs: ["Final company details, eligibility, jurisdiction, limitation provisions, complaints process, and governing law will be included only after legal approval."] },
] as const;
export default function TermsPage() { return <LegalPage eyebrow="Legal" title="Terms summary" description="An interim explanation of how this public website should—and should not—be used." sections={sections} />; }
