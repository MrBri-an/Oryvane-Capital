import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
export function AccountFigure({ label, value, detail, icon }: { label: string; value: ReactNode; detail?: ReactNode; icon?: ReactNode }) { return <Card className="min-w-0"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-muted">{label}</p>{icon && <span className="text-gold" aria-hidden>{icon}</span>}</div><div className="mt-3 truncate text-2xl font-semibold sm:text-3xl">{value}</div>{detail && <div className="mt-2 text-sm text-muted">{detail}</div>}</Card>; }
