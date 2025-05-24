import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { MangaGenre, Status, MangaType } from "@prisma/client";
import { Suspense } from "react";
import LayoutWithNavbar from '@/components/LayoutWithNavbar';

const genreTrMap: Record<string, string> = {
  ACTION: "Aksiyon",
  ADVENTURE: "Macera",
  COMEDY: "Komedi",
  DRAMA: "Dram",
  FANTASY: "Fantastik",
  HORROR: "Korku",
  MYSTERY: "Gizem",
  ROMANCE: "Romantik",
  SCIFI: "Bilim Kurgu",
  SLICE_OF_LIFE: "Günlük Yaşam",
  SUPERNATURAL: "Doğaüstü",
  THRILLER: "Gerilim",
  SPORTS: "Spor",
  ECCHI: "Ecchi",
  HAREM: "Harem",
  ISEKAI: "İsekai",
  MECHA: "Mecha",
  PSYCHOLOGICAL: "Psikolojik",
  SHOUNEN: "Shounen",
  SHOUJO: "Shoujo",
  SEINEN: "Seinen",
  JOSEI: "Josei",
  YAOI: "Yaoi",
  YURI: "Yuri",
  HISTORICAL: "Tarihi",
  MAGICAL: "Büyü",
  MARTIAL_ARTS: "Dövüş Sanatları",
  MUSIC: "Müzik",
  SCHOOL: "Okul",
  VAMPIRE: "Vampir",
  ZOMBIE: "Zombi",
  FINAL: "Final",
};

const statusTrMap: Record<string, string> = {
  ONGOING: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  HIATUS: "Ara Verildi",
  CANCELLED: "İptal Edildi",
};

const typeTrMap: Record<string, string> = {
  MANGA: "Manga",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Novel",
};

async function getMangaList(searchParams: any) {
  const genre = searchParams?.genre || "";
  const status = searchParams?.status || "";
  const type = searchParams?.type || "";
  const search = searchParams?.search || "";

  const where: any = {};
  if (genre) where.genres = { has: genre };
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) where.title = { contains: search, mode: "insensitive" };

  try {
    const mangas = await prisma.manga.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { chapters: true },
    });
    return mangas;
  } catch (error) {
    console.error('Manga listesi alınırken hata oluştu:', error);
    return [];
  }
}

function LoadingMangaGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-[#23263a] rounded-xl sm:rounded-2xl shadow-lg animate-pulse">
          <div className="aspect-[2/3] w-full rounded-t-xl sm:rounded-t-2xl bg-gray-700" />
          <div className="p-2 sm:p-3">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MangaGrid({ mangas }: { mangas: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {mangas.map((manga) => (
        <Link
          key={manga.id}
          href={`/manga/${manga.slug}`}
          className="group relative bg-[#23263a] rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col"
        >
          <div className="relative aspect-[2/3] w-full rounded-t-xl sm:rounded-t-2xl overflow-hidden">
            {manga.coverImage ? (
              <Image
                src={manga.coverImage}
                alt={manga.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
              </div>
            )}
            {manga.type && (
              <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-blue-700/90 text-[10px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-lg shadow text-white border border-blue-400 drop-shadow-md">
                {typeTrMap[manga.type]}
              </span>
            )}
            <span className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-purple-700/90 text-white text-[10px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-lg shadow border border-purple-400 drop-shadow-md">
              Bölüm {manga.chapters?.length || 0}
            </span>
          </div>
          <div className="p-2 sm:p-3 flex flex-col gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-2 group-hover:text-kuzey-blue transition-colors">
              {manga.title}
            </h3>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
              <span>{(manga as any).rating || '-'} ★</span>
              <span>{manga.status ? statusTrMap[manga.status] : '-'}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function MangaListPage({ searchParams }: { searchParams?: any }) {
  const mangas = await getMangaList(searchParams);
  const genres = Object.values(MangaGenre);
  const statuses = Object.values(Status);
  const types = Object.values(MangaType);
  
  const selectedGenre = searchParams?.genre || '';

  return (
    <LayoutWithNavbar>
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight">Manga Listesi</h1>
        
        <div className="mb-8 bg-[#23263a] p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Türler</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/manga"
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                !selectedGenre ? 'bg-kuzey-blue text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Hepsi
            </Link>
            {genres.map((g) => (
              <Link
                key={g}
                href={`/manga?genre=${g}`}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedGenre === g ? 'bg-kuzey-blue text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {genreTrMap[g]}
              </Link>
            ))}
          </div>
        </div>

        <form className="mb-8 flex flex-wrap gap-3 items-center justify-center bg-[#23263a] p-4 rounded-2xl shadow-lg" method="get">
          <select name="status" defaultValue={searchParams?.status} className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition">
            <option value="">Durum Hepsi</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{statusTrMap[s]}</option>
            ))}
          </select>
          <select name="type" defaultValue={searchParams?.type} className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition">
            <option value="">Tür Hepsi</option>
            {types.map((t) => (
              <option key={t} value={t}>{typeTrMap[t]}</option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            defaultValue={searchParams?.search}
            placeholder="Arama..."
            className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition w-40 md:w-56"
          />
          <button type="submit" className="px-5 py-2 bg-kuzey-blue text-white rounded-lg font-bold shadow hover:bg-blue-700 transition">Ara</button>
        </form>

        <Suspense fallback={<LoadingMangaGrid />}>
          <MangaGrid mangas={mangas} />
        </Suspense>

        {mangas.length === 0 && (
          <div className="text-center py-8 text-gray-500">Hiç seri bulunamadı.</div>
        )}
      </div>
    </LayoutWithNavbar>
  );
} 