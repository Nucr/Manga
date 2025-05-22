import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

// export const runtime = "edge"; // KALDIRILDI

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "Dosya yok" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(process.cwd(), "public", "profile", fileName);
  await writeFile(filePath, buffer);
  const url = `/profile/${fileName}`;
  return NextResponse.json({ url });
} 