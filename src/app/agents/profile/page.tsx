import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { agentForUser } from "@/lib/queries/agents";
import { AgentProfileForm } from "./form";

export const metadata: Metadata = { title: "Agent profile" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-paper" />}><Inner /></Suspense>
    </div>
  );
}

async function Inner() {
  await connection();
  const u = await requireUser("/agents/profile");
  const a = await agentForUser(u.id);
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{a ? "Edit your agent profile" : "Create your agent profile"}</h1>
      <p className="mb-8 mt-1 text-muted">Buyers and sellers on Kivora compare agents by reviews and published fees. Profiles without a RERA agent number aren&apos;t accepted.</p>
      <AgentProfileForm initial={a ? { ...a, localities: a.localities.join(", "), languages: a.languages.join(", ") } : { name: u.name, email: u.email }} />
    </>
  );
}
