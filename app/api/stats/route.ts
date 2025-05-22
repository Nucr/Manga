import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Toplam manga
    const mangaCount = await prisma.manga.count();
    // Toplam kullanıcı
    const userCount = await prisma.user.count();
    // Bugün eklenen yeni bölümler
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayChapters = await prisma.chapter.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
    // Bugünkü toplam ziyaret (tüm mangaların bugün artan views toplamı)
    // Eğer views alanı sadece toplam view ise, bu alanı gün gün takip etmiyorsan, bu alanı 0 döndür.
    // Eğer bir View veya Analytics tablon varsa, oradan bugünkü toplamı çekebilirsin.
    // Şimdilik 0 döndürüyorum.
    const todayViews = 0;

    return NextResponse.json({
      mangaCount,
      userCount,
      todayChapters,
      todayViews,
    });
  } catch (error) {
    return NextResponse.json({ error: 'İstatistikler alınamadı' }, { status: 500 });
  }
} 