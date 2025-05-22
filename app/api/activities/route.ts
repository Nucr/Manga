import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Son 3 manga
    const mangas = await prisma.manga.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, createdAt: true },
    });
    // Son 3 kullanıcı
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, name: true, createdAt: true },
    });
    // Son 3 bölüm
    const chapters = await prisma.chapter.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, number: true, createdAt: true, mangaId: true },
    });
    // Bölümlerin manga başlığını çek
    const mangaMap: Record<string, string> = {};
    for (const ch of chapters) {
      if (!mangaMap[ch.mangaId]) {
        const manga = await prisma.manga.findUnique({ where: { id: ch.mangaId }, select: { title: true } });
        mangaMap[ch.mangaId] = manga?.title || '';
      }
    }
    // Hepsini tek diziye topla
    const activities = [
      ...mangas.map(m => ({ type: 'manga', title: m.title, createdAt: m.createdAt })),
      ...users.map(u => ({ type: 'user', title: u.name || 'Yeni Kullanıcı', createdAt: u.createdAt })),
      ...chapters.map(ch => ({ type: 'chapter', title: `${mangaMap[ch.mangaId] || ''} - Bölüm ${ch.number}`, createdAt: ch.createdAt })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: 'Aktiviteler alınamadı' }, { status: 500 });
  }
} 