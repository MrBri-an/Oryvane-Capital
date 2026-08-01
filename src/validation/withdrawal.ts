import { z } from "zod";
const base={amount:z.string().regex(/^\d+(?:\.\d{1,18})?$/,"Enter a valid amount.").refine(v=>Number(v)>0,"Amount must be positive."),currency:z.string().regex(/^[A-Z0-9]{3,10}$/),userNote:z.string().trim().max(1000).optional()};
export const withdrawalSchema=z.discriminatedUnion("method",[
 z.object({method:z.literal("bank_transfer"),...base,accountName:z.string().trim().min(2).max(120),bankName:z.string().trim().min(2).max(120),accountNumber:z.string().trim().regex(/^[A-Za-z0-9 -]{4,40}$/),bitcoinAddress:z.string().optional(),bitcoinNetwork:z.string().optional()}),
 z.object({method:z.literal("bitcoin"),...base,bitcoinAddress:z.string().trim().min(14).max(120),bitcoinNetwork:z.string().trim().min(2).max(40),accountName:z.string().optional(),bankName:z.string().optional(),accountNumber:z.string().optional()})
]);
export type WithdrawalInput=z.infer<typeof withdrawalSchema>;
