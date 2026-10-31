"use client";

import { useActionState, useMemo, useState } from "react";
import { affordability, emi, INDICATIVE_LENDERS, maxLoanForPrice, purchaseCosts, STAMP_DUTY } from "@/lib/finance";
import { inr, priceLabel } from "@/lib/format";
import { requestLoanCallback } from "@/lib/actions/homes";
import { CITIES } from "@/lib/geo";
import { Notice, Submit } from "./form-bits";

function Slider({ label, value, min, max, step = 1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; fmt: (n: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-medium"><span>{label}</span><span className="font-bold">{fmt(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-brand)]" />
    </label>
  );
}

export function EmiCalculator({ initialAmount = 50_00_000 }: { initialAmount?: number }) {
  const [amount, setAmount] = useState(initialAmount);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const m = emi(amount, rate, years);
  const total = m * years * 12;
  const interest = total - amount;
  const schedule = useMemo(() => {
    const rows: { year: number; principal: number; interest: number; balance: number }[] = [];
    let bal = amount;
    const r = rate / 1200;
    for (let y = 1; y <= years; y++) {
      let p = 0;
      let i = 0;
      for (let k = 0; k < 12; k++) {
        const int = bal * r;
        const pr = Math.min(bal, m - int);
        i += int; p += pr; bal -= pr;
      }
      rows.push({ year: y, principal: p, interest: i, balance: Math.max(0, bal) });
    }
    return rows;
  }, [amount, rate, years, m]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Slider label="Loan amount" value={amount} min={5_00_000} max={5_00_00_000} step={50_000} onChange={setAmount} fmt={priceLabel} />
        <Slider label="Interest rate (p.a.)" value={rate} min={6.5} max={14} step={0.05} onChange={setRate} fmt={(n) => `${n.toFixed(2)}%`} />
        <Slider label="Tenure" value={years} min={5} max={30} onChange={setYears} fmt={(n) => `${n} years`} />
      </div>
      <div className="card p-6">
        <p className="text-sm text-muted">Monthly EMI</p>
        <p className="text-4xl font-bold">{inr(m)}</p>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full"><div className="bg-brand" style={{ width: `${(amount / total) * 100}%` }} /><div className="flex-1 bg-accent" /></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div><p className="text-muted">Principal</p><p className="font-bold">{priceLabel(amount)}</p></div>
          <div><p className="text-muted">Interest</p><p className="font-bold">{priceLabel(interest)}</p></div>
          <div><p className="text-muted">Total paid</p><p className="font-bold">{priceLabel(total)}</p></div>
        </div>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-brand">Year-by-year schedule</summary>
          <div className="mt-2 max-h-64 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-muted"><tr><th className="py-1">Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
              <tbody>{schedule.map((r) => <tr key={r.year} className="border-t border-line"><td className="py-1">{r.year}</td><td>{priceLabel(r.principal)}</td><td>{priceLabel(r.interest)}</td><td>{priceLabel(r.balance)}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}

export function AffordabilityCalculator() {
  const [income, setIncome] = useState(1_50_000);
  const [emis, setEmis] = useState(0);
  const [savings, setSavings] = useState(25_00_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const a = affordability({ monthlyIncome: income, existingEmis: emis, savings, ratePct: rate, years });
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Slider label="Monthly take-home income" value={income} min={25_000} max={10_00_000} step={5_000} onChange={setIncome} fmt={inr} />
        <Slider label="Existing EMIs" value={emis} min={0} max={3_00_000} step={1_000} onChange={setEmis} fmt={inr} />
        <Slider label="Savings for down payment & costs" value={savings} min={0} max={5_00_00_000} step={50_000} onChange={setSavings} fmt={priceLabel} />
        <Slider label="Interest rate" value={rate} min={6.5} max={14} step={0.05} onChange={setRate} fmt={(n) => `${n.toFixed(2)}%`} />
        <Slider label="Tenure" value={years} min={5} max={30} onChange={setYears} fmt={(n) => `${n} years`} />
      </div>
      <div className="card p-6">
        <p className="text-sm text-muted">You can afford a home up to</p>
        <p className="text-4xl font-bold">{priceLabel(a.maxPrice)}</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between"><span>Home loan</span><b>{priceLabel(a.maxLoan)}</b></li>
          <li className="flex justify-between"><span>Down payment</span><b>{priceLabel(a.downPayment)}</b></li>
          <li className="flex justify-between"><span>Max EMI (50% of income − existing EMIs)</span><b>{inr(a.maxEmi)}</b></li>
          <li className="flex justify-between"><span>EMI at this price</span><b>{inr(emi(a.maxLoan, rate, years))}</b></li>
        </ul>
        <p className="mt-4 text-xs text-muted">Keep ~7–8% of the price aside for stamp duty, registration and interiors. RBI caps loans at 75–90% of value; lenders cap total EMIs at roughly 40–60% of income. Indicative only.</p>
        <a href={`/buy?max=${a.maxPrice}`} className="btn mt-4 w-full">See homes under {priceLabel(a.maxPrice)}</a>
      </div>
    </div>
  );
}

const STATE_CITY: Record<string, string> = Object.fromEntries(CITIES.map((c) => [c.state, c.name]));

export function StampDutyCalculator() {
  const states = Object.keys(STAMP_DUTY).sort();
  const [state, setState] = useState("Maharashtra");
  const [price, setPrice] = useState(1_00_00_000);
  const [buyer, setBuyer] = useState<"male" | "female" | "joint">("male");
  const c = purchaseCosts(price, state, buyer);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <label className="block"><span className="label">State</span>
          <select className="input" value={state} onChange={(e) => setState(e.target.value)}>{states.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <Slider label="Property value (agreement or circle rate, whichever is higher)" value={price} min={10_00_000} max={10_00_00_000} step={1_00_000} onChange={setPrice} fmt={priceLabel} />
        <label className="block"><span className="label">Buyer</span>
          <select className="input" value={buyer} onChange={(e) => setBuyer(e.target.value as typeof buyer)}>
            <option value="male">Man</option><option value="female">Woman</option><option value="joint">Joint (man + woman)</option>
          </select>
        </label>
      </div>
      <div className="card p-6">
        <p className="text-sm text-muted">Stamp duty + registration in {state}</p>
        <p className="text-4xl font-bold">{priceLabel(c.total)}</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between"><span>Stamp duty ({(c.stampRate * 100).toFixed(2)}%)</span><b>{inr(c.stamp)}</b></li>
          <li className="flex justify-between"><span>Registration fee</span><b>{inr(c.registration)}</b></li>
        </ul>
        {c.note && <p className="mt-3 text-sm text-muted">{c.note}.</p>}
        <p className="mt-3 text-xs text-muted">Indicative urban residential rates{STATE_CITY[state] ? ` (e.g. ${STATE_CITY[state]})` : ""}. Rates, slabs, cesses and women&apos;s concessions change; confirm on the state registration department website.</p>
      </div>
    </div>
  );
}

export function RentVsBuy() {
  const [price, setPrice] = useState(1_00_00_000);
  const [rent, setRent] = useState(30_000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(8.5);
  const [growth, setGrowth] = useState(6);
  const [rentGrowth, setRentGrowth] = useState(5);
  const [invest, setInvest] = useState(10);
  const r = useMemo(() => {
    const loan = maxLoanForPrice(price);
    const down = price - loan;
    const upfront = down + price * 0.07;
    const monthly = emi(loan, rate, 20);
    const maint = price * 0.0002 * 12;
    let bal = loan;
    let buyOut = upfront;
    let rentOut = 0;
    let portfolio = upfront;
    let curRent = rent;
    for (let y = 0; y < years; y++) {
      for (let k = 0; k < 12; k++) {
        const int = bal * (rate / 1200);
        bal -= Math.min(bal, monthly - int);
        buyOut += monthly;
        rentOut += curRent;
        portfolio = portfolio * (1 + invest / 1200) + Math.max(0, monthly + maint / 12 - curRent);
      }
      buyOut += maint;
      curRent *= 1 + rentGrowth / 100;
    }
    const value = price * (1 + growth / 100) ** years;
    const buyWealth = value - bal;
    return { buyWealth, rentWealth: portfolio, buyOut, rentOut, upfront, monthly };
  }, [price, rent, years, rate, growth, rentGrowth, invest]);
  const buyWins = r.buyWealth > r.rentWealth;
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <Slider label="Home price" value={price} min={20_00_000} max={10_00_00_000} step={1_00_000} onChange={setPrice} fmt={priceLabel} />
        <Slider label="Rent for a similar home" value={rent} min={5_000} max={3_00_000} step={1_000} onChange={setRent} fmt={inr} />
        <Slider label="Years you'll stay" value={years} min={1} max={30} onChange={setYears} fmt={(n) => `${n} years`} />
        <Slider label="Home loan rate" value={rate} min={6.5} max={14} step={0.05} onChange={setRate} fmt={(n) => `${n.toFixed(2)}%`} />
        <Slider label="Home price growth / yr" value={growth} min={0} max={15} step={0.5} onChange={setGrowth} fmt={(n) => `${n}%`} />
        <Slider label="Rent increase / yr" value={rentGrowth} min={0} max={12} step={0.5} onChange={setRentGrowth} fmt={(n) => `${n}%`} />
        <Slider label="Return on invested savings / yr" value={invest} min={0} max={15} step={0.5} onChange={setInvest} fmt={(n) => `${n}%`} />
      </div>
      <div className="card p-6">
        <p className="text-sm text-muted">After {years} years</p>
        <p className="text-3xl font-bold">{buyWins ? "Buying" : "Renting"} leaves you {priceLabel(Math.abs(r.buyWealth - r.rentWealth))} richer</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className={`rounded-xl p-4 ${buyWins ? "bg-brand-soft" : "bg-paper"}`}><p className="text-muted">Buy: home equity</p><p className="text-xl font-bold">{priceLabel(r.buyWealth)}</p></div>
          <div className={`rounded-xl p-4 ${!buyWins ? "bg-brand-soft" : "bg-paper"}`}><p className="text-muted">Rent: invested savings</p><p className="text-xl font-bold">{priceLabel(r.rentWealth)}</p></div>
        </div>
        <ul className="mt-4 space-y-1 text-sm">
          <li className="flex justify-between"><span>Upfront to buy (down payment + ~7% costs)</span><b>{priceLabel(r.upfront)}</b></li>
          <li className="flex justify-between"><span>EMI</span><b>{inr(r.monthly)}/mo</b></li>
          <li className="flex justify-between"><span>Total rent paid</span><b>{priceLabel(r.rentOut)}</b></li>
        </ul>
        <p className="mt-4 text-xs text-muted">Assumes the renter invests the upfront amount and any monthly saving vs. owning. Ignores tax benefits (Sec 24/80C) and selling costs. Indicative only.</p>
      </div>
    </div>
  );
}

export function LoanLeadForm() {
  const [state, action] = useActionState(requestLoanCallback, null);
  if (state?.ok) return <p className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{state.message}</p>;
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <input name="name" className="input" placeholder="Name" required />
      <input name="phone" className="input" placeholder="Mobile" required inputMode="tel" />
      <select name="city" className="input" required defaultValue=""><option value="" disabled>City</option>{[...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
      <input name="monthly_income" className="input" placeholder="Monthly income (₹)" inputMode="numeric" required />
      <input name="loan_amount" className="input" placeholder="Loan needed (₹)" inputMode="numeric" required />
      <select name="employment" className="input" defaultValue="salaried"><option value="salaried">Salaried</option><option value="self_employed">Self-employed</option></select>
      <div className="sm:col-span-3"><Notice state={state} /></div>
      <div className="sm:col-span-3"><Submit pendingText="Sending…">Get a callback</Submit></div>
    </form>
  );
}

export function LenderTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-line text-muted"><tr><th className="py-2">Lender type</th><th>Indicative rate</th><th>Processing fee</th></tr></thead>
        <tbody>{INDICATIVE_LENDERS.map((l) => <tr key={l.name} className="border-b border-line last:border-0"><td className="py-3 font-medium">{l.name}</td><td>{l.from.toFixed(2)}% – {l.to.toFixed(2)}%</td><td>{l.processing}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
