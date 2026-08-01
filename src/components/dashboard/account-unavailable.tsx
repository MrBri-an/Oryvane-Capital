import { CircleOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { logoutAction } from "@/server/auth/actions";

export function AccountUnavailable({ status }: { status: string }) {
  const missing = status === "profile_unavailable";
  return <main className="grid min-h-screen place-items-center px-4 py-12"><Card className="w-full max-w-xl text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-danger/10 text-danger"><CircleOff aria-hidden className="size-6" /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Account access</p><h1 className="mt-3 text-3xl font-semibold">Dashboard unavailable</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">{missing ? "Your protected profile could not be loaded. Please contact support before continuing." : `This account is ${status}. Normal dashboard access is unavailable. Please contact support if you believe this is an error.`}</p><form action={logoutAction} className="mt-7"><Button type="submit" variant="secondary">Log out securely</Button></form></Card></main>;
}
