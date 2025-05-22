import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapter: string }> }) {
  const { slug, chapter } = await params;
  if (!slug || !chapter) return notFound();

  const manga = await prisma.manga.findFirst({
    where: { slug },
    include: {
      chapters: {
        orderBy: { number: 'desc' },
        select: { id: true, number: true, title: true },
      },
    },
  });

  if (!manga) return notFound();

  const chapterNum = Number(chapter);
  const chapterData = manga.chapters.find((ch) => ch.number === chapterNum);
  if (!chapterData) return notFound();

  // Get only the current chapter's pages
  const chapterWithPages = await prisma.chapter.findUnique({
    where: { id: chapterData.id },
    include: {
      pages: {
        orderBy: { number: 'asc' },
      },
    },
  });

  if (!chapterWithPages) return notFound();

  const chaptersSorted = [...manga.chapters].sort((a, b) => a.number - b.number);
  const currentIdx = chaptersSorted.findIndex((ch) => ch.number === chapterNum);
  const prevChapter = currentIdx > 0 ? chaptersSorted[currentIdx - 1] : null;
  const nextChapter = currentIdx < chaptersSorted.length - 1 ? chaptersSorted[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#181a20]">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-[#181a20] bg-opacity-95 shadow flex items-center justify-between px-4 py-3 border-b border-kuzey-blue/20">
        <div className="flex gap-2 items-center text-xs text-gray-400">
          <Link href="/" className="hover:text-kuzey-blue font-semibold">Ana Sayfa</Link>
          <span>/</span>
          <Link href={`/manga/${slug}`} className="hover:text-kuzey-blue font-semibold">{manga.title}</Link>
          <span>/</span>
          <span className="text-kuzey-blue font-bold">Bölüm {chapterData.number}</span>
        </div>
        <div className="flex gap-2">
          {prevChapter && (
            <Link
              href={`/manga/${slug}/chapter/${prevChapter.number}`}
              className="transition px-4 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold shadow hover:scale-105 hover:from-blue-800 hover:to-blue-600"
            >
              ← Önceki Bölüm
            </Link>
          )}
          <Link
            href={`/manga/${slug}`}
            className="transition px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 text-white font-semibold shadow hover:scale-105 hover:from-purple-800 hover:to-purple-600"
          >
            Manga Sayfasına Dön
          </Link>
          {nextChapter && (
            <Link
              href={`/manga/${slug}/chapter/${nextChapter.number}`}
              className="transition px-4 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold shadow hover:scale-105 hover:from-blue-800 hover:to-blue-600"
            >
              Sonraki Bölüm →
            </Link>
          )}
        </div>
      </nav>

      {/* Chapter Images */}
      <div className="flex flex-col items-center gap-4 py-8">
        {chapterWithPages.pages.map((page) => (
          <img
            key={page.id}
            src={page.imageUrl}
            alt={`Sayfa ${page.number}`}
            className="max-w-full h-auto rounded-lg shadow-lg border border-kuzey-blue/20 bg-black"
          />
        ))}
      </div>
    </div>
  );
} 