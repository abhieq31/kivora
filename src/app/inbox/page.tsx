import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { threads } from "@/lib/queries/user";
import { fmtDate, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-paper" />}><List /></Suspense>
    </div>
  );
}

async function List() {
  await connection();
  const u = await requireUser("/inbox");
  const ts = await threads(u.id);
  if (!ts.length) return <p className="mt-6 text-muted">No conversations yet. Contact an owner or agent, or request a tour, and the thread appears here.</p>;
  return (
    <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
      {ts.map((t) => (
        <li key={t.id}>
          <Link href={`/inbox/${t.id}`} className="flex gap-4 p-4 hover:bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {t.photo ? <img src={t.photo} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" /> : <div className="h-14 w-20 shrink-0 rounded-lg bg-paper" />}
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <p className="truncate font-semibold">{t.subject}</p>
                <span className="shrink-0 text-xs text-muted">{timeAgo(t.last_at)}</span>
              </div>
              <p className="text-xs text-muted">
                {t.from_user_id === u.id ? "You enquired" : `From ${t.name}`} · {t.kind === "tour" ? `Tour ${t.tour_date ? fmtDate(t.tour_date) : ""}` : t.kind === "callback" ? "Callback" : "Message"}
              </p>
              <p className="truncate text-sm text-muted">{t.last_body}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
