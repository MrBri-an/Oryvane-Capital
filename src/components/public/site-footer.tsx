import Link from "next/link";

const groups = [
  { title: "Explore", links: [["About", "/about"], ["Investment frameworks", "/investments"], ["How it works", "/how-it-works"], ["Security", "/security"]] },
  { title: "Support", links: [["FAQ", "/faq"], ["Contact", "/contact"], ["Log in", "/login"], ["Register", "/register"]] },
  { title: "Legal", links: [["Terms", "/terms"], ["Privacy", "/privacy"], ["Risk disclosure", "/risk-disclosure"]] },
] as const;

export function SiteFooter() { return <footer className="border-t border-border bg-surface-subtle"><div className="mx-auto max-w-[90rem] px-[var(--space-page)] py-12 sm:py-16"><div className="grid gap-10 md:grid-cols-[1.3fr_2fr]"><div><Link href="/" className="font-heading text-xl font-bold">Oryvane Capital</Link><p className="mt-4 max-w-sm text-sm leading-6 text-muted">A planned investment platform built around clear information, controlled operations, and accountable records.</p><p className="mt-5 text-sm font-semibold text-warning">Investment values can rise or fall. Returns are not guaranteed.</p></div><div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><h2 className="text-sm font-semibold">{group.title}</h2><ul className="mt-4 grid gap-3">{group.links.map(([label, href]) => <li key={href}><Link className="text-sm text-muted hover:text-foreground" href={href}>{label}</Link></li>)}</ul></div>)}</div></div><div className="mt-12 border-t border-border pt-6 text-xs leading-5 text-muted"><p>Public information only. Nothing on this website is financial advice, a recommendation, or an offer to invest.</p><p className="mt-2">© {new Date().getFullYear()} Oryvane Capital. Brand and legal details remain subject to final approval.</p></div></div></footer>; }
