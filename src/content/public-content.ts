export const investmentFrameworks = [
  {
    slug: "capital-preservation",
    name: "Capital Preservation",
    eyebrow: "Stability-oriented framework",
    summary: "A review framework focused on capital resilience, liquidity considerations, and clearly documented risk boundaries.",
    description: "This framework illustrates how Oryvane Capital may organise a stability-oriented mandate. Final products, eligibility, assets, duration, fees, minimums, and availability remain subject to approval and disclosure before launch.",
    principles: ["Defined risk boundaries", "Documented review process", "Clear suitability information"],
  },
  {
    slug: "diversified-growth",
    name: "Diversified Growth",
    eyebrow: "Balanced framework",
    summary: "A structured approach to evaluating diversified opportunities without relying on a single market outcome.",
    description: "This framework shows the intended information hierarchy for a diversified mandate. It is not an offer, and no allocation, expected return, or product terms have been approved.",
    principles: ["Diversification awareness", "Ongoing risk review", "Transparent reporting structure"],
  },
  {
    slug: "strategic-opportunities",
    name: "Strategic Opportunities",
    eyebrow: "Higher-complexity framework",
    summary: "A selective framework for opportunities requiring deeper review, stronger suitability checks, and explicit risk communication.",
    description: "This preview demonstrates how a higher-complexity strategy could be explained. It does not indicate availability, performance expectations, or suitability for any investor.",
    principles: ["Enhanced due diligence", "Explicit suitability review", "Detailed risk disclosure"],
  },
] as const;

export const commonQuestions = [
  { question: "Are returns guaranteed?", answer: "No. Investment values can rise or fall, and returns are never guaranteed. Any future product will include specific risks and terms before a user can make a decision." },
  { question: "Can I invest through this website today?", answer: "No. This public website explains the intended platform experience. Authentication, payments, and investment functionality are not active in this phase." },
  { question: "How will account values be controlled?", answer: "Authoritative financial figures are intended to come from protected records and server-side operations. Browser interfaces will not be trusted to set balances, earnings, or approval states." },
  { question: "Which plans and currencies will be available?", answer: "Final products, currencies, limits, durations, and fees are still awaiting approval. They will be disclosed clearly before any product becomes available." },
  { question: "How are payments reviewed?", answer: "The planned workflow requires submitted payment details to be reviewed by an authorised administrator before any account credit occurs. This workflow is not implemented yet." },
  { question: "Where can I read the risk information?", answer: "Read the risk disclosure summary on this website. Product-specific disclosures will also be required when final investment products are approved." },
] as const;
