import { z } from "zod";

import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

// PostgreSQL accepts canonical UUIDs whose version nibble is zero. The fixed
// role catalogue uses that form, so RFC-version validation would reject valid DB IDs.
const postgresUuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
const contextSchema = z.object({ admin_id: postgresUuid, user_id: postgresUuid, status: z.literal("active"), role_id: postgresUuid, role_name: z.string(), permissions: z.array(z.string()), aal: z.literal("aal2") });
export type AdminContext = z.infer<typeof contextSchema>;

export async function getAdminContextWithClient(supabase: SupabaseClient<Database>): Promise<AdminContext | null> {
  const { data, error } = await supabase.rpc("get_current_admin_context");
  if (error) return null;
  const parsed = contextSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
