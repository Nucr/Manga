import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    // Toplu ekleme desteği
    if (Array.isArray(data.chapters)) {
      // chapters: [{ number, title, content, pages: [{number, imageUrl}] }]
      const chaptersToCreate = data.chapters.map((ch: any) => ({
        number: ch.number,
        title: ch.title,
        content: ch.content,
        mangaId: String(params.id),
        pages: ch.pages && Array.isArray(ch.pages)
          ? { create: ch.pages.map((p: any) => ({ number: p.number, imageUrl: p.imageUrl })) }
          : undefined,
      }));
      // createMany ile sadece ana tabloyu ekleyebiliriz, ilişkili tabloyu (pages) eklemek için transaction kullanıyoruz
      const createdChapters = await prisma.$transaction(
        chaptersToCreate.map((ch: any) =>
          prisma.chapter.create({
            data: ch,
            include: { pages: true },
          })
        )
      );
      return NextResponse.json({ success: true, chapters: createdChapters });
    }
    // Tekli ekleme (eski davranış)
    const { number, title, content, pages } = data;
    if (!number || !title || !content) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }
    const chapter = await prisma.chapter.create({
      data: {
        number,
        title,
        content,
        manga: { connect: { id: String(params.id) } },
        pages: pages && Array.isArray(pages)
          ? { create: pages.map((p: any) => ({ number: p.number, imageUrl: p.imageUrl })) }
          : undefined,
      },
      include: { pages: true },
    });
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json(
      { error: 'Bölüm(ler) eklenemedi', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
} 