import { PublicSmoothScroll } from "@/components/motion/public-smooth-scroll";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
export default function PublicLayout({ children }: { children: React.ReactNode }) { return <PublicSmoothScroll><SiteHeader />{children}<SiteFooter /></PublicSmoothScroll>; }
