"use client";

import { ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";

export function RiskNotice() {
  const pathname = usePathname();
  if (!/^\/investments\/[^/]+$/.test(pathname)) return null;
  return <aside className="border-y border-warning/20 bg-warning/[.035]"><div className="mx-auto flex max-w-[90rem] items-start gap-3 px-[var(--space-page)] py-4 text-sm leading-6"><ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warning"/><p className="text-muted">Investment values may rise or fall. Review the applicable terms before proceeding.</p></div></aside>;
}
