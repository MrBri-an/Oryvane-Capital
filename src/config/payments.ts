import "server-only";

import { z } from "zod";

const bankSchema = z.object({
  bankName: z.string().trim().min(2).max(120),
  accountName: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().min(4).max(40),
  currency: z.string().trim().regex(/^[A-Z0-9]{3,10}$/),
});
const bitcoinSchema = z.object({
  address: z.string().trim().regex(/^[A-Za-z0-9]{14,90}$/),
  network: z.string().trim().min(2).max(80),
});

export type PaymentConfiguration = {
  bank: z.infer<typeof bankSchema> | null;
  bitcoin: z.infer<typeof bitcoinSchema> | null;
};

export function getPaymentConfiguration(): PaymentConfiguration {
  const bank = bankSchema.safeParse({ bankName: process.env.PAYMENT_BANK_NAME, accountName: process.env.PAYMENT_BANK_ACCOUNT_NAME, accountNumber: process.env.PAYMENT_BANK_ACCOUNT_NUMBER, currency: process.env.PAYMENT_BANK_CURRENCY });
  const bitcoin = bitcoinSchema.safeParse({ address: process.env.PAYMENT_BITCOIN_ADDRESS, network: process.env.PAYMENT_BITCOIN_NETWORK });
  return { bank: bank.success ? bank.data : null, bitcoin: bitcoin.success ? bitcoin.data : null };
}
