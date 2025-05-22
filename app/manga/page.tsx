import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { MangaGenre, Status, MangaType } from "@prisma/client";

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

function getSearchParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    genre: params.get("genre") || "",
    status: params.get("status") || "",
    type: params.get("type") || "",
    search: params.get("search") || "",
  };
}

export default async function MangaListPage({ searchParams }: { searchParams?: any }) {
  // SSR için searchParams kullanıyoruz
  const genre = searchParams?.genre || "";
  const status = searchParams?.status || "";
  const type = searchParams?.type || "";
  const search = searchParams?.search || "";

  const where: any = {};
  if (genre) where.genres = { has: genre };
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const mangas = await prisma.manga.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { chapters: true },
  });

  const genres = Object.values(MangaGenre);
  const statuses = Object.values(Status);
  const types = Object.values(MangaType);

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight">Manga Listesi</h1>
      {/* Filtre Barı */}
      <form className="mb-8 flex flex-wrap gap-3 items-center justify-center bg-[#23263a] p-4 rounded-2xl shadow-lg" method="get">
        <select name="genre" defaultValue={genre} className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition">
          <option value="">Tür All</option>
          {genres.map((g) => (
            <option key={g} value={g}>{genreTrMap[g]}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition">
          <option value="">Durum Hepsi</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{statusTrMap[s]}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition">
          <option value="">Tür Hepsi</option>
          {types.map((t) => (
            <option key={t} value={t}>{typeTrMap[t]}</option>
          ))}
        </select>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Arama..."
          className="rounded-lg px-3 py-2 bg-kuzey-dark text-white focus:ring-2 focus:ring-kuzey-blue/60 transition w-40 md:w-56"
        />
        <button type="submit" className="px-5 py-2 bg-kuzey-blue text-white rounded-lg font-bold shadow hover:bg-blue-700 transition">Ara</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {mangas.map((manga) => (
          <Link
            key={manga.id}
            href={`/manga/${manga.slug}`}
            className="group relative bg-[#23263a] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[2/3] w-full rounded-t-2xl overflow-hidden">
              {manga.coverImage ? (
                <Image
                  src={manga.coverImage}
                  alt={manga.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              {/* Ülke bayrağı ve renk etiketi örneği */}
              {manga.type && (
                <span className="absolute top-2 left-2 bg-blue-700/90 text-xs font-extrabold px-2 py-0.5 rounded-lg shadow text-white border border-blue-400 drop-shadow-md">
                  {typeTrMap[manga.type]}
                </span>
              )}
              {/* Bölüm sayısı */}
              <span className="absolute top-2 right-2 bg-purple-700/90 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow border border-purple-400 drop-shadow-md">
                Bölüm {manga.chapters?.length || 0}
              </span>
            </div>
            <div className="flex-1 flex flex-col p-3">
              <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-2 group-hover:text-kuzey-blue transition">
                {manga.title}
              </h3>
              <div className="flex flex-wrap gap-1 mb-2">
                {manga.genres?.slice(0, 2).map((g: string) => (
                  <span key={g} className="bg-kuzey-dark text-xs text-white px-2 py-0.5 rounded-full">
                    {genreTrMap[g] || g}
                  </span>
                ))}
              </div>
              {/* Durum etiketi */}
              {manga.status && (
                <span className="inline-block mt-auto text-xs px-2 py-0.5 rounded bg-gray-700 text-white font-semibold">
                  {statusTrMap[manga.status]}
                </span>
              )}
            </div>
            <div className="px-3 pb-3">
              <span className="inline-block w-full text-center py-1 mt-2 rounded-lg bg-kuzey-blue text-white font-bold hover:bg-blue-700 transition">Detay</span>
            </div>
          </Link>
        ))}
      </div>
      {mangas.length === 0 && (
        <div className="text-center py-8 text-gray-500">Hiç seri bulunamadı.</div>
      )}
    </div>
  );
} 