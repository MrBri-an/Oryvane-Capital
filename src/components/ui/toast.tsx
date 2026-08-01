"use client";
import { Toaster, toast } from "sonner";
export { toast };
export function ToastViewport() { return <Toaster theme="dark" richColors closeButton position="top-right" toastOptions={{ classNames: { toast: "!border-border !bg-surface-raised !text-foreground", description: "!text-muted" } }} />; }
