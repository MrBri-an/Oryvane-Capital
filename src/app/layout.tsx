import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Manrope } from "next/font/google";
import { CosmicMarketBackground } from "@/components/motion/cosmic-market-background";

import { ToastViewport } from "@/components/ui/toast";

import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: {
    default: "Oryvane Capital",
    template: "%s | Oryvane Capital",
  },
  description: "Oryvane Capital investment platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${manrope.variable} ${plexMono.variable}`}>
        <CosmicMarketBackground />
        <div className="app-world">{children}</div>
        <ToastViewport />
      </body>
    </html>
  );
}
