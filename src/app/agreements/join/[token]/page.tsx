import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { joinAgreement } from "@/lib/actions/agreements";
import { inr } from "@/lib/format";
import type { AgreementTerms } from "@/lib/agreement-text";
import Link from "next/link";

export const metadata: Metadata = { title: "Review a rent agreement", robots: { index: false } };

export default function Page({ params }: PageProps<"/agreements/join/[token]">) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Suspense fallback={<div className="card h-64 animate-pulse" />}><Body params={params} /></Suspense>
    </main>
  );
}

async function Body({ params }: Pick<PageProps<"/agreements/join/[token]">, "params">) {
  await connection();
  const { token } = await params;
  const q = await db();
  const [a] = await q<{ terms: AgreementTerms; landlord_id: number | null; tenant_id: number | null }>("select terms, landlord_id, tenant_id from agreements where token = $1", [token]);
  if (!a) return <p className="text-muted">This link isn&apos;t valid any more. Ask for a new one.</p>;
  const user = await getUser();
  const role = a.landlord_id == null ? "owner" : "tenant";
  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold">You&apos;ve been sent a rent agreement</h1>
      <p className="mt-2 text-muted">{a.terms.propertyDescription} · {inr(a.terms.rent)}/month · deposit {inr(a.terms.deposit)}</p>
      <p className="mt-1 text-muted">Between {a.terms.landlordName} (owner) and {a.terms.tenantName} (tenant).</p>
      {user ? (
        <form action={joinAgreement.bind(null, token)} className="mt-6">
          <button className="btn w-full">Open as the {role}</button>
        </form>
      ) : (
        <div className="mt-6 flex gap-2">
          <Link href={`/signup?next=/agreements/join/${token}`} className="btn flex-1">Create free account</Link>
          <Link href={`/login?next=/agreements/join/${token}`} className="btn-outline flex-1">Sign in</Link>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Free for both of you. You&apos;ll see the full terms before you accept anything.</p>
    </div>
  );
}
