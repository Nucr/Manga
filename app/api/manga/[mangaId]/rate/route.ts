import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { mangaId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { mangaId } = params;
  const { rating } = await req.json();

  if (!mangaId || rating === undefined || rating < 1 || rating > 10) {
    return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });
  }

  try {
    const userId = session.user.id;

    // Kullanıcının daha önce puan verip vermediğini kontrol et
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: userId,
        mangaId: mangaId,
      },
    });

    if (existingRating) {
      // Puanı güncelle
      await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating: rating,
        },
      });
    } else {
      // Yeni puan kaydı oluştur
      await prisma.rating.create({
        data: {
          userId: userId,
          mangaId: mangaId,
          rating: rating,
        },
      });
    }

    // Manganın ortalama puanını yeniden hesapla
    const aggregation = await prisma.rating.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        mangaId: mangaId,
      },
    });

    const newAverageRating = aggregation._avg.rating || 0;

    // Manga tablosundaki rating alanını güncelle
    const updatedManga = await prisma.manga.update({
      where: {
        id: mangaId,
      },
      data: {
        rating: newAverageRating,
      },
    });

    return NextResponse.json({
      message: 'Rating updated successfully',
      averageRating: newAverageRating,
      updatedMangaRating: updatedManga.rating,
    });

  } catch (error) {
    console.error('Error rating manga:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 