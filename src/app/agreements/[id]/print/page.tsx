import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { agreementFor } from "@/lib/queries/agreements";
import { agreementClauses } from "@/lib/agreement-text";
import { rentRulesFor } from "@/lib/rent-rules";
import { PrintButton } from "@/app/property/[slug]/board/print-button";

export const metadata: Metadata = { title: "Print agreement", robots: { index: false } };

export default function Page({ params }: PageProps<"/agreements/[id]/print">) {
  return <Suspense fallback={null}><Doc params={params} /></Suspense>;
}

async function Doc({ params }: Pick<PageProps<"/agreements/[id]/print">, "params">) {
  await connection();
  const id = Number((await params).id);
  const user = await requireUser(`/agreements/${id}/print`);
  const a = await agreementFor(id, user.id);
  if (!a) notFound();
  const t = a.terms;
  const rules = rentRulesFor(a.state);
  return (
    <main className="mx-auto max-w-[800px] px-6 py-8 font-serif text-[15px] leading-relaxed text-black print:p-0">
      <div className="mb-6 flex justify-end print:hidden"><PrintButton /></div>
      <p className="text-center text-xs uppercase tracking-widest text-muted print:text-black">To be printed on e-stamp paper of the value applicable in {a.state}</p>
      <h1 className="mt-4 text-center text-2xl font-bold uppercase">{rules.agreementName}</h1>
      <p className="mt-6">This agreement is made on ____ / ____ / ______ at {a.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}, between:</p>
      <p className="mt-3"><b>{t.landlordName}</b>{t.landlordAddress ? `, residing at ${t.landlordAddress}` : ""}, hereinafter the <b>Licensor</b> (owner); and</p>
      <p className="mt-2"><b>{t.tenantName}</b>{t.tenantAddress ? `, permanently residing at ${t.tenantAddress}` : ""}, hereinafter the <b>Licensee</b> (tenant).</p>
      <ol className="mt-5 list-decimal space-y-3 pl-6">
        {agreementClauses(t, a.state).map((c, i) => <li key={i}><b>{c.title}.</b> {c.body}</li>)}
      </ol>
      <p className="mt-6">Both parties have read and understood this agreement and sign it of their free will.</p>
      <div className="mt-14 grid grid-cols-2 gap-10">
        <div><div className="border-t border-black pt-1">Licensor (owner): {t.landlordName}</div></div>
        <div><div className="border-t border-black pt-1">Licensee (tenant): {t.tenantName}</div></div>
        <div><div className="border-t border-black pt-1">Witness 1: name & address</div></div>
        <div><div className="border-t border-black pt-1">Witness 2: name & address</div></div>
      </div>
      <p className="mt-10 text-xs text-gray-500">Prepared on Nakshly (agreement #{a.id}). Terms accepted online by {a.landlord_accepted_at ? "the owner" : ""}{a.landlord_accepted_at && a.tenant_accepted_at ? " and " : ""}{a.tenant_accepted_at ? "the tenant" : ""}.</p>
    </main>
  );
}
