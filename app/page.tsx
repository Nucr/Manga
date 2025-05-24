"use client";
import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import LatestManga from '@/components/LatestManga';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { MangaGenre } from "@prisma/client";
import LayoutWithNavbar from '@/components/LayoutWithNavbar';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';

const categories = [
  'Aksiyon', 'Bilim Kurgu', 'Canavar', 'Dahi Mc', 'Doğa Üstü', 'Dövüş Sanatları', 'Dram',
];

const featured = {
  title: 'Kuzeyin Kılıcı',
  rating: 8.7,
  type: 'Manhwa',
  genres: ['Aksiyon', 'Dövüş Sanatları', 'Macera', 'Romantik', 'Shounen'],
  desc: 'Kuzeyin Kılıcı, (Legend of the Northern Blade): Dünya karanlığa gömüldüğünde, dövüş sanatçıları "Kuzey Gökçe Mezhebi"ni kurmak üzere toplandı. insanlar bu...',
  image: 'https://i.imgur.com/1Q9Z1Zm.jpg',
};

const onePieceCover = 'https://cdn.myanimelist.net/images/manga/3/55539.jpg';

const suggestionTabs = [
  'Dövüş Sanatları', 'Komedi', 'Macera', 'Reenkarnasyon', 'Seinen',
];

const lastReleased = [
  {
    slug: 'sss-sinifi-intihar-avcısı',
    title: 'SSS Sınıfı İntihar Avcısı',
    chapters: [137, 136, 135],
    image: onePieceCover,
    flag: '🇰🇷',
    time: '22 dakika önce',
    ongoing: true,
  },
  {
    slug: 'ben-o-kişi-değilim',
    title: 'Ben O Kişi Değilim',
    chapters: [78, 77],
    image: onePieceCover,
    flag: '🇰🇷',
    time: '20 saat önce',
    ongoing: true,
  },
  // ... diğerleri ...
];

const popularSeries = [
  {
    slug: 'nihayetin-ardindaki-baslangic',
    title: 'Nihayetin Ardındaki Başlangıç',
    genres: 'Aksiyon, Doğa Üstü, Dövüş Sanatları, Dram, Fantastik, Macera, Shounen',
    rating: 8.5,
    image: onePieceCover,
  },
  {
    slug: 'bilge-okuyucunun-bakis-acisi',
    title: 'Bilge Okuyucunun Bakış Açısı',
    genres: 'Aksiyon, Doğa Üstü, Dram, Fantastik, Gizem, Macera, Shounen',
    rating: 8.7,
    image: onePieceCover,
  },
  // ... diğerleri ...
];

const alphabet = ['#', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

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
const genres = Object.values(MangaGenre);
const statuses = Object.keys(statusTrMap);
const types = Object.keys(typeTrMap);

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} saniye önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

function useReadChapters() {
  const [read, setRead] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('readChapters') || '[]');
  });
  useEffect(() => {
    localStorage.setItem('readChapters', JSON.stringify(read));
  }, [read]);
  const markAsRead = (id: string) => {
    setRead((prev) => prev.includes(id) ? prev : [...prev, id]);
  };
  const isRead = (id: string) => read.includes(id);
  return { markAsRead, isRead };
}

function useDailyRandomManga(allManga: any[], count: number, key: string) {
  const [selected, setSelected] = useState<any[]>([]);
  useEffect(() => {
    if (!allManga || allManga.length === 0) return;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    const now = Date.now();
    // Filtre: localStorage'daki ID'ler gerçekten allManga'da var mı?
    const validIds = saved.ids ? saved.ids.filter((id: string) => allManga.some(m => m.id === id)) : [];
    if (
      saved.timestamp &&
      now - saved.timestamp < 24 * 60 * 60 * 1000 &&
      validIds.length === count
    ) {
      setSelected(allManga.filter(m => validIds.includes(m.id)));
    } else {
      const shuffled = [...allManga].sort(() => 0.5 - Math.random());
      const ids = shuffled.slice(0, count).map(m => m.id);
      setSelected(shuffled.slice(0, count));
      localStorage.setItem(key, JSON.stringify({ ids, timestamp: now }));
    }
  }, [allManga, count, key]);
  return selected;
}

