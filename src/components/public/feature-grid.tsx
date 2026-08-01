import type { LucideIcon } from "lucide-react";
import { CardEntrance } from "@/components/motion/motion-system";
import { Card } from "@/components/ui/card";
export function FeatureGrid({ items }: { items: readonly { icon: LucideIcon; title: string; description: string }[] }) { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(({ icon: Icon, title, description }) => <CardEntrance key={title}><Card className="h-full"><span className="grid size-10 place-items-center rounded-lg bg-emerald/10 text-emerald-strong"><Icon aria-hidden className="size-5" /></span><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{description}</p></Card></CardEntrance>)}</div>; }
