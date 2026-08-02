import type { Metadata } from "next";

import { DesignSystemPreview } from "@/components/design-system/design-system-preview";
import { getMarketSnapshot } from "@/server/market-data";

export const metadata: Metadata = { title: "Design system preview", robots: { index: false, follow: false } };

export default async function DesignSystemPage() {
  const market = await getMarketSnapshot();
  return <DesignSystemPreview market={market} />;
}
