"use client";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <EmptyState icon={CircleAlert} title="This section could not be loaded" description="Your data was not changed. Try loading this dashboard section again." action={<Button type="button" variant="secondary" onClick={reset}>Try again</Button>} />; }
