"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function Modal({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <AnimatePresence>{open && <motion.dialog ref={dialogRef} aria-labelledby="modal-title" aria-describedby={description ? "modal-description" : undefined} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-visible rounded-xl border border-border bg-surface-raised p-0 text-foreground shadow-lg backdrop:bg-black/70"><motion.div initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.99 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 id="modal-title" className="text-xl font-semibold">{title}</h2>{description && <p id="modal-description" className="mt-1 text-sm text-muted">{description}</p>}</div><Button aria-label="Close dialog" onClick={onClose} size="icon" variant="ghost"><X aria-hidden className="size-5" /></Button></div><div className="mt-6">{children}</div></motion.div></motion.dialog>}</AnimatePresence>;
}
