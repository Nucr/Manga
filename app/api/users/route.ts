import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Sadece adminlerin kullanıcıları görmesine izin ver (isteğe bağlı)
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
       return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const users = await prisma.user.findMany({ // Tüm kullanıcıları çek
      select: { // Hassas bilgileri çekme
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        profileImage: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcıları çekme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 