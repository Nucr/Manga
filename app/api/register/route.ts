import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Eksik bilgi!' }, { status: 400 });
    }

    // E-posta daha önce kullanılmış mı kontrol et
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı.' }, { status: 409 });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı kaydet
    await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
} 