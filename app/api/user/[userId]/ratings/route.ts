import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  // Kendi puanını çeken kullanıcı doğrulaması
  if (!session || session.user.id !== params.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mangaId = searchParams.get('mangaId');

  if (!mangaId) {
    return NextResponse.json({ message: 'mangaId is required' }, { status: 400 });
  }

  try {
    const rating = await prisma.rating.findFirst({
      where: {
        userId: params.userId,
        mangaId: mangaId,
      },
    });

    if (!rating) {
      return NextResponse.json(null); // Puan yoksa null döndür
    }

    return NextResponse.json(rating); // Puan varsa puan kaydını döndür

  } catch (error) {
    console.error('Error fetching user rating:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 