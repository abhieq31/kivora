import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { randomBytes } from "node:crypto";
import { Gift } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Footer } from "@/components/footer";
import { InviteShare } from "./share";

export const metadata: Metadata = { title: "Invite friends", robots: { index: false } };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Gift className="h-10 w-10 text-accent" />
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Know someone paying a broker?</h1>
        <p className="mt-3 text-lg text-muted">
          Send them your link. Owners list free and keep the month&apos;s rent a broker would take. Tenants and buyers talk to owners directly.
        </p>
        <Suspense fallback={<div className="card mt-8 h-48 animate-pulse" />}><Body /></Suspense>
        <div className="mt-10 rounded-xl bg-paper p-5 text-sm">
          <p className="font-semibold">Your reward</p>
          <p className="mt-1 text-muted">When two people you invite post a home on Nakshly, your next rent agreement or tenant verification is free. We&apos;ll call you to set it up.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function Body() {
  await connection();
  const user = await requireUser("/invite");
  const q = await db();
  let [row] = await q<{ ref_code: string | null }>("select ref_code from users where id = $1", [user.id]);
  if (!row.ref_code) {
    [row] = await q<{ ref_code: string }>("update users set ref_code = $2 where id = $1 returning ref_code", [user.id, randomBytes(5).toString("hex").slice(0, 8)]);
  }
  const [stats] = await q<{ joined: number; listed: number }>(
    `select count(*)::int as joined,
       count(*) filter (where exists (select 1 from properties p where p.owner_id = u.id))::int as listed
     from users u where u.referred_by = $1`, [user.id]);
  const link = `${SITE}/?ref=${row.ref_code}`;
  return (
    <div className="card mt-8 p-6">
      <p className="label">Your invite link</p>
      <InviteShare link={link} />
      <div className="mt-6 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-paper p-4"><p className="text-3xl font-bold">{stats.joined}</p><p className="text-sm text-muted">joined</p></div>
        <div className="rounded-lg bg-paper p-4"><p className="text-3xl font-bold">{stats.listed}</p><p className="text-sm text-muted">posted a home</p></div>
      </div>
    </div>
  );
}
