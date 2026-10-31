"use client";

import { useState } from "react";
import Link from "next/link";
import { LocationSearch } from "./location-search";

export function HeroSearch() {
  const [mode, setMode] = useState<"buy" | "rent" | "sell">("buy");
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 flex gap-1">
        {(["buy", "rent", "sell"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-t-lg px-5 py-2 text-sm font-semibold ${mode === m ? "bg-white text-ink" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            {m === "buy" ? "Buy" : m === "rent" ? "Rent" : "Sell"}
          </button>
        ))}
      </div>
      {mode === "sell" ? (
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-lg sm:flex-row">
          <Link href="/home-value" className="btn flex-1 py-3">What&apos;s my home worth?</Link>
          <Link href="/post-property" className="btn-outline flex-1 py-3">Post your property free</Link>
        </div>
      ) : (
        <LocationSearch mode={mode} placeholder={mode === "rent" ? "Search rentals by city, locality or project" : "Enter a city, locality or project"} />
      )}
    </div>
  );
}
