import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Cairo, Amiri, Aref_Ruqaa, Space_Grotesk, Press_Start_2P } from "next/font/google";
import { EidDecorations } from "@/components/eid-decorations";
import { DecorativeLights } from "@/components/decorative-lights";
import { TopNav } from "@/components/top-nav";
import "./globals.css";
import Script from "next/script";
const defaultUrl =
  process.env.NODE_ENV === "production"
    ? "https://chandpostal.vercel.app"
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  verification: {
    google: "E-DaXcraPREvpHr7O2ol8wCjoiNaXGEdN7aW9mMQhT4",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [
    { name: 'Md Rashedul Islam Sabbir', url: 'https://risabbir.me/' },
    { name: 'Zaid Fahad', url: 'https://zaidfahad.com/' },
    { name: 'IUB Programming Club', url: 'https://iubpc.vercel.app/' },
  ],
  title: "Chand Postal | IUB Programming Club",
  description:
    "Chand Postal is an Eid greeting platform by IUB Programming Club where you can send digital Eid cards to your loved ones that open on Chand Raat.",
  alternates: {
    canonical: defaultUrl,
  },
  icons: {
    icon: "/chand_icon.png",
    apple: "/chand_icon.png",
  },
  openGraph: {
    title: "Chand Postal | IUB Programming Club",
    description:
      "Send digital Eid cards to your friends and family and let them open your wishes on Chand Raat.",
    url: defaultUrl,
    type: "website",
    siteName: "Chand Postal",
    images: [
      {
        url: "/metadata.png",
        width: 1200,
        height: 630,
        alt: "Chand Postal Eid Card",
      },
    ],
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

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <meta name="google-site-verification" content="E-DaXcraPREvpHr7O2ol8wCjoiNaXGEdN7aW9mMQhT4" />
      <body
        className={`${cairo.variable} ${amiri.variable} ${arefRuqaa.variable} ${spaceGrotesk.variable} ${pressStart2P.variable} antialiased font-sans flex flex-col min-h-dvh`}
      >
        {/* Analytics Scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QXJ6GZJQKF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QXJ6GZJQKF');
          `}
        </Script>
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
        <Analytics />
      </body>
    </html>
  );
}
