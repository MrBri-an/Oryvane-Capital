"use client";

import { Bitcoin, Building2, CircleOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { CopyBitcoinAddress } from "@/components/payments/copy-bitcoin-address";
import { PaymentForm } from "@/components/payments/payment-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { PaymentConfiguration } from "@/config/payments";

function Unavailable({ method }: { method: string }) { return <EmptyState icon={CircleOff} title={`${method} unavailable`} description="This payment method has not been configured. No payment details are available." />; }

export function PaymentMethods({ configuration, canSubmit }: { configuration: PaymentConfiguration; canSubmit: boolean }) {
  const blocked = <EmptyState icon={CircleOff} title="Payment submissions unavailable" description="Only active, verified accounts can submit payments. You may still review your deposit history below." />;
  const bank = !configuration.bank ? <Unavailable method="Bank transfer" /> : !canSubmit ? blocked : <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]"><Card className="h-fit"><CardHeader><Building2 aria-hidden className="size-5 text-gold" /><CardTitle className="mt-4">Transfer instructions</CardTitle><CardDescription>Complete the transfer externally, then submit the matching details and receipt.</CardDescription></CardHeader><dl className="grid gap-4 text-sm">{[["Bank", configuration.bank.bankName], ["Account name", configuration.bank.accountName], ["Account number", configuration.bank.accountNumber], ["Currency", configuration.bank.currency]].map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wider text-muted">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}</dl></Card><Card><CardHeader><CardTitle>Bank payment details</CardTitle><CardDescription>A receipt is required before the payment can enter review.</CardDescription></CardHeader><PaymentForm method="bank_transfer" currency={configuration.bank.currency} /></Card></div>;
  const bitcoin = !configuration.bitcoin ? <Unavailable method="Bitcoin" /> : !canSubmit ? blocked : <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]"><Card className="h-fit"><CardHeader><Bitcoin aria-hidden className="size-5 text-gold" /><CardTitle className="mt-4">Bitcoin destination</CardTitle><CardDescription>Verify the network and full address before sending.</CardDescription></CardHeader><div className="grid justify-items-center gap-5"><div className="rounded-lg bg-white p-3"><QRCodeSVG value={`bitcoin:${configuration.bitcoin.address}`} size={176} level="M" title="Bitcoin payment address QR code" /></div><div className="w-full"><p className="text-xs uppercase tracking-wider text-muted">Network</p><p className="mt-1 font-medium">{configuration.bitcoin.network}</p><p className="mt-4 text-xs uppercase tracking-wider text-muted">Address</p><code className="mt-1 block break-all text-sm text-foreground">{configuration.bitcoin.address}</code><div className="mt-4"><CopyBitcoinAddress address={configuration.bitcoin.address} /></div></div></div></Card><Card><CardHeader><CardTitle>Bitcoin payment details</CardTitle><CardDescription>The transaction hash is required. A receipt is optional.</CardDescription></CardHeader><PaymentForm method="bitcoin" currency="BTC" /></Card></div>;
  return <Tabs label="Payment methods" items={[{ id: "bank", label: "Bank transfer", content: bank }, { id: "bitcoin", label: "Bitcoin", content: bitcoin }]} />;
}
