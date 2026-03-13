import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { EidDecorations } from "@/components/eid-decorations";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Eid Moon 🌙",
  description: "Send heartfelt Eid wishes to your loved ones",
  openGraph: {
    title: "Eid Moon 🌙",
    description: "Send heartfelt Eid wishes to your loved ones",
    url: defaultUrl,
    type: "website",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${geistSans.className} ${playfair.variable} antialiased font-sans`}>
        <EidDecorations />
        {children}
      </body>
    </html>
  );
}
