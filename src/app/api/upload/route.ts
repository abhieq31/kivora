import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { storeImage } from "@/lib/storage";

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "Sign in to upload photos" }, { status: 401 });
  const fd = await req.formData();
  const files = fd.getAll("file").filter((f): f is File => f instanceof File).slice(0, 10);
  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });
  try {
    const urls = [];
    for (const f of files) urls.push(await storeImage(f));
    return NextResponse.json({ urls });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
