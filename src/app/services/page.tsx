import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SERVICES } from "@/lib/services";
import { inr } from "@/lib/format";
import { CITIES } from "@/lib/geo";
import { ServiceForm } from "./form";

export const metadata: Metadata = {
  title: "Rent agreement, title check & home services — fixed fees",
  description: "Rent agreement for ₹499, lawyer's title check for ₹2,999, tenant verification, sale deed registration and free home loan comparison. No brokerage, fixed published fees.",
};

const GROUPS: [string, (typeof SERVICES)[number]["audience"][]][] = [
  ["For renters & owners", ["renters", "owners"]],
  ["For buyers", ["buyers"]],
  ["For agents & builders", ["pros"]],
];

export default function Page({ searchParams }: PageProps<"/services">) {
  return (
    <>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Fixed fees. No brokerage.</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            Searching, listing and talking to owners on Nakshly is free. When you need paperwork or a lawyer, pay a published fee — and only after the work is done.
          </p>
          {GROUPS.map(([label, aud]) => (
            <section key={label} className="mt-10">
              <h2 className="h-section">{label}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {SERVICES.filter((s) => aud.includes(s.audience)).map((s) => (
                  <div key={s.id} id={s.id} className="card scroll-mt-24 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-lg font-bold">{s.name}</p>
                      <p className="shrink-0 font-bold text-brand">{s.price == null ? "Free" : inr(s.price)}{s.unit && <span className="text-xs font-normal text-muted"> / {s.unit}</span>}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted">{s.pitch}</p>
                    <ul className="mt-3 space-y-1 text-sm">
                      {s.includes.map((i) => <li key={i} className="flex gap-2"><span className="text-good">✓</span>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Suspense fallback={<div className="card h-96 animate-pulse" />}>
            <FormWithDefault searchParams={searchParams} />
          </Suspense>
        </aside>
      </main>
      <Footer />
    </>
  );
}

async function FormWithDefault({ searchParams }: Pick<PageProps<"/services">, "searchParams">) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return (
    <ServiceForm
      initial={pick("for") || "rent-agreement"}
      propertyId={pick("property")}
      services={SERVICES.map((s) => ({ id: s.id, label: `${s.name} — ${s.price == null ? "Free" : inr(s.price)}` }))}
      cities={CITIES.map((c) => c.name)}
    />
  );
}
