import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { AgentCard as A } from "@/lib/queries/agents";
import { CITY_BY_SLUG } from "@/lib/geo";

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`${size} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-line"}`} />)}
    </span>
  );
}

export function AgentCard({ a }: { a: A }) {
  return (
    <Link href={`/agents/${a.id}`} className="card flex gap-4 p-5 transition hover:border-brand hover:shadow-md">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-bold text-white">{a.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 font-semibold">{a.name}{a.verified && <BadgeCheck className="h-4 w-4 text-good" aria-label="RERA verified" />}{a.is_demo && <span className="ml-1 rounded bg-slate-100 px-1.5 text-[10px] font-medium text-slate-600">Demo</span>}</p>
        <p className="truncate text-sm text-muted">{a.agency} · {CITY_BY_SLUG[a.city]?.name}</p>
        <p className="mt-1 flex items-center gap-1 text-sm">
          {a.rating ? <><Stars value={a.rating} /> <b>{a.rating}</b> <span className="text-muted">({a.reviews})</span></> : <span className="text-muted">No reviews yet</span>}
        </p>
        <p className="mt-2 text-sm"><span className="text-muted">Fee:</span> <b>{a.sale_fee}</b> · rentals <b>{a.rent_fee}</b></p>
        <p className="mt-1 truncate text-xs text-muted">{a.deals_closed} deals · {a.experience_years} yrs · {a.localities.join(", ")}</p>
      </div>
    </Link>
  );
}
