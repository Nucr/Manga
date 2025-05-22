"use client";
import { useEffect, useState } from "react";
import DisqusThread from "./DisqusThread";
import Link from "next/link";

export default function MangaDetailClient({ manga }: { manga: any }) {
  useEffect(() => {
    fetch(`/api/manga/${manga.id}/view`, { method: "POST" });
    // En son okunan bölümü localStorage'dan al
    const lastReadChapter = localStorage.getItem(`lastRead_${manga.id}`);
    if (lastReadChapter) {
      setSelectedChapter(lastReadChapter);
    }
  }, [manga.id]);

  // Bölüm arama ve filtreleme
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const filteredChapters = manga.chapters?.filter((ch: any) =>
    ch.number.toString().includes(search.trim()) ||
    (ch.title && ch.title.toLowerCase().includes(search.trim().toLowerCase()))
  ) || [];

  // Önerilen seriler için state
  const [suggested, setSuggested] = useState<any[]>([]);

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

  // Bölüme tıklandığında localStorage'a kaydet
  const handleChapterClick = (chapterId: string) => {
    setSelectedChapter(chapterId);
    localStorage.setItem(`lastRead_${manga.id}`, chapterId);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Kapak ve başlık */}
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
        </div>
      </div>
      {/* Bölümler listesi */}
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

      {/* Önerilen Seriler */}
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
      {/* Disqus Yorumları */}
      <DisqusThread
        identifier={manga.id}
        title={manga.title}
        url={`https://YOUR_DOMAIN_HERE/manga/${manga.slug}`}
      />
    </div>
  );
} 