"use client";
import { useEffect, useState } from "react";
import DisqusThread from "./DisqusThread";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { FaBookmark, FaStar, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Manga {
  id: string;
  title: string;
  author: string;
  artist: string;
  status: string;
  genres: string[];
  description: string;
  coverImage: string;
  slug: string;
  chapters: {
    number: number;
    id: string;
  }[];
  rating: number | null;
}

interface FollowingRecord {
  id: string;
  userId: string;
  mangaId: string;
  manga: Manga;
  isFavorite: boolean;
}

interface UserRating {
  id: string;
  userId: string;
  mangaId: string;
  rating: number;
}

interface MangaDetailClientProps {
  manga: Manga;
}

export default function MangaDetailClient({ manga }: MangaDetailClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState<FollowingRecord | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(true);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(manga.rating);

  useEffect(() => {
    fetch(`/api/manga/${manga.id}/view`, { method: "POST" });
    const lastReadChapter = localStorage.getItem(`lastRead_${manga.id}`);
    if (lastReadChapter) {
      setSelectedChapter(lastReadChapter);
    }
  }, [manga.id]);

  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const filteredChapters = manga.chapters?.filter((ch: any) =>
    ch.number.toString().includes(search.trim()) ||
    (ch.title && ch.title.toLowerCase().includes(search.trim().toLowerCase()))
  ) || [];

  const [suggested, setSuggested] = useState<any[]>([]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user?.id || !manga?.id) {
        setIsFollowing(null);
        setLoadingFollow(false);
        return;
      }
      try {
        const res = await fetch(`/api/user/is-following?mangaId=${manga.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data);
        } else {
          console.error('Failed to check follow status', res.status);
          setIsFollowing(null);
        }
      } catch (e) {
        console.error('Error checking follow status:', e);
        setIsFollowing(null);
      } finally {
        setLoadingFollow(false);
      }
    };

    const fetchUserRating = async () => {
      if (!session?.user?.id || !manga?.id) {
        setUserRating(null);
        return;
      }
      try {
        const res = await fetch(`/api/user/${session.user.id}/ratings?mangaId=${manga.id}`);
        if (res.ok) {
          const data: UserRating | null = await res.json();
          setUserRating(data ? data.rating : null);
          setAverageRating(manga.rating);
        } else {
          console.error('Failed to fetch user rating', res.status);
          setUserRating(null);
        }
      } catch (e) {
        console.error('Error fetching user rating:', e);
        setUserRating(null);
      }
    };

    if (session?.user?.id && manga?.id) {
      checkFollowStatus();
      fetchUserRating();
    } else if (!session?.user?.id) {
      setIsFollowing(null);
      setLoadingFollow(false);
    }
  }, [session, manga.id]);

  const handleFollowToggle = async () => {
    if (!session?.user?.id || !manga?.id || loadingFollow) return;

    setLoadingFollow(true);
    try {
      const res = await fetch('/api/user/toggle-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mangaId: manga.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data);
      } else {
        console.error('Failed to toggle follow status', res.status);
      }
    } catch (e) {
      console.error('Error toggling follow status:', e);
    } finally {
      setLoadingFollow(false);
    }
  };

  useEffect(() => {
    fetch('/api/manga')
      .then(res => res.json())
      .then(data => {
        const others = data.filter((m: any) => m.id !== manga.id);
        const shuffled = others.sort(() => 0.5 - Math.random());
        setSuggested(shuffled.slice(0, 5));
      });
  }, [manga.id]);

  const allChapters = filteredChapters.sort((a: any, b: any) => b.number - a.number);

  const handleChapterClick = (chapterId: string) => {
    setSelectedChapter(chapterId);
    localStorage.setItem(`lastRead_${manga.id}`, chapterId);
  };

  const handleFavoriteToggle = async () => {
    if (!session) return;
    if (!isFollowing) return;

    setLoadingFavorite(true);
    setFavoriteError(null);

    try {
      const res = await fetch('/api/user/toggle-favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mangaId: manga.id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Favori durumu güncellenirken bir hata oluştu');
      }

      const updatedRecord = await res.json();
      setIsFollowing(updatedRecord);

    } catch (err: any) {
      console.error('Favori durumu güncelleme hatası:', err);
      setFavoriteError(err.message || 'Favori durumu güncellenemedi');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleRating = async (ratingValue: number) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (!manga?.id || loadingRating) return;

    setLoadingRating(true);
    setRatingError(null);

    try {
      const res = await fetch(`/api/manga/${manga.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: ratingValue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Puan verilirken bir hata oluştu');
      }

      const result = await res.json();
      setUserRating(ratingValue);
      setAverageRating(result.averageRating);

    } catch (err: any) {
      console.error('Puan verme hatası:', err);
      setRatingError(err.message || 'Puan verilemedi');
    } finally {
      setLoadingRating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0">
          <img src={manga.coverImage} alt={manga.title} className="w-56 h-80 object-cover rounded-2xl shadow-lg border-4 border-kuzey-blue/30 hover:scale-105 transition" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold text-kuzey-blue drop-shadow mb-2">{manga.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-[#23263a] rounded-lg px-4 py-2 flex items-center gap-2 shadow">
              <span className="font-bold text-kuzey-blue">Yazar:</span> {manga.author}
            </div>
            <div className="bg-[#23263a] rounded-lg px-4 py-2 flex items-center gap-2 shadow">
              <span className="font-bold text-kuzey-blue">Çizer:</span> {manga.artist}
            </div>
            <div className="bg-[#23263a] rounded-lg px-4 py-2 flex items-center gap-2 shadow">
              <span className="font-bold text-kuzey-blue">Durum:</span> {manga.status}
            </div>
            {manga.genres && manga.genres.length > 0 && (
              <div className="bg-[#23263a] rounded-lg px-4 py-2 flex items-center gap-2 shadow">
                <span className="font-bold text-kuzey-blue">Türler:</span>
                {manga.genres.map((g: string) => (
                  <span key={g} className="bg-kuzey-blue/30 text-xs px-2 py-0.5 rounded-full text-white font-semibold">{g}</span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#23263a] rounded-xl p-4 mt-2 shadow text-gray-200 leading-relaxed">
            {manga.description}
          </div>
          
          <div className="flex gap-4 mt-4">
            {status === 'authenticated' ? (
              <div className="flex gap-4">
                <button 
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-center shadow-lg transition-all duration-300 ${
                    isFollowing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  } ${loadingFollow ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingFollow ? 'İşleniyor...' : isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                </button>

                {isFollowing && (
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={loadingFavorite}
                    className={
                      `px-6 py-3 rounded-lg text-white transition flex items-center justify-center ` +
                      `${isFollowing.isFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-700'} ` +
                      `${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`
                    }
                  >
                    {loadingFavorite ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : isFollowing.isFavorite ? (
                      <FaStar className="mr-2 text-white" />
                    ) : (
                      <FaStar className="mr-2 text-gray-300" />
                    )}
                    Favori
                  </button>
                )}

              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-center shadow-lg transition-all duration-300"
              >
                Takip Etmek İçin Giriş Yap
              </Link>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-bold text-white mb-2">Puan Ver ({averageRating?.toFixed(1) || 'N/A'}/10)</h3>
            {status === 'authenticated' ? (
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <FaStar
                      key={ratingValue}
                      className={
                        `cursor-pointer text-xl transition-colors ` +
                        `${(hoverRating || userRating || 0) >= ratingValue ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'}`
                      }
                      onClick={() => handleRating(ratingValue)}
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  );
                })}
                {loadingRating && <FaSpinner className="animate-spin ml-2 text-kuzey-blue" />}
                {ratingError && <span className="text-red-500 ml-2">{ratingError}</span>}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Puan vermek için lütfen <Link href="/auth/signin" className="text-kuzey-blue hover:underline">giriş yapın</Link>.</p>
            )}
          </div>
          
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">Bölümler</h2>
        <div
          style={{
            maxHeight: 300,
            paddingRight: 4,
          }}
          className="grid grid-cols-3 gap-4 bg-[#181a20] p-2 rounded overflow-y-auto scrollbar-thin scrollbar-thumb-[#353a50] scrollbar-track-[#181a20] hover:scrollbar-thumb-blue-700"
        >
          {allChapters.map((ch: any) => (
            <Link 
              key={ch.id} 
              href={`/manga/${manga.slug}/chapter/${ch.number}`} 
              className={`bg-[#23263a] rounded p-2 text-center cursor-pointer transition block ${
                selectedChapter === ch.id 
                  ? 'bg-kuzey-blue text-white' 
                  : 'hover:bg-kuzey-blue/20'
              }`}
              onClick={() => handleChapterClick(ch.id)}
            >
              <div className="font-bold">Bölüm {ch.number}</div>
              <div className="text-xs text-gray-400">{new Date(ch.createdAt).toLocaleDateString('tr-TR')}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-3 bg-kuzey-dark px-4 py-2 rounded-t">Önerilen Seriler</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 bg-[#23263a] px-4 rounded-b">
          {suggested.length === 0 ? (
            <div className="text-gray-400 py-8">Önerilen seriler bulunamadı.</div>
          ) : (
            suggested.map((manga) => (
              <a href={`/manga/${manga.slug}`} key={manga.id} className="min-w-[160px] bg-kuzey-light/90 rounded-lg p-2 flex flex-col items-center shadow-md">
                <div className="relative">
                  <img src={manga.coverImage || '/default-cover.png'} alt={manga.title} className="w-28 h-40 object-cover rounded mb-2 border-2 border-kuzey-dark" />
                </div>
                <span className="font-bold text-kuzey-blue text-center text-base leading-tight drop-shadow">{manga.title}</span>
                <span className="text-sm text-white font-semibold mt-1">Bölüm {manga.chapters?.length ? manga.chapters[0]?.number : '-'}</span>
                <span className="text-sm text-yellow-400 font-bold mt-1">★ {manga.rating || '-'}</span>
              </a>
            ))
          )}
        </div>
      </div>
      <DisqusThread
        identifier={manga.id}
        title={manga.title}
        url={`https://YOUR_DOMAIN_HERE/manga/${manga.slug}`}
      />
    </div>
  );
} 