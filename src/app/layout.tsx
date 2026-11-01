import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { ServiceWorker } from "@/components/sw-register";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Nakshly — Homes for sale and rent across India", template: "%s | Nakshly" },
  description: "Every home in India on one map. Talk to owners directly with no brokerage, see price history and the Nakshly Estimate, and check land records like 7/12 and Khatauni.",
  openGraph: { siteName: "Nakshly", type: "website", locale: "en_IN" },
  appleWebApp: { capable: true, title: "Nakshly", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#3b3fd8" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <ServiceWorker />
      </body>
    </html>
  );
}
