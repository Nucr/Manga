import { MangaGenre } from "@prisma/client";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function GenreDetailPage({
  params,
}: {
  params: { genre: string };
}) {
  const genre = params.genre.toUpperCase() as MangaGenre;

  const mangas = await prisma.manga.findMany({
    where: {
      genres: {
        has: genre,
      },
    },
    orderBy: {
      views: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {genre.toLowerCase().replace(/_/g, " ")} Türündeki Seriler
      </h1>
      
      {mangas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Bu türde henüz seri bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mangas.map((manga) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.slug}`}
              className="group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                {manga.coverImage ? (
                  <Image
                    src={manga.coverImage}
                    alt={manga.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="mt-2 text-sm font-medium line-clamp-2">
                {manga.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 