import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "kv_session";
const TTL_DAYS = 30;

export type User = { id: number; email: string; name: string; phone: string | null; role: "user" | "agent" | "admin" };

const hash = (t: string) => createHash("sha256").update(t).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const q = await db();
  await q("insert into sessions (id, user_id, expires_at) values ($1, $2, now() + interval '30 days')", [hash(token), userId]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * TTL_DAYS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const q = await db();
    await q("delete from sessions where id = $1", [hash(token)]);
  }
  jar.delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const q = await db();
  const [u] = await q<User>(
    `select u.id, u.email, u.name, u.phone, u.role from sessions s join users u on u.id = s.user_id
     where s.id = $1 and s.expires_at > now()`,
    [hash(token)],
  );
  return u ?? null;
});

export async function requireUser(next = "/"): Promise<User> {
  const u = await getUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser("/admin");
  if (u.role !== "admin") redirect("/");
  return u;
}
