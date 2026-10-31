import { z } from "zod";

export type FormState = { ok: boolean; error?: string; message?: string; id?: number } | null;

export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, ""))
  .refine((s) => /^[6-9]\d{9}$/.test(s), "Enter a valid 10-digit Indian mobile number");

export function formObject(fd: FormData) {
  const o: Record<string, string | string[]> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue;
    if (k.endsWith("[]")) {
      const key = k.slice(0, -2);
      o[key] = [...((o[key] as string[]) ?? []), v];
    } else o[k] = v.trim();
  }
  return o;
}

export function firstError(e: z.ZodError) {
  const i = e.issues[0];
  return i ? i.message : "Please check the form.";
}

export const optNum = z.preprocess((v) => (v === "" || v == null ? undefined : Number(String(v).replace(/[,₹\s]/g, ""))), z.number().finite().optional());
export const reqNum = (msg: string) => z.preprocess((v) => (v === "" || v == null ? NaN : Number(String(v).replace(/[,₹\s]/g, ""))), z.number({ error: msg }).finite(msg));
