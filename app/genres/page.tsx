import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const PRISMA_MANGA_GENRES = [
  "ACTION",
  "ADVENTURE",
  "COMEDY",
  "DRAMA",
  "FANTASY",
  "HORROR",
  "MYSTERY",
  "ROMANCE",
  "SCIFI",
  "SLICE_OF_LIFE",
  "SUPERNATURAL",
  "THRILLER",
  "SPORTS",
  "ECCHI",
  "HAREM",
  "ISEKAI",
  "MECHA",
  "PSYCHOLOGICAL",
  "SHOUNEN",
  "SHOUJO",
  "SEINEN",
  "JOSEI",
  "YAOI",
  "YURI",
  "GENDER_BENDER",
  "HISTORICAL",
  "MAGICAL",
  "MARTIAL_ARTS",
  "MUSIC",
  "SCHOOL",
  "VAMPIRE",
  "ZOMBIE",
  "FINAL",
] as const;

const genreTrMap: Record<typeof PRISMA_MANGA_GENRES[number], string> = {
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
  GENDER_BENDER: "Cinsiyet Değişimi",
  HISTORICAL: "Tarihi",
  MAGICAL: "Büyü",
  MARTIAL_ARTS: "Dövüş Sanatları",
  MUSIC: "Müzik",
  SCHOOL: "Okul",
  VAMPIRE: "Vampir",
  ZOMBIE: "Zombi",
  FINAL: "Final",
};

export default async function GenresPage() {
  const genres = PRISMA_MANGA_GENRES;

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
  } else {
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
} 