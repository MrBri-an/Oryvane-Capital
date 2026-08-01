import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";

import { ToastViewport } from "@/components/ui/toast";

import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

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
      <body className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable}`}>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
