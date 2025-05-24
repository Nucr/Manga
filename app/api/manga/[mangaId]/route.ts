import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { Status, MangaGenre } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { mangaId: string } }
) {
  try {
    const { mangaId } = params;
    const manga = await prisma.manga.findUnique({
      where: { id: mangaId },
      include: {
        chapters: {
          orderBy: { number: 'desc' },
          select: {
            id: true,
            number: true,
            title: true,
            createdAt: true,
          },
        },
      },
    });

    if (!manga) {
      return NextResponse.json(
        { message: 'Manga bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(manga);
  } catch (error) {
    console.error('Manga getirme hatası:', error);
    return NextResponse.json(
      { message: 'Manga getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { mangaId: string } }
) {
  try {
    const { mangaId } = params;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const author = formData.get('author') as string;
    const artist = formData.get('artist') as string;
    const status = formData.get('status') as Status;
    const genres = formData.getAll('genres') as MangaGenre[];
    const coverImage = formData.get('coverImage') as File | null;

    // Validate required fields
    if (!title || !slug || !description || !author || !artist || !status || !genres.length) {
      return NextResponse.json(
        { message: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Check if manga exists
    const existingManga = await prisma.manga.findUnique({
      where: { id: mangaId },
    });

    if (!existingManga) {
      return NextResponse.json(
        { message: 'Manga bulunamadı' },
        { status: 404 }
      );
    }

    // Handle cover image if provided
    let coverImagePath = existingManga.coverImage;
    if (coverImage && typeof coverImage !== 'string') {
      const bytes = await coverImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(process.cwd(), 'public', 'uploads', 'covers', `${slug}.jpg`);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, buffer);
      coverImagePath = `/uploads/covers/${slug}.jpg`;
    }

    // Update manga
    const updatedManga = await prisma.manga.update({
      where: { id: mangaId },
      data: {
        title,
        slug,
        description,
        author,
        artist,
        status: status?.toString() as Status,
        coverImage: coverImagePath,
        genres: genres.map(g => g.toString() as MangaGenre),
      },
    });

    return NextResponse.json(updatedManga);
  } catch (error) {
    console.error('Manga güncelleme hatası:', error);
    return NextResponse.json(
      { message: 'Manga güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 