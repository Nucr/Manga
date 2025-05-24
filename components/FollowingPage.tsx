'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaBookmark, FaArrowRight, FaStar } from 'react-icons/fa';

interface Manga {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  status: string;
  type: string;
  rating: number;
  chapters: {
    number: number;
    id: string;
  }[];
  isFavorite?: boolean;
}

interface Following {
  manga: Manga;
  createdAt: string;
  isFavorite?: boolean;
}

export default function FollowingPage() {
  const { data: session } = useSession();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await fetch('/api/user/following');
        if (!res.ok) {
          throw new Error('Takip edilen mangalar alınamadı');
        }
        const data = await res.json();
        setFollowing(data);
      } catch (err) {
        setError('Takip edilen mangalar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchFollowing();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const filteredFollowing = following.filter(item => {
    if (filter === 'favorites') {
      return item.isFavorite === true;
    } else {
      return true; // 'all' filtresi için hepsi
    }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Takip Ettiğim Mangalar</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'all' ? 'bg-kuzey-blue text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Hepsi
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'favorites' ? 'bg-kuzey-blue text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Favoriler
          </button>
          <Link
            href="/manga"
            className="inline-flex items-center px-4 py-2 bg-kuzey-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            <FaBookmark className="mr-2" />
            Manga Listesi
          </Link>
        </div>
      </div>

      {filteredFollowing.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-400 mb-4">
            {filter === 'favorites' ? 'Favori manganız yok' : 'Henüz takip ettiğiniz manga yok'}
          </h2>
          <Link
            href="/manga"
            className="inline-flex items-center px-6 py-3 bg-kuzey-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            Manga Keşfet
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFollowing.map(({ manga }) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.slug}`}
              className="group bg-[#23263a] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={manga.coverImage || '/default-cover.png'}
                  alt={manga.title}
                  className="w-full h-full object-cover"
                />
                {manga.isFavorite && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full text-xs">
                    <FaStar />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {manga.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{manga.type}</span>
                  <span>★ {manga.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                {manga.chapters[0] && (
                  <div className="mt-2 text-sm text-kuzey-blue">
                    Son Bölüm: {manga.chapters[0].number}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 