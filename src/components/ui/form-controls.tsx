import { Check, ChevronDown } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const controlClass = "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground shadow-sm transition-colors placeholder:text-muted/70 hover:border-border-strong focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/25 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(controlClass, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(controlClass, "min-h-28 resize-y py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <span className="relative block"><select ref={ref} className={cn(controlClass, "appearance-none pr-10", className)} {...props}>{children}</select><ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /></span>;
});

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string };
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ className, label, id, ...props }, ref) {
  const generatedId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor={generatedId}><span className="relative grid size-5 shrink-0 place-items-center"><input ref={ref} id={generatedId} type="checkbox" className={cn("peer size-5 appearance-none rounded-xs border border-border-strong bg-surface checked:border-emerald checked:bg-emerald focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-strong", className)} {...props} /><Check aria-hidden className="pointer-events-none absolute size-3.5 text-[#06120c] opacity-0 peer-checked:opacity-100" /></span>{label}</label>;
});

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><label className="text-sm font-medium" htmlFor={htmlFor}>{label}</label>{children}{error ? <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">{error}</p> : hint ? <p id={`${htmlFor}-hint`} className="text-sm text-muted">{hint}</p> : null}</div>;
}
