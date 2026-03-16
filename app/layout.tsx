import type { Metadata } from "next";
import { Cairo, Amiri, Aref_Ruqaa, Space_Grotesk } from "next/font/google";
import { EidDecorations } from "@/components/eid-decorations";
import { DecorativeLights } from "@/components/decorative-lights";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: `Chand Postal || IUBPC`,
  description: "Send heartfelt Eid wishes to your loved ones",
  icons: {
    icon: "/transparent_logo.png",
    apple: "/transparent_logo.png",
  },
  openGraph: {
    title: `Chand Postal || IUBPC`,
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
        className={`${cairo.variable} ${amiri.variable} ${arefRuqaa.variable} ${spaceGrotesk.variable} antialiased font-sans flex flex-col min-h-dvh`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none bg-transparent">
          <EidDecorations />
          <DecorativeLights />
        </div>
        <div className="relative z-10 flex flex-col flex-1 h-full">
          <TopNav />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
