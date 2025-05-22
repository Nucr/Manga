import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Status, MangaType, MangaGenre } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort');
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'views') {
      orderBy = { views: 'desc' };
    }
    const slug = searchParams.get('slug');
    if (slug) {
      // Tek bir manga ve TÜM bölümlerini döndür
      try {
        const manga = await prisma.manga.findFirst({
          where: { slug },
          include: {
            chapters: {
              orderBy: { number: 'desc' },
              include: { pages: true },
            },
          },
        });
        if (!manga) {
          return NextResponse.json({ error: 'Manga bulunamadı' }, { status: 404 });
        }
        // Ensure genres is properly handled as an enum array
        const safeManga = {
          ...manga,
          genres: Array.isArray(manga.genres) ? manga.genres : [],
          chapters: Array.isArray(manga.chapters) ? manga.chapters : []
        };
        return NextResponse.json(safeManga);
      } catch (error) {
        console.error('Manga detayı alınırken hata:', error);
        return NextResponse.json(
          { error: 'Manga detayı alınamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
          { status: 500 }
        );
      }
    }
    const mangas = await prisma.manga.findMany({
      orderBy,
      take: limit > 0 ? limit : undefined,
      include: {
        chapters: {
          select: { id: true, number: true, title: true, createdAt: true },
          orderBy: { number: 'desc' },
        },
      },
    });
    const safeMangas = mangas.map(m => ({
      ...m,
      genres: Array.isArray(m.genres) ? m.genres : [],
      chapters: Array.isArray(m.chapters) ? m.chapters : []
    }));
    return NextResponse.json(safeMangas);
  } catch (error) {
    console.error('Manga listesi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Manga listesi alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Gelen veri:', data);

    const { title, slug, description, author, artist, status, type, genres, coverImage, summary, chapters } = data;

    // Gerekli alanları kontrol et
    if (!title || !slug || !author || !artist || !status || !type) {
      console.log('Eksik alanlar:', { title, slug, author, artist, status, type });
      return NextResponse.json(
        { error: 'Tüm gerekli alanları doldurun' },
        { status: 400 }
      );
    }

    // Slug'ın benzersiz olduğunu kontrol et
    const existingManga = await prisma.manga.findUnique({
      where: { slug },
    });

    if (existingManga) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Manga'yı oluştur
    const manga = await prisma.manga.create({
      data: {
        title,
        slug,
        description: description || summary || "",
        author,
        artist,
        status: status as Status,
        type: type as MangaType,
        coverImage: coverImage || null,
        genres: genres || [],
        summary: summary || null,
        chapters: chapters && Array.isArray(chapters) ? {
          create: chapters.map((ch: any) => ({
            number: ch.number,
            title: ch.title,
            content: ch.content,
            pages: ch.pages && Array.isArray(ch.pages) ? {
              create: ch.pages.map((p: any, idx: number) => ({
                number: idx + 1,
                imageUrl: p.imageUrl,
              }))
            } : undefined,
          }))
        } : undefined,
      },
      include: { chapters: true },
    });

    console.log('Oluşturulan manga:', manga);
    return NextResponse.json(manga);
  } catch (error) {
    console.error('Manga oluşturulurken hata:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Manga oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json(
        { error: 'id veya slug parametresi gerekli' },
        { status: 400 }
      );
    }

    if (id) {
      await prisma.manga.delete({ where: { id } });
    } else if (slug) {
      await prisma.manga.delete({ where: { slug } });
    }

    return NextResponse.json({ message: 'Manga başarıyla silindi' });
  } catch (error) {
    console.error('Manga silinirken hata:', error);
    return NextResponse.json(
      { error: 'Manga silinemedi', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function GETCategories() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'id parametresi gerekli' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const updated = await prisma.manga.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        author: data.author,
        artist: data.artist,
        coverImage: data.coverImage,
        // Diğer güncellenebilir alanlar eklenebilir
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Manga güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Manga güncellenemedi' },
      { status: 500 }
    );
  }
} 