import prisma from "@/lib/prisma";
import Link from "next/link";

const MangaGenre = {
  ACTION: "ACTION",
  ADVENTURE: "ADVENTURE",
  COMEDY: "COMEDY",
  DRAMA: "DRAMA",
  FANTASY: "FANTASY",
  HORROR: "HORROR",
  MYSTERY: "MYSTERY",
  ROMANCE: "ROMANCE",
  SCIFI: "SCIFI",
  SLICE_OF_LIFE: "SLICE_OF_LIFE",
  SUPERNATURAL: "SUPERNATURAL",
  THRILLER: "THRILLER",
  SPORTS: "SPORTS",
  ECCHI: "ECCHI",
  HAREM: "HAREM",
  ISEKAI: "ISEKAI",
  MECHA: "MECHA",
  PSYCHOLOGICAL: "PSYCHOLOGICAL",
  SHOUNEN: "SHOUNEN",
  SHOUJO: "SHOUJO",
  SEINEN: "SEINEN",
  JOSEI: "JOSEI",
  YAOI: "YAOI",
  YURI: "YURI",
  HISTORICAL: "HISTORICAL",
  MAGICAL: "MAGICAL",
  MARTIAL_ARTS: "MARTIAL_ARTS",
  MUSIC: "MUSIC",
  SCHOOL: "SCHOOL",
  VAMPIRE: "VAMPIRE",
  ZOMBIE: "ZOMBIE",
} as const;

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
};

export default async function GenresPage() {
  const genres = Object.values(MangaGenre);
  
  // Build sırasında veritabanı sorgularını devre dışı bırak
  if (process.env.NEXT_PHASE === 'production') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Türler</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/genres/${genre.toLowerCase()}`}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 flex items-center justify-between"
            >
              <span className="text-lg font-medium capitalize">
                {genreTrMap[genre] || genre.toLowerCase().replace(/_/g, " ")}
              </span>
              <span className="ml-2 px-2 py-0.5 rounded bg-kuzey-blue text-white text-xs font-bold">
                0
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Normal çalışma zamanında veritabanı sorgularını yap
  const mangaCounts = await Promise.all(
    genres.map(async (genre) => {
      const count = await prisma.manga.count({
        where: { genres: { has: genre } },
      });
      return { genre, count };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Türler</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mangaCounts.map(({ genre, count }) => (
          <Link
            key={genre}
            href={`/genres/${genre.toLowerCase()}`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 flex items-center justify-between"
          >
            <span className="text-lg font-medium capitalize">
              {genreTrMap[genre] || genre.toLowerCase().replace(/_/g, " ")}
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-kuzey-blue text-white text-xs font-bold">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
} 