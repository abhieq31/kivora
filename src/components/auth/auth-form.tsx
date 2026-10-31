"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, signup } from "@/lib/actions/auth";
import { Field, Notice, Submit } from "../form-bits";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action] = useActionState(mode === "login" ? login : signup, null);
  // Controlled so a failed attempt doesn't wipe what the user typed (React resets forms after actions).
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && <Field label="Full name"><input name="name" className="input" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>}
      <Field label="Email"><input name="email" type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password" hint={mode === "signup" ? "At least 8 characters" : undefined}>
        <input name="password" type="password" className="input" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      </Field>
      <Notice state={state} />
      <Submit className="btn w-full py-3" pendingText={mode === "login" ? "Signing in…" : "Creating account…"}>
        {mode === "login" ? "Sign in" : "Create account"}
      </Submit>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? <>New to Kivora? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-brand">Create an account</Link></>
          : <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand">Sign in</Link></>}
      </p>
    </form>
  );
}
