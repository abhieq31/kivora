"use server";

import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
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
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [{ n }] = await q<{ n: number }>("select count(*)::int as n from login_attempts where key = $1 and at > now() - interval '1 hour'", [`signup:${ip}`]);
  if (n >= 10) return { ok: false, error: "Too many sign-ups from this network. Try again in an hour." };
  await q("insert into login_attempts (key) values ($1)", [`signup:${ip}`]);
  const exists = await q("select 1 from users where email = $1", [parsed.data.email]);
  if (exists.length) return { ok: false, error: "An account with this email already exists. Sign in instead." };
  const ref = (await cookies()).get("nk_ref")?.value;
  const [u] = await q<{ id: number }>(
    `insert into users (email, name, password_hash, ref_code, referred_by)
     values ($1, $2, $3, $4, (select id from users where ref_code = $5)) returning id`,
    [parsed.data.email, parsed.data.name, await hashPassword(parsed.data.password), newRefCode(), ref ?? null],
  );
  await createSession(u.id);
  redirect(safeNext(o.next));
}

function newRefCode() {
  return randomBytes(5).toString("hex").slice(0, 8);
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const o = formObject(fd);
  const email = String(o.email ?? "").toLowerCase();
  const q = await db();
  // Slow down password guessing: 8 failures per email per 15 minutes.
  const key = `login:${email}`;
  const [{ n }] = await q<{ n: number }>("select count(*)::int as n from login_attempts where key = $1 and at > now() - interval '15 minutes'", [key]);
  if (n >= 8) return { ok: false, error: "Too many attempts. Wait 15 minutes and try again." };
  const [u] = await q<{ id: number; password_hash: string }>("select id, password_hash from users where email = $1", [email]);
  if (!u || !(await verifyPassword(String(o.password ?? ""), u.password_hash))) {
    await q("insert into login_attempts (key) values ($1)", [key]);
    if (Math.random() < 0.02) await q("delete from login_attempts where at < now() - interval '2 days'");
    return { ok: false, error: "Wrong email or password." };
  }
  await createSession(u.id);
  redirect(safeNext(o.next));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
