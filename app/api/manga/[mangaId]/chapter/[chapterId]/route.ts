import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { mangaId: string; chapterId: string } }
) {
  try {
    // Check if manga exists
    const manga = await prisma.manga.findUnique({
      where: { id: params.mangaId },
    });

    if (!manga) {
      return NextResponse.json(
        { message: 'Manga bulunamadı' },
        { status: 404 }
      );
    }

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: params.chapterId },
    });

    if (!chapter) {
      return NextResponse.json(
        { message: 'Bölüm bulunamadı' },
        { status: 404 }
      );
    }

    // Delete chapter (pages will be deleted automatically due to onDelete: Cascade)
    await prisma.chapter.delete({
      where: { id: params.chapterId },
    });

    return NextResponse.json({ message: 'Bölüm başarıyla silindi' });
  } catch (error) {
    console.error('Bölüm silme hatası:', error);
    return NextResponse.json(
      { message: 'Bölüm silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 