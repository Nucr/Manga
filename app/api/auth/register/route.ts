import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, password, email, name } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcı adının benzersiz olduğunu kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
      },
    });

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız oldu' },
      { status: 500 }
    );
  }
} 