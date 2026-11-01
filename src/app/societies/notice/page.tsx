import type { Metadata } from "next";
import QRCode from "qrcode";
import { LogoMark } from "@/components/logo";
import { PrintButton } from "@/app/property/[slug]/board/print-button";

export const metadata: Metadata = { title: "Society notice", robots: { index: false } };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function Page() {
  const link = `${SITE}/list-free?utm_source=society-notice`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 0, color: { dark: "#14163a", light: "#ffffff" } });
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 print:p-0">
      <div className="mb-4 flex justify-end print:hidden"><PrintButton /></div>
      <div className="flex aspect-[210/297] flex-col items-center justify-center gap-6 rounded-xl border-4 border-ink bg-white p-10 text-center print:rounded-none">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">Notice to all members</p>
        <h1 className="text-5xl font-black leading-tight">Renting out or selling your flat?</h1>
        <p className="text-2xl font-semibold text-brand">List it free. No brokerage.</p>
        <ul className="space-y-2 text-xl">
          <li>✓ Tenants and buyers contact you directly</li>
          <li>✓ Fair rent agreement in minutes</li>
          <li>✓ Police tenant registration done properly</li>
        </ul>
        <div className="w-56" dangerouslySetInnerHTML={{ __html: qr }} />
        <p className="text-lg">Scan to list your flat</p>
        <div className="mt-4 flex items-center gap-2"><LogoMark className="h-8 w-8" /><span className="text-2xl font-extrabold">nakshly</span></div>
      </div>
    </main>
  );
}
