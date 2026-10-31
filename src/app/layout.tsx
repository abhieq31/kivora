import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Kivora — Homes for sale and rent across India", template: "%s | Kivora" },
  description: "Search homes for sale and rent on a map, see price history and the Kivora Estimate, compare agents' fees and calculate EMI and stamp duty.",
  openGraph: { siteName: "Kivora", type: "website", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#3b3fd8" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
