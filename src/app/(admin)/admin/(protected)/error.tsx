"use client";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
export default function AdminError({ reset }: { error: Error; reset: () => void }) { return <EmptyState icon={CircleAlert} title="Admin data could not be loaded" description="No records were changed. Verify your session and try again." action={<Button type="button" variant="secondary" onClick={reset}>Try again</Button>} />; }
