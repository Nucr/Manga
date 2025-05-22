"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Status, MangaType, MangaGenre } from "@prisma/client";
import { FaArrowLeft, FaBook, FaChartLine, FaCog } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Chapter tipi tanımla
interface Chapter {
  number: string;
  title: string;
  content: string;
  pages: { imageUrl: string }[];
}

const genreTrMap: Record<string, string> = {
  ACTION: "Aksiyon",
  ADVENTURE: "Macera",
  COMEDY: "Komedi",
  DRAMA: "Drama",
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
  ISEKAI: "Isekai",
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

export default function NewManga() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    author: "",
    artist: "",
    status: "ONGOING" as Status,
    type: "MANGA" as MangaType,
    genres: [] as MangaGenre[],
    coverImage: "",
    summary: "",
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const handleAddChapter = () => {
    setChapters([...chapters, { number: '', title: '', content: '', pages: [] }]);
  };
  const handleRemoveChapter = (idx: number) => {
    setChapters(chapters.filter((_, i) => i !== idx));
  };
  const handleChapterChange = (idx: number, field: string, value: string) => {
    setChapters(chapters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch));
  };
  const handlePageFilesChange = (chapterIdx: number, files: FileList | null) => {
    if (!files) return;
    const fileReaders: Promise<{ imageUrl: string }>[] = Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ imageUrl: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    Promise.all(fileReaders).then(images => {
      setChapters(chapters => chapters.map((ch, i) =>
        i === chapterIdx ? { ...ch, pages: [...ch.pages, ...images] } : ch
      ));
    });
  };
  const handleRemovePage = (chapterIdx: number, pageIdx: number) => {
    setChapters(chapters => chapters.map((ch, i) =>
      i === chapterIdx ? { ...ch, pages: ch.pages.filter((_, j) => j !== pageIdx) } : ch
    ));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/manga', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          chapters: chapters
            .filter(ch => ch.title && ch.number)
            .map(ch => ({
              ...ch,
              number: parseFloat(ch.number),
              pages: ch.pages
            }))
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Manga eklenirken bir hata oluştu');
      }

      toast.success('Manga başarıyla eklendi!');
      router.push('/admin/manga');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genre: MangaGenre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Dosya boyutu 50MB'dan büyük olamaz!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
      setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

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
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaCog className="mr-3" />
            Ayarlar
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center mb-8">
          <Link href="/admin/manga" className="flex items-center text-gray-400 hover:text-white transition mr-4">
            <FaArrowLeft className="mr-2" />
            Geri Dön
          </Link>
          <h1 className="text-3xl font-bold">Yeni Manga Ekle</h1>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Manga Başlığı
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Örn: One Piece"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Örn: one-piece"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Yazar
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Örn: Eiichiro Oda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Çizer
                </label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Örn: Eiichiro Oda"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tür
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MangaType })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="MANGA">Manga</option>
                  <option value="MANHWA">Manhwa</option>
                  <option value="MANHUA">Manhua</option>
                  <option value="NOVEL">Novel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="ONGOING">Devam Ediyor</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="HIATUS">Ara Verildi</option>
                  <option value="CANCELLED">İptal Edildi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Türler
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(MangaGenre)
                  .filter(genre => genre !== "GENDER_BENDER")
                  .map((genre) => (
                    <label key={genre} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="genres"
                        checked={formData.genres.includes(genre)}
                        onChange={() => handleGenreChange(genre)}
                        className="rounded bg-gray-700/50 border-gray-600"
                      />
                      <span className="text-sm">{genreTrMap[genre] || genre}</span>
                    </label>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Özet
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                placeholder="Manga özeti..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bölümler (İsteğe Bağlı)
              </label>
              {chapters.map((ch, idx) => (
                <div key={idx} className="mb-4 p-4 bg-gray-700/30 rounded-lg flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Bölüm No"
                      value={ch.number}
                      onChange={e => handleChapterChange(idx, 'number', e.target.value)}
                      className="w-24 px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Bölüm Başlığı"
                      value={ch.title}
                      onChange={e => handleChapterChange(idx, 'title', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
                    />
                    <button type="button" onClick={() => handleRemoveChapter(idx)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Sil</button>
                  </div>
                  <textarea
                    placeholder="Bölüm İçeriği"
                    value={ch.content}
                    onChange={e => handleChapterChange(idx, 'content', e.target.value)}
                    className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
                  />
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sayfalar (Görseller)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handlePageFilesChange(idx, e.target.files)}
                      className="mb-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      {ch.pages.map((page, pageIdx) => (
                        <div key={pageIdx} className="relative group">
                          <img
                            src={page.imageUrl}
                            alt={`Bölüm ${ch.number} Sayfa ${pageIdx + 1}`}
                            className="h-24 w-16 object-cover rounded border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePage(idx, pageIdx)}
                            className="absolute top-0 right-0 bg-red-700 text-xs text-white rounded px-1 py-0.5 opacity-80 group-hover:opacity-100"
                            title="Sayfayı Sil"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddChapter} className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 mt-2">Bölüm Ekle</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kapak Resmi
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Kapak Resmi URL"
              />
              <div className="mt-2">
                <img
                  src={coverPreview || formData.coverImage || '/default-cover.png'}
                  alt="Kapak Önizleme"
                  className="h-32 w-24 object-cover rounded border border-gray-600"
                  onError={e => (e.currentTarget.src = '/default-cover.png')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/manga" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                İptal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                {loading ? "Ekleniyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 