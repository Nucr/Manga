import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { mangaId } = await req.json();

  if (!mangaId) {
    return NextResponse.json({ message: 'mangaId is required' }, { status: 400 });
  }

  try {
    const userId = session.user.id;

    const followRecord = await prisma.follow.findFirst({
      where: {
        userId: userId,
        mangaId: mangaId,
      },
    });

    if (!followRecord) {
      return NextResponse.json({ message: 'Manga not found in following list' }, { status: 404 });
    }

    const updatedRecord = await prisma.follow.update({
      where: {
        id: followRecord.id,
      },
      data: {
        isFavorite: !followRecord.isFavorite,
      },
    });

    return NextResponse.json(updatedRecord);

  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 