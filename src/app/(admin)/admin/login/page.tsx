import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function AdminLoginPage() {
  return <RoutePlaceholder eyebrow="Admin portal" title="Administrator access unavailable" description="The database foundation now requires approved active admin records, explicit permissions, and AAL2. The protected admin login flow is not implemented, and user authentication never grants admin access." />;
}
