import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { mangaId: string } }) {
  try {
    await prisma.manga.update({
      where: { id: params.mangaId },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'View increment failed' }, { status: 500 });
  }
} 