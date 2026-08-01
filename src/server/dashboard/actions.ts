"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getDashboardIdentity } from "@/server/dashboard/data";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: optionalText(40),
  country: optionalText(80),
});
const notificationSchema = z.string().uuid();

export async function updateProfileAction(formData: FormData) {
  const identity = await getDashboardIdentity();
  if (!identity.profile || !identity.canUpdateProfile) redirect("/dashboard/settings?error=unavailable");
  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName"), phone: formData.get("phone"), country: formData.get("country") });
  if (!parsed.success) redirect("/dashboard/settings?error=validation");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.fullName, phone: parsed.data.phone, country: parsed.data.country }).eq("id", identity.user.id);
  if (error) redirect("/dashboard/settings?error=save");
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings?saved=1");
}

export async function markNotificationReadAction(formData: FormData) {
  const identity = await getDashboardIdentity();
  if (!identity.profile || identity.isDenied || identity.isRestricted) return;
  const parsed = notificationSchema.safeParse(formData.get("notificationId"));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", parsed.data).eq("user_id", identity.user.id).is("read_at", null);
  revalidatePath("/dashboard/notifications");
}
