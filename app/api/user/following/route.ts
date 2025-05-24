import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const following = await prisma.follow.findMany({
      where: {
        userId: userId,
      },
      include: {
        manga: {
          include: {
            chapters: {
              orderBy: { number: 'desc' },
              take: 1,
              select: { number: true, id: true },
            },
          },
        },
      },
    });

    return NextResponse.json(following);

  } catch (error) {
    console.error('Error fetching following list:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 