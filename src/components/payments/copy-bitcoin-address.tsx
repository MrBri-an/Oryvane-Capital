"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function CopyBitcoinAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(address); setCopied(true); toast.success("Bitcoin address copied."); window.setTimeout(() => setCopied(false), 2000); }
    catch { toast.error("The address could not be copied. Select and copy it manually."); }
  }
  return <Button type="button" variant="secondary" size="sm" onClick={copy}>{copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}{copied ? "Copied" : "Copy address"}</Button>;
}
