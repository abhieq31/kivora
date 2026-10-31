import { readFile } from "node:fs/promises";
import { UPLOAD_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(`${UPLOAD_DIR}/${name}`);
    return new Response(buf, { headers: { "content-type": TYPES[name.split(".").pop()!], "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
