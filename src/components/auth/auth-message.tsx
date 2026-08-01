import { Alert } from "@/components/ui/alert";
export function AuthMessage({ error, success }: { error?: string; success?: string }) { if (error) return <Alert className="mb-5" tone="danger" title="Unable to continue">{error}</Alert>; if (success) return <Alert className="mb-5" tone="success" title="Request received">{success}</Alert>; return null; }
