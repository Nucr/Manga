import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, password, email } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json(
        { error: 'Kullanıcı adı, e-posta ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcı adının benzersiz olduğunu kontrol et
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // E-postanın benzersiz olduğunu kontrol et
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Bu e-posta zaten kayıtlı' },
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
        role: 'USER',
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