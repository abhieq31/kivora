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
