import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mangaId = searchParams.get('mangaId');

    if (!mangaId) {
      return NextResponse.json({ error: 'Manga ID gerekli' }, { status: 400 });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId: mangaId
        }
      }
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Takip durumu kontrol hatası:', error);
    return NextResponse.json(
      { error: 'Takip durumu kontrol edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 