export default function Home({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [activeTab, setActiveTab] = useState(0);
  const [lastChapters, setLastChapters] = useState<any[]>([]);
  const [allManga, setAllManga] = useState<any[]>([]);
  const [popularSeries, setPopularSeries] = useState<any[]>([]);
  const { markAsRead, isRead } = useReadChapters();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.page as string) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.search as string || '');
  const [initialLoad, setInitialLoad] = useState(true);

  // allManga'nın gerçekten bir dizi olduğundan emin ol
  const safeAllManga = Array.isArray(allManga) ? allManga : [];

  // Günlük rastgele öneriler
  const todaysPicks = useDailyRandomManga(safeAllManga, 5, 'todaysPicksSet');
  const suggestionManga = useDailyRandomManga(safeAllManga, 5, 'suggestionSet');

  useEffect(() => {
    fetch('/api/last-chapters')
      .then(res => res.json())
      .then(data => setLastChapters(data));
    fetch('/api/manga')
      .then(res => res.json())
      .then(data => setAllManga(data));
    fetch('/api/manga?sort=views&limit=10')
      .then(res => res.json())
      .then(data => setPopularSeries(data));
  }, []);

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/manga?page=${currentPage}&search=${searchQuery}`);
        if (!response.ok) {
          throw new Error('Manga listesi alınamadı');
        }
        const data = await response.json();
        setMangaList(data.manga);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message);
        setMangaList([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    fetchManga();
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // Arama yapınca her zaman ilk sayfaya dön
    const form = e.currentTarget;
    const input = form.elements.namedItem('search') as HTMLInputElement;
    setSearchQuery(input.value);
  };

  const filteredManga = selectedCategory
    ? safeAllManga.filter(manga =>
        manga.genres?.some((g: string) =>
          g.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        )
      )
    : safeAllManga;

  const safePopularSeries = Array.isArray(popularSeries) ? popularSeries : [];

  return (
    <LayoutWithNavbar>
      <div className="min-h-screen bg-[#181a20] text-white">
        <Navbar allManga={allManga} />
        {/* Banner/Slider */}
        <div className="w-full h-[200px] sm:h-[260px] relative overflow-hidden bg-gradient-to-r from-red-500 to-orange-500">
          <Image
            src="/banner-anime.jpg"
            alt="Banner"
            layout="fill"
            objectFit="cover"
            quality={80}
            priority
            className="opacity-50"
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 sm:px-10">
            {/* Banner başlığı ve açıklaması buradaydı, kaldırıldı veya öne çıkan manga bilgileri ile değiştirildi */}
          </div>
        </div>

        {/* Kategoriler */}
        {/* Kategoriler barı kaldırıldı */}

        {/* Bugünün Seçmeleri */}
        <div className="max-w-6xl mx-auto mt-8">
          <h3 className="text-xl font-bold mb-3 bg-kuzey-dark px-4 py-2 rounded-t">Önerilen Seriler</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 bg-[#23263a] px-4 rounded-b">
            {todaysPicks.length === 0 ? (
              <div className="text-gray-400 py-8">Önerilen seriler bulunamadı.</div>
            ) : (
              todaysPicks.map((manga, i) => (
                <Link href={`/manga/${manga.slug}`} key={manga.id} className="min-w-[160px] bg-kuzey-light/90 rounded-lg p-2 flex flex-col items-center shadow-md">
                  <div className="relative">
                    <img src={manga.coverImage || '/default-cover.png'} alt={manga.title} className="w-28 h-40 object-cover rounded mb-2 border-2 border-kuzey-dark" />
                  </div>
                  <span className="font-bold text-kuzey-blue text-center text-base leading-tight drop-shadow">{manga.title}</span>
                  <span className="text-sm text-white font-semibold mt-1">Bölüm {manga.chapters?.length ? manga.chapters[0]?.number : '-'}</span>
                  <span className="text-sm text-yellow-400 font-bold mt-1">★ {manga.rating || '-'}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Öneri */}
        {/* Bu bölümü kaldırıyorum */}
        {/* <div className="max-w-6xl mx-auto mt-8">
          <h3 className="text-xl font-bold mb-3 bg-kuzey-dark px-4 py-2 rounded-t">Öneri</h3>
          <div className="flex gap-2 mb-4 bg-[#23263a] px-4 py-2 rounded-b">
            {suggestionTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-1 rounded font-semibold transition ${activeTab === i ? 'bg-kuzey-blue text-white' : 'bg-[#353a50] text-gray-300 hover:bg-kuzey-dark'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 bg-[#23263a] px-4 rounded-b">
            {suggestionManga.map((manga, i) => (
              <Link href={`/manga/${manga.slug}`} key={manga.id} className="min-w-[160px] bg-kuzey-light/90 rounded-lg p-2 flex flex-col items-center shadow-md">
                <div className="relative">
                  <img src={manga.coverImage || '/default-cover.png'} alt={manga.title} className="w-28 h-40 object-cover rounded mb-2 border-2 border-kuzey-dark" />
                </div>
                <span className="font-bold text-kuzey-dark text-center text-sm leading-tight">{manga.title}</span>
                <span className="text-xs text-gray-700">Bölüm {manga.chapters?.length ? manga.chapters[manga.chapters.length-1]?.number : '-'}</span>
                <span className="text-xs text-yellow-600">★ {manga.rating || '-'}</span>
              </Link>
            ))}
          </div>
        </div> */}

        {/* Son Yayımlananlar ve Sağ Sidebar */}
        <div className="max-w-6xl mx-auto mt-4 sm:mt-8 px-4 sm:px-0 flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Son Yayımlananlar */}
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold mb-3 bg-kuzey-dark px-4 py-2 rounded-t">Son Yayımlananlar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredManga.map((manga) => (
                <div key={manga.id} className="bg-[#23243a] rounded-lg p-3 sm:p-4 flex flex-row items-center shadow-md gap-3 sm:gap-4">
                  {/* Sol: Kapak ve bayrak */}
                  <div className="relative group flex flex-col items-center mr-2 sm:mr-4">
                    <Link href={`/manga/${manga.slug}`}>
                      <img src={manga.coverImage || '/default-cover.png'} className="w-16 h-24 sm:w-20 sm:h-28 rounded object-cover group-hover:scale-105 transition" alt={manga.title} />
                      {manga.flag && (
                        <span className="absolute top-1 right-1 text-xl sm:text-2xl drop-shadow">{manga.flag}</span>
                      )}
                    </Link>
                  </div>
                  {/* Sağ: Başlık, bölümler, durum */}
                  <div className="flex-1 flex flex-col gap-1">
                    <Link href={`/manga/${manga.slug}`} className="font-bold text-white text-base sm:text-lg mb-1 hover:text-kuzey-blue transition line-clamp-1">
                      {manga.title}
                    </Link>
                    <div className="flex flex-col gap-1 mb-2">
                      {manga.chapters?.slice(0,3).map((ch: any) => (
                        <div key={ch.id} className="flex items-center justify-between text-xs sm:text-sm">
                          <Link href={`/manga/${manga.slug}/chapter/${ch.number}`} className="text-kuzey-blue font-semibold hover:underline">Bölüm {ch.number}</Link>
                          <span className="text-gray-400">{timeAgo(ch.createdAt)}</span>
                        </div>
                      ))}
                      {(!manga.chapters || manga.chapters.length === 0) && (
                        <div className="text-xs text-gray-400">Henüz bölüm yok.</div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${manga.status === 'ONGOING' ? 'bg-orange-600 text-white' : manga.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{statusTrMap[manga.status]}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredManga.length === 0 && <div className="text-gray-400">Bu kategoride manga yok.</div>}
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-4 sm:mt-6">
              <button className="bg-kuzey-blue hover:bg-blue-700 text-white font-bold py-2 px-4 sm:px-6 rounded-full shadow transition text-base sm:text-lg">Sonrakİ &gt;</button>
            </div>
          </div>
          {/* Sağ Sidebar */}
          <div className="w-full lg:w-[320px] flex flex-col gap-4 sm:gap-6">
            {/* Detaylı Arama */}
            <div className="bg-[#181a20] rounded-2xl p-4 sm:p-5 shadow-xl border border-[#23263a]">
              <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg text-blue-300">Detaylı Arama</h4>
              <form
                className="flex flex-col gap-2 sm:gap-3 mb-2"
                onSubmit={handleSearch}
              >
                <select name="genre" className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm">
                  <option value="">Tüm Tür</option>
                  {genres.map(g => (
                    <option key={g} value={g}>{genreTrMap[g]}</option>
                  ))}
                </select>
                <select name="status" className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm">
                  <option value="">Durum Hepsi</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{statusTrMap[s]}</option>
                  ))}
                </select>
                <select name="type" className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm">
                  <option value="">Tür Hepsi</option>
                  {types.map(t => (
                    <option key={t} value={t}>{typeTrMap[t]}</option>
                  ))}
                </select>
                <input name="search" type="text" placeholder="Arama..." className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-blue-200 text-sm" />
                <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-400 transition text-base sm:text-lg tracking-wide mt-2">Arama</button>
              </form>
            </div>
            {/* Popüler Seriler */}
            <div className="bg-[#23263a] rounded-lg p-3 sm:p-4">
              <h4 className="font-bold mb-2 text-base sm:text-lg">Popüler Seriler</h4>
              <ul className="flex flex-col gap-2">
                {safePopularSeries.map((serie: any, i: number) => (
                  <Link href={`/manga/${serie.slug}`} key={serie.id} className="flex gap-2 items-center">
                    <span className="text-base sm:text-lg font-bold w-5 text-right">{i+1}</span>
                    <img src={serie.coverImage || '/default-cover.png'} alt={serie.title} className="w-8 h-12 sm:w-10 sm:h-14 object-cover rounded" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-kuzey-ice truncate max-w-[120px] sm:max-w-[180px]">{serie.title}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[180px]">{serie.genres?.join(', ')}</span>
                      <span className="text-xs text-yellow-600">👁️ {serie.views || 0}</span>
                    </div>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer ve A-Z Listesi */}
        <footer className="mt-12 bg-kuzey-blue py-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
            {/* Linkler */}
            <div className="flex gap-4 flex-wrap justify-center">
              <a href="#" className="text-white font-semibold hover:underline">Discord</a>
              <a href="#" className="text-white font-semibold hover:underline">Gizlilik Sözleşmesi</a>
              <a href="#" className="text-white font-semibold hover:underline">Çerez Politikası</a>
            </div>
            {/* A-Z Listesi */}
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {alphabet.map((l, i) => (
                <button key={i} className="bg-[#23263a] text-white px-3 py-1 rounded font-bold hover:bg-kuzey-dark transition text-xs">{l}</button>
              ))}
            </div>
            {/* Copyright ve yasal uyarı */}
            <div className="text-xs text-center text-white/80 mt-2">
              Telif haklarının ihlal edildiğini düşünüyorsanız bizimle <a href="mailto:ohuseyineray@gmail.com" className="underline">ohuseyineray@gmail.com</a> üzerinden iletişime geçebilirsiniz.
            </div>
          </div>
        </footer>
      </div>
    </LayoutWithNavbar>
  );
}
