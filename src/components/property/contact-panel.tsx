"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Phone, ShieldCheck, Video } from "lucide-react";
import { sendInquiry } from "@/lib/actions/homes";
import { Notice, Submit } from "../form-bits";

type Who = { kind: "owner" | "agent" | "builder"; name: string; sub?: string; rating?: number | null; reviews?: number; verified?: boolean; agentId?: number };

export function ContactPanel({ propertyId, who, defaults, rental }: { propertyId: number; who: Who; defaults: { name: string; phone: string; email: string }; rental: boolean }) {
  const [tab, setTab] = useState<"tour" | "contact">("tour");
  const [state, action] = useActionState(sendInquiry, null);
  const days = useMemo(() => {
    const out: { iso: string; dow: string; day: string; mon: string }[] = [];
    const d = new Date();
    for (let i = 1; i <= 8; i++) {
      const x = new Date(d.getTime() + i * 86400000);
      out.push({
        iso: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`,
        dow: x.toLocaleDateString("en-IN", { weekday: "short" }),
        day: String(x.getDate()),
        mon: x.toLocaleDateString("en-IN", { month: "short" }),
      });
    }
    return out;
  }, []);
  const [date, setDate] = useState(days[0].iso);
  const [mode, setMode] = useState<"in_person" | "video">("in_person");

  if (state?.ok) {
    return (
      <div className="card p-5">
        <p className="text-lg font-bold">{state.message ?? "Sent"} ✓</p>
        <p className="mt-1 text-sm text-muted">
          {who.kind === "owner" ? "The owner" : who.name} will get back to you. We never share your number with anyone else.
        </p>
        {state.id && <Link href={`/inbox/${state.id}`} className="btn-outline mt-4 w-full">Open conversation</Link>}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-2 border-b border-line text-sm font-semibold">
        {(["tour", "contact"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-3 ${tab === t ? "border-b-2 border-brand text-brand" : "text-muted"}`}>
            {t === "tour" ? "Request a tour" : "Contact"}
          </button>
        ))}
      </div>
      <form action={action} className="space-y-3 p-4">
        <input type="hidden" name="kind" value={tab} />
        <input type="hidden" name="property_id" value={propertyId} />
        {who.agentId && <input type="hidden" name="agent_id" value={who.agentId} />}
        {tab === "tour" ? (
          <>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {days.map((d) => (
                <button type="button" key={d.iso} onClick={() => setDate(d.iso)} className={`w-16 shrink-0 rounded-lg border py-2 text-center ${date === d.iso ? "border-brand bg-brand-soft" : "border-line"}`}>
                  <span className="block text-xs text-muted">{d.dow}</span>
                  <span className="block text-lg font-bold">{d.day}</span>
                  <span className="block text-xs text-muted">{d.mon}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="tour_date" value={date} />
            <input type="hidden" name="tour_mode" value={mode} />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button type="button" onClick={() => setMode("in_person")} className={`flex items-center justify-center gap-2 rounded-lg border py-2 ${mode === "in_person" ? "border-brand bg-brand-soft" : "border-line"}`}>
                <CalendarDays className="h-4 w-4" /> In person
              </button>
              <button type="button" onClick={() => setMode("video")} className={`flex items-center justify-center gap-2 rounded-lg border py-2 ${mode === "video" ? "border-brand bg-brand-soft" : "border-line"}`}>
                <Video className="h-4 w-4" /> Video call
              </button>
            </div>
          </>
        ) : (
          <textarea name="message" rows={3} className="input" defaultValue={rental ? "Hi, is this home still available? I'd like to know more about the rent and deposit." : "Hi, I'm interested in this home. Is the price negotiable?"} />
        )}
        <input name="name" className="input" placeholder="Your name" defaultValue={defaults.name} required autoComplete="name" />
        <input name="phone" className="input" placeholder="Mobile number" defaultValue={defaults.phone} required inputMode="tel" autoComplete="tel" />
        <input name="email" className="input" placeholder="Email (optional)" defaultValue={defaults.email} type="email" autoComplete="email" />
        <Notice state={state} />
        <Submit className="btn w-full" pendingText="Sending…">{tab === "tour" ? "Request this time" : "Send message"}</Submit>
        <p className="flex items-start gap-1.5 text-xs text-muted">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Your number goes only to this {who.kind}. Kivora never sells your details.
        </p>
      </form>
      <div className="flex items-center gap-3 border-t border-line bg-paper p-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">{who.name.slice(0, 1)}</div>
        <div className="min-w-0 text-sm">
          <p className="truncate font-semibold">
            {who.agentId ? <Link href={`/agents/${who.agentId}`} className="hover:underline">{who.name}</Link> : who.name}
            {who.verified && <span className="ml-1 text-good">✓</span>}
          </p>
          <p className="truncate text-muted">
            {who.kind === "owner" ? "Owner · no brokerage" : who.kind === "builder" ? "Builder" : who.sub}
            {who.rating ? ` · ★ ${who.rating} (${who.reviews})` : ""}
          </p>
        </div>
        <Phone className="ml-auto h-4 w-4 text-muted" />
      </div>
    </div>
  );
}
