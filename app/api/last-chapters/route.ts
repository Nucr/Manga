import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const mangas = await prisma.manga.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        chapters: {
          orderBy: { number: 'desc' },
          take: 3,
        },
      },
    });
    return NextResponse.json(mangas);
  } catch (error) {
    return NextResponse.json(
      { error: 'Son bölümler alınamadı' },
      { status: 500 }
    );
  }
} 