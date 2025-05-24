import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { mangaId } = await req.json();
    if (!mangaId) {
      return NextResponse.json({ error: 'Manga ID gerekli' }, { status: 400 });
    }

    // Mevcut takip durumunu kontrol et
    const existingFollow = await prisma.follow.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId: mangaId
        }
      }
    });

    if (existingFollow) {
      // Takibi bırak
      await prisma.follow.delete({
        where: {
          id: existingFollow.id
        }
      });
      return NextResponse.json({ isFollowing: false });
    } else {
      // Takip et
      await prisma.follow.create({
        data: {
          userId: session.user.id,
          mangaId: mangaId
        }
      });
      return NextResponse.json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Takip durumu değiştirme hatası:', error);
    return NextResponse.json(
      { error: 'Takip durumu değiştirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 