import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RECEIPT_SCANNER_URL: z.url().optional(),
  RECEIPT_SCANNER_API_KEY: z.string().min(16).optional(),
  INITIAL_SUPER_ADMIN_EMAIL: z.email().optional(),
  ADMIN_SETUP_TOKEN: z.string().min(32).optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Invalid server environment: ${z.prettifyError(result.error)}`);
  }

  return result.data;
}
