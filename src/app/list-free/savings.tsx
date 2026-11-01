"use client";

import { useState } from "react";
import { inr } from "@/lib/format";

export function SavingsCalc() {
  const [rent, setRent] = useState(15000);
  const brokerage = rent; // one month's rent, often charged to both sides
  const paperwork = 1500;
  return (
    <div className="card grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-2">
      <div>
        <p className="label">Your monthly rent</p>
        <input type="range" min={5000} max={150000} step={1000} value={rent} onChange={(e) => setRent(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
        <p className="mt-1 text-2xl font-bold">{inr(rent)}</p>
      </div>
      <div className="rounded-xl bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">With a broker you&apos;d typically lose</p>
        <p className="text-3xl font-extrabold text-good">{inr(brokerage + paperwork)}</p>
        <p className="text-sm text-emerald-800">one month&apos;s rent + about {inr(paperwork)} &ldquo;agreement charges&rdquo; — and your tenant pays the same again. On Nakshly: ₹0.</p>
      </div>
    </div>
  );
}
