import { z } from "zod";

export const investmentRequestSchema = z.object({
  planId: z.string().uuid(),
  currency: z.string().regex(/^[A-Z0-9]{3,10}$/),
  amount: z.string().trim().regex(/^\d+(?:\.\d{1,18})?$/, "Enter a valid amount with up to 18 decimal places.").refine((value) => /[1-9]/.test(value), "Amount must be greater than zero."),
});
export type InvestmentRequestValues = z.infer<typeof investmentRequestSchema>;
