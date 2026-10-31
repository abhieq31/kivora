import "server-only";
import { randomBytes } from "node:crypto";

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./.data/uploads";
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_UPLOAD = 4 * 1024 * 1024;

/** Store an image: Vercel Blob when configured, otherwise the local disk (served by /uploads/[name]). */
export async function storeImage(file: File): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Only JPG, PNG or WebP images");
  if (file.size > MAX_UPLOAD) throw new Error("Each photo must be under 4 MB");
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`listings/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(`${UPLOAD_DIR}/${name}`, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
