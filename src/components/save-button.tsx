"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleSave } from "@/lib/actions/homes";

export function SaveButton({ id, initial, variant = "icon" }: { id: number; initial: boolean; variant?: "icon" | "button" }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
    start(async () => {
      const res = await toggleSave(id);
      if ("login" in res) {
        setSaved(false);
        router.push(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      } else setSaved(res.saved);
    });
  };
  if (variant === "button") {
    return (
      <button onClick={onClick} disabled={pending} className="btn-ghost" aria-pressed={saved}>
        <Heart className={`h-4 w-4 ${saved ? "fill-accent text-accent" : ""}`} /> {saved ? "Saved" : "Save"}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remove from saved homes" : "Save home"}
      aria-pressed={saved}
      className="grid h-9 w-9 place-items-center rounded-full bg-black/25 backdrop-blur transition hover:bg-black/40"
    >
      <Heart className={`h-5 w-5 ${saved ? "fill-accent text-accent" : "text-white"}`} strokeWidth={2.2} />
    </button>
  );
}
