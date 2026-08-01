import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
export const metadata: Metadata = { title: "Privacy summary", description: "Read the interim Oryvane Capital privacy summary and understand what is not yet collected through the public website." };
const sections = [
  { title: "Current phase", paragraphs: ["The public pages do not implement registration, payment submission, investment requests, or a contact form. Do not send personal or financial information through unverified channels."] },
  { title: "Information expected later", points: ["Account and contact information required for registration.", "Security and session information needed to protect access.", "Payment or transaction evidence required by approved workflows.", "Records needed for legal, compliance, support, and audit responsibilities."] },
  { title: "Intended safeguards", paragraphs: ["Sensitive information is intended to be access-controlled, retained only according to approved requirements, and processed through protected services. Private payment evidence should not use permanent public links."] },
  { title: "Your choices", paragraphs: ["Final privacy documentation will explain applicable access, correction, objection, deletion, and complaint rights based on the approved operating regions and governing laws."] },
  { title: "Final policy", paragraphs: ["Data controller details, lawful bases, retention periods, processors, international transfers, cookies, and official privacy contacts remain subject to legal and operational approval."] },
] as const;
export default function PrivacyPage() { return <LegalPage eyebrow="Legal" title="Privacy summary" description="A transparent interim view of the intended data-protection approach while final operating details are decided." sections={sections} />; }
