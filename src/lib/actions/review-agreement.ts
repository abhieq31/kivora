"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UNFAIR_PATTERNS } from "@/lib/rent-rules";

export type ReviewResult = {
  ok: boolean;
  error?: string;
  summary?: string;
  language?: string;
  issues?: { clause: string; problem: string; suggestion: string; severity: "high" | "medium" | "low" }[];
  good?: string[];
};

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/**
 * Reads an agreement (photos or a PDF, any Indian language) and lists one-sided clauses.
 * Off unless AI_REVIEW=1 — it needs AI Gateway billing on the Vercel team.
 */
export async function reviewAgreement(_: ReviewResult | null, fd: FormData): Promise<ReviewResult> {
  if (process.env.AI_REVIEW !== "1") return { ok: false, error: "AI review isn't switched on yet. Use the quick check below." };
  const u = await getUser();
  if (!u) return { ok: false, error: "Sign in to use the AI review (it's free)." };
  const q = await db();
  const [{ n }] = await q<{ n: number }>("select count(*)::int as n from login_attempts where key = $1 and at > now() - interval '1 day'", [`ai-review:${u.id}`]);
  if (n >= 5) return { ok: false, error: "You've used today's 5 free reviews. Try again tomorrow." };

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 8);
  const text = String(fd.get("text") ?? "").slice(0, 30000);
  if (!files.length && text.trim().length < 50) return { ok: false, error: "Add photos or a PDF of the agreement, or paste its text." };
  let total = 0;
  for (const f of files) {
    if (!TYPES.includes(f.type)) return { ok: false, error: "Use JPG, PNG, WebP or PDF files." };
    total += f.size;
  }
  if (total > MAX_BYTES) return { ok: false, error: "Files add up to more than 8 MB. Use fewer or smaller photos." };
  await q("insert into login_attempts (key) values ($1)", [`ai-review:${u.id}`]);

  const checklist = UNFAIR_PATTERNS.map((p) => `- ${p.label}: ${p.why}`).join("\n");
  try {
    const { output } = await generateText({
      model: process.env.AI_REVIEW_MODEL ?? "anthropic/claude-sonnet-5.5",
      output: Output.object({
        schema: z.object({
          language: z.string(),
          summary: z.string().describe("2-3 plain-English sentences: who it favours overall and the key money terms"),
          issues: z.array(z.object({
            clause: z.string().describe("Clause number and a short English paraphrase"),
            problem: z.string(),
            suggestion: z.string().describe("Fairer wording to propose, in plain English"),
            severity: z.enum(["high", "medium", "low"]),
          })),
          good: z.array(z.string()).describe("Clauses that protect the tenant"),
        }),
      }),
      system: `You review Indian residential rent / leave-and-licence agreements for a tenant. Agreements may be in Gujarati, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali or English, often scanned. Read every clause. Judge against the Model Tenancy Act, 2021 defaults (deposit up to 2 months, 24h notice before entry, owner pays structural repairs, no cutting essential services, refund on vacating, eviction only with notice) and these common problems:\n${checklist}\nBe factual and specific; do not invent clauses. Do not repeat Aadhaar, PAN or phone numbers. This is information, not legal advice.`,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: text ? `Agreement text:\n${text}` : "Review the attached agreement pages." },
          ...(await Promise.all(files.map(async (f) => ({ type: "file" as const, data: new Uint8Array(await f.arrayBuffer()), mediaType: f.type })))),
        ],
      }],
    });
    return { ok: true, ...output };
  } catch (e) {
    console.error("agreement review failed", e);
    return { ok: false, error: "We couldn't read that agreement right now. Try clearer photos, or use the quick check below." };
  }
}
