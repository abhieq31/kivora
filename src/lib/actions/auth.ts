"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { createSession, destroySession } from "../auth";
import { hashPassword, verifyPassword } from "../password";
import { firstError, formObject, type FormState } from "./util";

const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/");

const signupSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  email: z.string().email("Enter a valid email").max(120).transform((s) => s.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const o = formObject(fd);
  const parsed = signupSchema.safeParse(o);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const q = await db();
  const exists = await q("select 1 from users where email = $1", [parsed.data.email]);
  if (exists.length) return { ok: false, error: "An account with this email already exists. Sign in instead." };
  const [u] = await q<{ id: number }>("insert into users (email, name, password_hash) values ($1, $2, $3) returning id", [
    parsed.data.email, parsed.data.name, await hashPassword(parsed.data.password),
  ]);
  await createSession(u.id);
  redirect(safeNext(o.next));
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const o = formObject(fd);
  const email = String(o.email ?? "").toLowerCase();
  const q = await db();
  const [u] = await q<{ id: number; password_hash: string }>("select id, password_hash from users where email = $1", [email]);
  if (!u || !(await verifyPassword(String(o.password ?? ""), u.password_hash))) return { ok: false, error: "Wrong email or password." };
  await createSession(u.id);
  redirect(safeNext(o.next));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
