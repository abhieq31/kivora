import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { thread } from "@/lib/queries/user";
import { fmtDate } from "@/lib/format";
import { Reply } from "./reply";

export const metadata: Metadata = { title: "Conversation" };

export default function Page({ params }: PageProps<"/inbox/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/inbox" className="text-sm text-muted hover:underline">← Inbox</Link>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-paper" />}><Body params={params} /></Suspense>
    </div>
  );
}

async function Body({ params }: { params: PageProps<"/inbox/[id]">["params"] }) {
  await connection();
  const id = Number((await params).id);
  const u = await requireUser(`/inbox/${id}`);
  const t = Number.isInteger(id) ? await thread(u.id, id) : null;
  if (!t) notFound();
  const iSent = t.thread.from_user_id === u.id;
  return (
    <>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.thread.subject}</h1>
          <p className="text-sm text-muted">
            {t.thread.kind === "tour" ? `Tour request for ${t.thread.tour_date ? fmtDate(t.thread.tour_date) : "—"} (${t.thread.tour_mode === "video" ? "video call" : "in person"})` : "Enquiry"} ·
            {iSent ? " you contacted the lister" : ` from ${t.thread.name}, ${t.thread.phone}${t.thread.email ? `, ${t.thread.email}` : ""}`}
          </p>
        </div>
        {t.thread.property_id && <Link href={`/property/${t.thread.property_id}`} className="btn-ghost">View home</Link>}
        {t.thread.project_id && <Link href={`/new-projects/${t.thread.project_id}`} className="btn-ghost">View project</Link>}
      </div>
      <ol className="mt-6 space-y-3">
        {t.messages.map((m) => {
          const mine = m.sender_id === u.id;
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-brand text-white" : "bg-paper"}`}>
                <p className={`mb-0.5 text-xs ${mine ? "text-white/70" : "text-muted"}`}>{mine ? "You" : m.sender_name} · {fmtDate(m.created_at)}</p>
                <p className="whitespace-pre-line">{m.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {t.thread.to_user_id || iSent ? <Reply inquiryId={t.thread.id} /> : null}
      {!t.thread.to_user_id && iSent && <p className="mt-3 text-xs text-muted">This lister hasn&apos;t joined Nakshly yet, so they&apos;ll reach you by phone.</p>}
    </>
  );
}
