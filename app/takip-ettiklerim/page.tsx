"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface Manga {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
}

export default function FollowedMangaPage() {
  const { data: session, status } = useSession();
  const [followedManga, setFollowedManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowedManga = async () => {
      if (!session?.user?.id) {
        setError("Lütfen giriş yapın.");
        setLoading(false);
        return;
      }

      try {
        // TODO: Implement this API endpoint
        const res = await fetch(`/api/user/${session.user.id}/followed-manga`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setFollowedManga(data);
      } catch (e: any) {
        setError("Takip edilen mangalar yüklenemedi: " + e.message);
        console.error("Failed to fetch followed manga:", e);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchFollowedManga();
    } else if (status === 'unauthenticated') {
       setError("Lütfen giriş yapın.");
       setLoading(false);
    }

  }, [session, status]);

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8 text-center">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Hata: {error}</div>;
  }

  if (!session) {
     return <div className="container mx-auto px-4 py-8 text-center text-yellow-500">Bu sayfayı görüntülemek için giriş yapmalısınız.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Takip Ettiklerim</h1>
      
      {followedManga.length === 0 ? (
        <div className="text-center text-gray-500">Henüz takip ettiğiniz bir manga bulunmuyor.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* TODO: Display manga list items here */}
          {followedManga.map(manga => (
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