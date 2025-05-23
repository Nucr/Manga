import { notFound } from 'next/navigation';
import MangaDetailClient from '@/components/MangaDetailClient';
import LayoutWithNavbar from '@/components/LayoutWithNavbar';
import prisma from '@/lib/prisma';

export default async function MangaDetailPage({ params }: { params?: { slug?: string } }) {
  if (!params || !params.slug) return notFound();
  
  const manga = await prisma.manga.findFirst({
    where: { slug: params.slug },
    include: {
      chapters: {
        orderBy: { number: 'desc' },
        select: { id: true, number: true, title: true, createdAt: true },
      },
    },
  });
  
  if (!manga) return notFound();

  return (
    <LayoutWithNavbar>
      <div className="container mx-auto px-4 py-8">
        <MangaDetailClient manga={manga} />
      </div>
    </LayoutWithNavbar>
  );
} 