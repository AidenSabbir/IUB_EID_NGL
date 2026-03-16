import type { Metadata } from "next";
import { Cairo, Amiri, Aref_Ruqaa } from "next/font/google";
import { EidDecorations } from "@/components/eid-decorations";
import { DecorativeLights } from "@/components/decorative-lights";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: `${process.env.NEXT_PUBLIC_APP_NAME} 🌙`,
  description: "Send heartfelt Eid wishes to your loved ones",
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_APP_NAME} 🌙`,
    description: "Send heartfelt Eid wishes to your loved ones",
    url: defaultUrl,
    type: "website",
  },
};

const cairo = Cairo({
  variable: "--font-cairo",
  display: "swap",
  subsets: ["latin"],
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-amiri",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${cairo.variable} ${amiri.variable} ${arefRuqaa.variable} antialiased font-sans flex flex-col min-h-dvh`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none bg-transparent">
          <EidDecorations />
          <DecorativeLights />
        </div>
        <div className="relative z-10 flex flex-col flex-1 h-full">
          <TopNav />
          <div className="flex-1 pb-24 md:pb-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
