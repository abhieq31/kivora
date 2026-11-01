"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import { applyToRental } from "@/lib/actions/homes";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        const url = location.href.split("?")[0];
        if (navigator.share) {
          try { await navigator.share({ title, url }); return; } catch { /* fall through to copy */ }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <Share2 className="h-4 w-4" /> {copied ? "Link copied" : "Share"}
    </button>
  );
}

/** WhatsApp is how India shares homes — one tap, prefilled, tagged so we can count it. */
export function WhatsAppButton({ text }: { text: string }) {
  return (
    <button
      className="btn-ghost text-[#128c4b]"
      onClick={() => {
        const url = `${location.origin}${location.pathname}?utm_source=whatsapp`;
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
      }}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>
      WhatsApp
    </button>
  );
}

export function ApplyButton({ propertyId, applied }: { propertyId: number; applied: boolean }) {
  const [done, setDone] = useState(applied);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (done) return <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Application sent with your renter profile ✓</p>;
  return (
    <div>
      <button
        className="btn-outline w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await applyToRental(propertyId);
            if (r.login) router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
            else if (r.needProfile) router.push(`/renter-profile?next=${encodeURIComponent(location.pathname)}`);
            else if (r.ok) setDone(true);
            else setErr(r.error ?? "Could not apply");
          })
        }
      >
        {pending ? "Applying…" : "Apply now with your renter profile"}
      </button>
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
      <p className="mt-1 text-xs text-muted">One profile, every rental. No application fee.</p>
    </div>
  );
}
