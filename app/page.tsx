"use client";
import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import LatestManga from '@/components/LatestManga';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { MangaGenre } from "@prisma/client";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [lastChapters, setLastChapters] = useState<any[]>([]);
  const [allManga, setAllManga] = useState<any[]>([]);
  const [popularSeries, setPopularSeries] = useState<any[]>([]);
  const { markAsRead, isRead } = useReadChapters();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

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

  const filteredManga = selectedCategory
    ? safeAllManga.filter(manga =>
        manga.genres?.some((g: string) =>
          g.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        )
      )
    : safeAllManga;

  const safePopularSeries = Array.isArray(popularSeries) ? popularSeries : [];

  return (
    <div className="min-h-screen bg-[#181a20] text-white">
      <Navbar allManga={allManga} />
      {/* Banner/Slider */}
      <div className="relative w-full h-[260px] bg-black flex items-end" style={{backgroundImage:`url('${featured.image}')`, backgroundSize:'cover', backgroundPosition:'center'}}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-[#181a20cc] to-transparent" />
        <div className="relative z-10 px-10 pb-6">
          <h2 className="text-3xl font-bold mb-2">{featured.title}</h2>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="bg-gray-800 px-2 py-0.5 rounded text-sm font-bold">{featured.rating}</span>
            <span className="text-sm">Tür: {featured.type}</span>
            {featured.genres.map(g => <span key={g} className="text-xs bg-kuzey-blue/80 px-2 py-0.5 rounded-full">{g}</span>)}
          </div>
          <p className="max-w-2xl text-sm text-gray-200">{featured.desc}</p>
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
      <div className="max-w-6xl mx-auto mt-8 flex flex-col lg:flex-row gap-8">
        {/* Son Yayımlananlar */}
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-3 bg-kuzey-dark px-4 py-2 rounded-t">Son Yayımlananlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredManga.map((manga) => (
              <div key={manga.id} className="bg-[#23243a] rounded-lg p-4 flex flex-row items-center shadow-md gap-4">
                {/* Sol: Kapak ve bayrak */}
                <div className="relative group flex flex-col items-center mr-4">
                  <Link href={`/manga/${manga.slug}`}>
                    <img src={manga.coverImage || '/default-cover.png'} className="w-20 h-28 rounded object-cover group-hover:scale-105 transition" alt={manga.title} />
                    {manga.flag && (
                      <span className="absolute top-1 right-1 text-2xl drop-shadow">{manga.flag}</span>
                    )}
                  </Link>
                </div>
                {/* Sağ: Başlık, bölümler, durum */}
                <div className="flex-1 flex flex-col gap-1">
                  <Link href={`/manga/${manga.slug}`} className="font-bold text-white text-lg mb-1 hover:text-kuzey-blue transition">
                    {manga.title}
                  </Link>
                  <div className="flex flex-col gap-1 mb-2">
                    {manga.chapters?.slice(0,3).map((ch: any) => (
                      <div key={ch.id} className="flex items-center justify-between text-sm">
                        <Link href={`/manga/${manga.slug}/chapter/${ch.number}`} className="text-kuzey-blue font-semibold hover:underline">Bölüm {ch.number}</Link>
                        <span className="text-gray-400">{timeAgo(ch.createdAt)}</span>
                      </div>
                    ))}
                    {(!manga.chapters || manga.chapters.length === 0) && (
                      <div className="text-xs text-gray-400">Henüz bölüm yok.</div>
                    )}
                  </div>
                  <div className="mt-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${manga.status === 'ONGOING' ? 'bg-orange-600 text-white' : manga.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{statusTrMap[manga.status]}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredManga.length === 0 && <div className="text-gray-400">Bu kategoride manga yok.</div>}
          </div>
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <button className="bg-kuzey-blue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow transition text-lg">Sonrakİ &gt;</button>
          </div>
        </div>
        {/* Sağ Sidebar */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          {/* Detaylı Arama */}
          <div className="bg-[#181a20] rounded-2xl p-5 shadow-xl border border-[#23263a]">
            <h4 className="font-bold mb-4 text-lg text-blue-300">Detaylı Arama</h4>
            <form
              className="flex flex-col gap-3 mb-2"
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const genre = form.genre.value;
                const status = form.status.value;
                const type = form.type.value;
                const search = form.search.value;
                const params = new URLSearchParams();
                if (genre) params.append('genre', genre);
                if (status) params.append('status', status);
                if (type) params.append('type', type);
                if (search) params.append('search', search);
                router.push(`/manga?${params.toString()}`);
              }}
            >
              <select name="genre" className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="">Tüm Tür</option>
                {genres.map(g => (
                  <option key={g} value={g}>{genreTrMap[g]}</option>
                ))}
              </select>
              <select name="status" className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="">Durum Hepsi</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{statusTrMap[s]}</option>
                ))}
              </select>
              <select name="type" className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="">Tür Hepsi</option>
                {types.map(t => (
                  <option key={t} value={t}>{typeTrMap[t]}</option>
                ))}
              </select>
              <input name="search" type="text" placeholder="Arama..." className="rounded-lg px-3 py-2 bg-[#23263a] text-white border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-blue-200" />
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-400 transition text-lg tracking-wide mt-2">Arama</button>
            </form>
          </div>
          {/* Popüler Seriler */}
          <div className="bg-[#23263a] rounded-lg p-4">
            <h4 className="font-bold mb-2">Popüler Seriler</h4>
            <ul className="flex flex-col gap-2">
              {safePopularSeries.map((serie: any, i: number) => (
                <Link href={`/manga/${serie.slug}`} key={serie.id} className="flex gap-2 items-center">
                  <span className="text-lg font-bold w-5 text-right">{i+1}</span>
                  <img src={serie.coverImage || '/default-cover.png'} alt={serie.title} className="w-10 h-14 object-cover rounded" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-kuzey-ice truncate max-w-[120px]">{serie.title}</span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{serie.genres?.join(', ')}</span>
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
          <div className="flex gap-4 flex-wrap justify-center">
            <a href="#" className="text-white font-semibold hover:underline">Discord</a>
            <a href="#" className="text-white font-semibold hover:underline">Gizlilik Sözleşmesi</a>
            <a href="#" className="text-white font-semibold hover:underline">Çerez Politikası</a>
          </div>
          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {alphabet.map((l, i) => (
              <button key={i} className="bg-[#23263a] text-white px-3 py-1 rounded font-bold hover:bg-kuzey-dark transition text-xs">{l}</button>
            ))}
          </div>
          <div className="text-xs text-center text-white/80 mt-2">
            Bu mangaların hepsi siteye ikinci bir dilden çevriliyor. Herhangi bir karakter adı farklılığı veya teknik farklılığı olabilir.<br/>
            Yasal Uyarı: Bu sitede yayımlananlar noveler tanıtım amaçlıdır. Eğer bulunduğunuz bölgede novellerin satışı mevcutsa lütfen satın alın. Telif haklarının ihlal edildiğini düşünüyorsanız bizimle <a href="mailto:ohuseyineray@gmail.com" className="underline">ohuseyineray@gmail.com</a> üzerinden iletişime geçebilirsiniz.
          </div>
        </div>
      </footer>
    </div>
  );
}
