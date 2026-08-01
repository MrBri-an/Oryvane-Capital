import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/motion-system";

export function DashboardSection({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children: ReactNode }) {
  return <PageTransition><header className="mb-7 border-b border-border pb-6">{eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>}<h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p></header>{children}</PageTransition>;
}
