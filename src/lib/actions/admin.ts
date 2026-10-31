"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireAdmin } from "../auth";

export async function adminSetListing(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const op = String(fd.get("op"));
  const q = await db();
  if (op === "verify") await q("update properties set verified = true where id = $1", [id]);
  else if (op === "unverify") await q("update properties set verified = false where id = $1", [id]);
  else if (op === "remove") await q("update properties set status = 'off_market' where id = $1", [id]);
  revalidatePath("/admin");
}

export async function adminSetAgent(fd: FormData) {
  await requireAdmin();
  const q = await db();
  await q("update agents set verified = $1 where id = $2", [fd.get("op") === "verify", Number(fd.get("id"))]);
  revalidatePath("/admin");
}
