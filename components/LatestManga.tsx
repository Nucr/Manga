'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Manga {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  status: string;
  createdAt: string;
}

export default function LatestManga() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await fetch('/api/manga');
        if (!response.ok) {
          throw new Error('Mangalar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setMangas(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#23263a] px-4 py-4 rounded-b">
      {mangas.map((manga) => (
        <Link href={`/manga/${manga.slug}`} key={manga.id} className="flex gap-4 bg-kuzey-light/90 rounded-lg p-2 shadow-md">
          <img src={manga.coverImage || '/default-cover.png'} alt={manga.title} className="w-20 h-28 object-cover rounded border-2 border-kuzey-dark" />
          <div className="flex flex-col justify-between">
            <span className="font-bold text-kuzey-dark text-sm">{manga.title}</span>
            <span className="text-xs text-gray-400">
              {new Date(manga.createdAt).toLocaleDateString('tr-TR')}
            </span>
            {manga.status === 'Devam Ediyor' && (
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded w-fit">
                Ongoing
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 