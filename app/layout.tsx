import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { MetaPixel } from "@/components/meta-pixel";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://royalvivahgardens.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Royal Vivah Gardens | Luxury Wedding Garden and Event Booking",
    template: "%s | Royal Vivah Gardens"
  },
  description:
    "Book luxury wedding venues, gardens, services, vendors, packages and event planning in Jaipur and Rajasthan with instant quotes and WhatsApp booking.",
  applicationName: "Royal Vivah Gardens",
  keywords: [
    "Wedding Garden in Jaipur",
    "Best Marriage Garden",
    "Luxury Wedding Venue Rajasthan",
    "Affordable Wedding Venue",
    "Destination Wedding Jaipur"
  ],
  openGraph: {
    title: "Royal Vivah Gardens",
    description: "Cinematic luxury Indian wedding venue booking with packages, vendors and planning.",
    url: siteUrl,
    siteName: "Royal Vivah Gardens",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Luxury Indian wedding garden" }],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Vivah Gardens",
    description: "Book your dream wedding venue with instant quotes and WhatsApp support."
  },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#5b1020",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <PwaRegister />
        <MetaPixel />
        {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
      </body>
    </html>
  );
}

