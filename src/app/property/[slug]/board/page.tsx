import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import QRCode from "qrcode";
import { getProperty } from "@/lib/queries/properties";
import { CITY_BY_SLUG } from "@/lib/geo";
import { FURNISHING_LABEL, PROPERTY_TYPES } from "@/lib/types";
import { listingPrice } from "@/lib/format";
import { LogoMark } from "@/components/logo";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Print your board", robots: { index: false } };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function Page({ params }: PageProps<"/property/[slug]/board">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[800px] max-w-2xl animate-pulse bg-paper" />}>
      <Board params={params} />
    </Suspense>
  );
}

async function Board({ params }: Pick<PageProps<"/property/[slug]/board">, "params">) {
  await connection();
  const id = Number((await params).slug.split("-")[0]);
  const p = Number.isInteger(id) ? await getProperty(id) : null;
  if (!p) notFound();
  const sale = p.listing_type === "sale";
  // Short link keeps the QR code sparse enough to scan from across a gate.
  const link = `${SITE}/p/${p.id}?utm_source=board`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#14163a", light: "#ffffff" } });
  const short = `${SITE.replace(/^https?:\/\//, "")}/p/${p.id}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">A4, portrait. Laminate it or slip it into a plastic sleeve before putting it on your gate.</p>
        <PrintButton />
      </div>
      <div className="flex aspect-[210/297] flex-col overflow-hidden rounded-xl border-4 border-ink bg-white print:rounded-none print:border-8">
        <div className={`${sale ? "bg-brand" : "bg-accent"} px-8 py-6 text-center text-white`}>
          <p className="text-[64px] font-black leading-none tracking-tight sm:text-[88px]">{sale ? "FOR SALE" : "TO-LET"}</p>
          <p className="mt-2 text-xl font-semibold">{p.posted_by === "owner" ? "Direct from owner · No brokerage" : "Details, photos & price history on Nakshly"}</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <p className="text-4xl font-extrabold">
            {p.bhk ? `${p.bhk} BHK ` : ""}{PROPERTY_TYPES[p.property_type]}
          </p>
          <p className="text-2xl text-muted">
            {p.carpet_sqft.toLocaleString("en-IN")} sq ft carpet{!sale ? ` · ${FURNISHING_LABEL[p.furnishing] ?? ""}` : ""}
          </p>
          <p className="text-5xl font-black">{listingPrice(p.price, p.listing_type)}</p>
          <div className="w-56 sm:w-64" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="text-lg font-semibold">Scan for photos, price history and to message the owner</p>
          <p className="font-mono text-lg">{short}</p>
        </div>
        <div className="flex items-center justify-center gap-2 border-t-2 border-ink py-4">
          <LogoMark className="h-8 w-8" />
          <p className="text-2xl font-extrabold">nakshly</p>
          <p className="text-lg text-muted">· {p.locality}, {CITY_BY_SLUG[p.city]?.name ?? p.city}</p>
        </div>
      </div>
    </main>
  );
}
