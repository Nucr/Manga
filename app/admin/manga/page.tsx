"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Status, MangaType } from "@prisma/client";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBook, FaUsers, FaChartLine, FaCog } from 'react-icons/fa';
import MangaCover from '../../../components/MangaCover';

type Genre = string;

interface Manga {
  id: string;
  title: string;
  slug: string;
  cover: string;
  status: Status;
  type: MangaType;
  genres: Genre[];
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  chapters?: any[];
}

export default function MangaManagement() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMangas();
  }, []);

  const fetchMangas = async () => {
    try {
      const response = await fetch('/api/manga');
      if (!response.ok) throw new Error('Mangalar yüklenemedi');
      const data = await response.json();
      setMangas(data);
    } catch (error) {
      console.error('Manga yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Bu mangayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/manga?slug=${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setMangas((prev) => prev.filter((m) => m.slug !== slug));
      } else {
        throw new Error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Silme işlemi sırasında hata:', error);
      alert('Silme işlemi başarısız!');
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case "ONGOING": return "Devam Ediyor";
      case "COMPLETED": return "Tamamlandı";
      case "HIATUS": return "Ara Verildi";
      case "CANCELLED": return "İptal Edildi";
      default: return status;
    }
  };

  const getTypeText = (type: MangaType) => {
    switch (type) {
      case "MANGA": return "Manga";
      case "MANHWA": return "Manhwa";
      case "MANHUA": return "Manhua";
      case "NOVEL": return "Novel";
      default: return type;
    }
  };

  const getGenreText = (genre: Genre) => {
    switch (genre) {
      case "ACTION": return "Aksiyon";
      case "ADVENTURE": return "Macera";
      case "COMEDY": return "Komedi";
      case "DRAMA": return "Drama";
      case "FANTASY": return "Fantastik";
      case "HORROR": return "Korku";
      case "MYSTERY": return "Gizem";
      case "ROMANCE": return "Romantik";
      case "SCIFI": return "Bilim Kurgu";
      case "SLICE_OF_LIFE": return "Günlük Yaşam";
      case "SUPERNATURAL": return "Doğaüstü";
      case "THRILLER": return "Gerilim";
      case "SPORTS": return "Spor";
      case "ECCHI": return "Ecchi";
      case "HAREM": return "Harem";
      case "ISEKAI": return "Isekai";
      case "MECHA": return "Mecha";
      case "PSYCHOLOGICAL": return "Psikolojik";
      case "SHOUNEN": return "Shounen";
      case "SHOUJO": return "Shoujo";
      case "SEINEN": return "Seinen";
      case "JOSEI": return "Josei";
      case "YAOI": return "Yaoi";
      case "YURI": return "Yuri";
      case "HISTORICAL": return "Tarihi";
      case "MAGICAL": return "Büyü";
      case "MARTIAL_ARTS": return "Dövüş Sanatları";
      case "MUSIC": return "Müzik";
      case "SCHOOL": return "Okul";
      case "VAMPIRE": return "Vampir";
      case "ZOMBIE": return "Zombi";
      default: return genre;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
      <div className="text-xl">Yükleniyor...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaChartLine className="mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/manga" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition bg-gray-700/50 text-white">
            <FaBook className="mr-3" />
            Manga Yönetimi
          </Link>
          <Link href="/" className="flex items-center px-6 py-3 text-gray-300 hover:bg-blue-700/50 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" />
            </svg>
            Siteye Git
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaCog className="mr-3" />
            Ayarlar
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manga Yönetimi</h1>
          <Link href="/admin/manga/new" className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            <FaPlus className="mr-2" />
            Yeni Manga Ekle
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Manga ara..."
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Manga List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Tüm Mangalar ({mangas.length})</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-[#23263a] text-white text-sm">
              <thead>
                <tr className="bg-[#181c2f] text-kuzey-blue">
                  <th className="px-4 py-3 text-left">Kapak</th>
                  <th className="px-4 py-3 text-left">Başlık</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Tür</th>
                  <th className="px-4 py-3 text-left">Durum</th>
                  <th className="px-4 py-3 text-left">Bölüm</th>
                  <th className="px-4 py-3 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {mangas.map((manga) => (
                  <tr key={manga.id} className="border-b border-gray-700 hover:bg-kuzey-blue/10 transition">
                    <td className="px-4 py-2">
                      <img src={manga.coverImage || '/default-cover.png'} alt={manga.title} className="w-12 h-16 object-cover rounded border border-kuzey-dark" />
                    </td>
                    <td className="px-4 py-2 font-bold">{manga.title}</td>
                    <td className="px-4 py-2 text-gray-400">{manga.slug}</td>
                    <td className="px-4 py-2">
                      <span className="inline-block bg-blue-700/80 text-xs px-2 py-0.5 rounded text-white font-semibold mr-1">{getTypeText(manga.type)}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {manga.genres?.map((g: string) => (
                          <span key={g} className="bg-kuzey-dark text-xs text-white px-2 py-0.5 rounded-full">{getGenreText(g)}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-block bg-gray-700 text-xs px-2 py-0.5 rounded text-white font-semibold">{getStatusText(manga.status)}</span>
                    </td>
                    <td className="px-4 py-2 text-center">{manga.chapters?.length || 0}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Link href={`/admin/manga/edit/${manga.id}`} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold text-xs">Düzenle</Link>
                      <button onClick={() => handleDelete(manga.slug)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white font-semibold text-xs">Sil</button>
                    </td>
                  </tr>
                ))}
                {mangas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">Hiç manga bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Toplam {mangas.length} manga
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">Önceki</button>
            <button className="px-3 py-1 rounded-lg bg-blue-600">1</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">2</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">3</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">Sonraki</button>
          </div>
        </div>
      </div>
    </main>
  );
} 