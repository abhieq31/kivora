"use client";

import { useState } from "react";

export function InviteShare({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Rent or sell your home without paying brokerage. List it free on Nakshly — buyers and tenants contact you directly: ${link}`;
  return (
    <div>
      <div className="flex gap-2">
        <input readOnly value={link} className="input font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
        <button className="btn-outline shrink-0" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); }}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <a className="btn mt-3 w-full bg-[#128c4b]" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
    </div>
  );
}
