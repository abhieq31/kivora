"use client";

import { useState } from "react";
import { emi, maxLoanForPrice, purchaseCosts, gstOnUnderConstruction, STAMP_DUTY } from "@/lib/finance";
import { inr, priceLabel } from "@/lib/format";

export function SaleCosts({ price, state, maintenance, underConstruction }: { price: number; state: string; maintenance: number | null; underConstruction: boolean }) {
  const maxLoan = maxLoanForPrice(price);
  const [downPct, setDownPct] = useState(Math.max(20, Math.round((1 - maxLoan / price) * 100)));
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [buyer, setBuyer] = useState<"male" | "female" | "joint">("male");
  const minDown = Math.ceil((1 - maxLoan / price) * 100);
  const down = (price * downPct) / 100;
  const loan = price - down;
  const monthly = emi(loan, rate, years);
  const costs = purchaseCosts(price, state, buyer);
  const gst = underConstruction ? gstOnUnderConstruction(price, price <= 45_00_000) : 0;
  const totalMonthly = monthly + (maintenance ?? 0);
  const parts = [
    { label: "Home loan EMI", v: monthly, color: "#3b3fd8" },
    { label: "Maintenance", v: maintenance ?? 0, color: "#ff7a45" },
  ].filter((p) => p.v > 0);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted">Estimated monthly cost</p>
          <p className="text-3xl font-bold">{inr(totalMonthly)}<span className="text-base font-normal text-muted">/mo</span></p>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full">
            {parts.map((p) => <div key={p.label} style={{ width: `${(p.v / totalMonthly) * 100}%`, background: p.color }} />)}
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {parts.map((p) => (
              <li key={p.label} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.label}</span><b>{inr(p.v)}</b></li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-paper p-4 text-sm">
          <p className="mb-2 font-semibold">One-time costs at purchase</p>
          <ul className="space-y-1">
            <li className="flex justify-between"><span>Down payment ({downPct}%)</span><b>{priceLabel(down)}</b></li>
            <li className="flex justify-between"><span>Stamp duty ({(costs.stampRate * 100).toFixed(2)}%, {state})</span><b>{priceLabel(costs.stamp)}</b></li>
            <li className="flex justify-between"><span>Registration</span><b>{priceLabel(costs.registration)}</b></li>
            {gst > 0 && <li className="flex justify-between"><span>GST (under construction)</span><b>{priceLabel(gst)}</b></li>}
            <li className="flex justify-between border-t border-line pt-1"><span>Cash needed upfront</span><b>{priceLabel(down + costs.total + gst)}</b></li>
          </ul>
          {costs.note && <p className="mt-2 text-xs text-muted">{costs.note}. Indicative only — confirm with the sub-registrar.</p>}
        </div>
      </div>
      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="label">Down payment: {downPct}% ({priceLabel(down)})</span>
          <input type="range" min={minDown} max={90} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
          <span className="text-xs text-muted">RBI caps home loans at {Math.round((maxLoan / price) * 100)}% of value for this price, so at least {minDown}% down.</span>
        </label>
        <label className="block">
          <span className="label">Interest rate: {rate.toFixed(2)}% p.a.</span>
          <input type="range" min={6.5} max={13} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
        </label>
        <label className="block">
          <span className="label">Loan tenure: {years} years</span>
          <input type="range" min={5} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
        </label>
        <label className="block">
          <span className="label">Buyer (affects stamp duty)</span>
          <select className="input" value={buyer} onChange={(e) => setBuyer(e.target.value as typeof buyer)}>
            <option value="male">Man</option><option value="female">Woman</option><option value="joint">Joint (man + woman)</option>
          </select>
        </label>
        <p className="text-xs text-muted">Loan {priceLabel(loan)} · total interest {priceLabel(monthly * years * 12 - loan)} over {years} years. {STAMP_DUTY[state] ? "" : "Stamp duty for this state uses a 6% default."}</p>
      </div>
    </div>
  );
}

export function RentCosts({ rent, deposit, maintenance, viaAgent }: { rent: number; deposit: number | null; maintenance: number | null; viaAgent: boolean }) {
  const brokerage = viaAgent ? rent : 0;
  const agreement = 1500;
  const moveIn = (deposit ?? rent * 2) + rent + brokerage + agreement;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-paper p-4 text-sm">
        <p className="mb-2 font-semibold">Monthly</p>
        <ul className="space-y-1">
          <li className="flex justify-between"><span>Rent</span><b>{inr(rent)}</b></li>
          {maintenance ? <li className="flex justify-between"><span>Maintenance (if not included)</span><b>{inr(maintenance)}</b></li> : null}
          <li className="flex justify-between border-t border-line pt-1"><span>Total</span><b>{inr(rent + (maintenance ?? 0))}</b></li>
        </ul>
      </div>
      <div className="rounded-xl bg-paper p-4 text-sm">
        <p className="mb-2 font-semibold">To move in</p>
        <ul className="space-y-1">
          <li className="flex justify-between"><span>Security deposit ({deposit ? Math.round(deposit / rent) : 2} months)</span><b>{inr(deposit ?? rent * 2)}</b></li>
          <li className="flex justify-between"><span>First month&apos;s rent</span><b>{inr(rent)}</b></li>
          <li className="flex justify-between"><span>Brokerage</span><b>{brokerage ? `~${inr(brokerage)}` : "₹0 (owner listing)"}</b></li>
          <li className="flex justify-between"><span>Rent agreement + e-stamp</span><b>~{inr(agreement)}</b></li>
          <li className="flex justify-between border-t border-line pt-1"><span>Total</span><b>{inr(moveIn)}</b></li>
        </ul>
      </div>
    </div>
  );
}
