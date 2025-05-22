import Link from 'next/link';

interface Manga {
  id: string;
  slug: string;
  title: string;
  coverImage?: string;
  genres?: string[];
  chapters?: any[];
}

interface KategoriPageProps {
  params: { slug: string };
}

async function getAllManga(): Promise<Manga[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/manga`, { cache: 'no-store' });
  return res.json();
}

export default async function KategoriPage({ params }: KategoriPageProps) {
  const allManga = await getAllManga();
  const slug = decodeURIComponent(params.slug).toLowerCase();
  const filtered = allManga.filter((manga: Manga) =>
    manga.genres?.some((g: string) => g.trim().toLowerCase() === slug)
  );

  return (
    <div className="min-h-screen bg-[#181a20] text-white">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 capitalize">{params.slug} Kategorisi</h1>
        {filtered.length === 0 ? (
          <div className="text-gray-400">Bu kategoride manga bulunamadı.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((manga: Manga) => (
              <Link key={manga.id} href={`/manga/${manga.slug}`} className="block bg-[#23263a] rounded-xl p-4 shadow hover:bg-kuzey-blue/10 transition border border-[#23263a] hover:border-kuzey-blue/60">
                <img src={manga.coverImage || '/default-cover.png'} alt={manga.title} className="w-full h-48 object-cover rounded mb-3" />
                <div className="font-bold text-lg text-white mb-1">{manga.title}</div>
                <div className="text-xs text-gray-400 mb-1">{manga.genres?.join(', ')}</div>
                <div className="text-xs text-gray-400">Bölüm: {manga.chapters?.length || 0}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 