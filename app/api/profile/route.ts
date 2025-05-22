import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { name, username, password, profileImage } = await req.json();
  try {
    const data: any = { name, username, profileImage };
    if (password && password.length > 0) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data,
    });
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
} 