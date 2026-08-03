"use client";

import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { BookOpenCheck, FileUp, History, ShieldCheck, type LucideIcon } from "lucide-react";
import type { MouseEvent } from "react";

const steps: Array<{ number: string; title: string; description: string; icon: LucideIcon }> = [
  { number: "01", title: "Understand", description: "Review the opportunity, its limits, duration, terms, and risk.", icon: BookOpenCheck },
  { number: "02", title: "Submit", description: "Send a validated request through a controlled workflow.", icon: FileUp },
  { number: "03", title: "Verify", description: "Authorised review protects consequential financial transitions.", icon: ShieldCheck },
  { number: "04", title: "Track", description: "Follow status and permanent records through one calm interface.", icon: History },
];

function SequenceCard({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const glow = useTransform(() => `radial-gradient(circle at ${pointerX.get()}% ${pointerY.get()}%, rgb(80 213 255 / .15), transparent 42%)`);

  function move(event: MouseEvent<HTMLElement>) {
    if (reduced) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 100);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 100);
  }

  const Icon = step.icon;
  return <motion.li
    initial={reduced ? false : { opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-12%" }}
    transition={{ duration: reduced ? 0 : .42, delay: reduced ? 0 : index * .08, ease: [.16, 1, .3, 1] }}
    whileHover={reduced ? undefined : { y: index % 2 ? -4 : -7 }}
    onMouseMove={move}
    className={`sequence-card relative overflow-hidden rounded-2xl border border-border bg-background/92 p-5 sm:p-6 ${index % 2 ? "md:translate-y-3" : ""}`}
  >
    <motion.span className="pointer-events-none absolute inset-0" style={{ background: glow }} />
    <div className="relative flex items-center justify-between gap-4"><span className="sequence-marker grid size-10 place-items-center rounded-full border border-cyan/35 bg-cyan/8 font-reference text-[10px] text-cyan">{step.number}</span><Icon className="size-5 text-emerald-strong" aria-hidden /></div>
    <h3 className="relative mt-6 text-xl font-semibold">{step.title}</h3>
    <p className="relative mt-2 text-sm leading-6 text-muted">{step.description}</p>
  </motion.li>;
}

export function OperatingSequence() {
  return <div data-testid="operating-sequence" className="sequence-shell relative">
    <div className="sequence-line" aria-hidden><span /></div>
    <ol className="relative grid gap-3 md:grid-cols-4 md:gap-4">{steps.map((step, index) => <SequenceCard key={step.number} step={step} index={index} />)}</ol>
  </div>;
}
