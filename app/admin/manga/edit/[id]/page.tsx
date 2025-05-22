'use client';

import React, { use, useRef } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Link from 'next/link';
import { Status, MangaType, MangaGenre } from '@prisma/client';
import JSZip from 'jszip';

interface Page {
  id: string;
  number: number;
  imageUrl: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: Page[];
  createdAt?: string;
}

interface Manga {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  artist: string;
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED';
  coverImage: string;
  genres: string[];
  chapters: Chapter[];
}

interface BulkChapter {
  number: number;
  title: string;
  files: File[];
  zipFile?: File;
}

export default function EditMangaPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [manga, setManga] = useState<Manga | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulkUploadMode, setBulkUploadMode] = useState(false);
  const [bulkChapters, setBulkChapters] = useState<BulkChapter[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [bulkCount, setBulkCount] = useState(1);
  const parentDirInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(`/api/manga/${id}`);
        if (!response.ok) {
          throw new Error('Manga bulunamadı');
        }
        const data = await response.json();
        setManga(data);
        setCoverPreview(data.coverImage);
      } catch (error) {
        toast.error('Manga yüklenirken bir hata oluştu');
        router.push('/admin/manga');
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [id, router]);

  useEffect(() => {
    if (parentDirInputRef.current) {
      parentDirInputRef.current.setAttribute('webkitdirectory', '');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validate required fields
      const requiredFields = ['title', 'slug', 'description', 'author', 'artist', 'status', 'genres'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`${field} alanı zorunludur`);
        }
      }

      const response = await fetch(`/api/manga/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Manga güncellenirken bir hata oluştu');
      }

      toast.success('Manga başarıyla güncellendi');
      router.push('/admin/manga');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleChapterEdit = (chapterId: string) => {
    router.push(`/admin/manga/${id}/chapter/${chapterId}/edit`);
  };

  const handleChapterDelete = async (chapterId: string) => {
    if (!confirm('Bu bölümü silmek istediğinize emin misiniz?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/manga/${id}/chapter/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Bölüm silinirken bir hata oluştu');
      }

      // Manga verilerini yeniden yükle
      const mangaResponse = await fetch(`/api/manga/${id}`, { cache: 'no-store' });
      if (mangaResponse.ok) {
        const updatedManga = await mangaResponse.json();
        setManga(updatedManga);
        setSelectedChapter(null);
      }

      toast.success('Bölüm başarıyla silindi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpload = async (file: File) => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // ZIP içindeki dosyaları sırala
      const files = Object.values(zipContent.files)
        .filter(file => !file.dir && file.name.match(/\.(jpg|jpeg|png|gif)$/i))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (files.length === 0) {
        toast.error('ZIP dosyasında resim bulunamadı');
        return;
      }

      // Dosyaları File nesnelerine dönüştür
      const imageFiles = await Promise.all(
        files.map(async (file) => {
          const blob = await file.async('blob');
          return new File([blob], file.name, { type: 'image/jpeg' });
        })
      );

      // Yeni bölüm ekle
      const newChapter: BulkChapter = {
        number: bulkChapters.length + 1,
        title: `Bölüm ${bulkChapters.length + 1}`,
        files: imageFiles,
        zipFile: file
      };

      setBulkChapters([...bulkChapters, newChapter]);
      toast.success('ZIP dosyası başarıyla yüklendi');
    } catch (error) {
      toast.error('ZIP dosyası işlenirken bir hata oluştu');
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkChapters.length) {
      toast.error('Lütfen en az bir bölüm ekleyin');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Tüm chapter'ları hazırla
      const chaptersPayload = await Promise.all(
        bulkChapters.map(async (chapter) => {
          let pages: { imageUrl: string }[] = [];
          if (chapter.zipFile) {
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(chapter.zipFile);
            const files = Object.values(zipContent.files)
              .filter(file => !file.dir && file.name.match(/\.(jpg|jpeg|png|gif)$/i))
              .sort((a, b) => a.name.localeCompare(b.name));
            pages = await Promise.all(
              files.map(async (file) => {
                const base64 = await file.async('base64');
                return { imageUrl: `data:image/jpeg;base64,${base64}` };
              })
            );
          } else if (chapter.files) {
            pages = await Promise.all(
              chapter.files.map(async (file) => {
                return new Promise<{ imageUrl: string }>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve({ imageUrl: reader.result as string });
                  reader.readAsDataURL(file);
                });
              })
            );
          }
          return {
            number: chapter.number,
            title: chapter.title,
            content: chapter.title,
            pages: pages.map((p, idx) => ({ number: idx + 1, imageUrl: p.imageUrl }))
          };
        })
      );

      // Parça parça (20'lik gruplar halinde) yükle
      const chunkSize = 20;
      for (let i = 0; i < chaptersPayload.length; i += chunkSize) {
        const chunk = chaptersPayload.slice(i, i + chunkSize);
        const response = await fetch(`/api/manga/${id}/chapter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapters: chunk }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Bölümler yüklenirken hata oluştu');
        }
        setUploadProgress(Math.round(((i + chunk.length) / chaptersPayload.length) * 100));
      }

      // Manga verilerini yeniden yükle
      const mangaResponse = await fetch(`/api/manga/${id}`, { cache: 'no-store' });
      if (mangaResponse.ok) {
        const updatedManga = await mangaResponse.json();
        setManga(updatedManga);
      }

      toast.success('Tüm bölümler başarıyla yüklendi!');
      setBulkUploadMode(false);
      setBulkChapters([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bölümler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedChapters.length) {
      toast.error('Lütfen silinecek bölümleri seçin');
      return;
    }

    if (!confirm(`${selectedChapters.length} bölümü silmek istediğinize emin misiniz?`)) {
      return;
    }

    setLoading(true);

    try {
      for (const chapterId of selectedChapters) {
        const response = await fetch(`/api/manga/${id}/chapter/${chapterId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Bölüm silinirken bir hata oluştu');
        }
      }

      // Manga verilerini yeniden yükle
      const mangaResponse = await fetch(`/api/manga/${id}`, { cache: 'no-store' });
      if (mangaResponse.ok) {
        const updatedManga = await mangaResponse.json();
        setManga(updatedManga);
      }

      toast.success('Seçili bölümler başarıyla silindi');
      setSelectedChapters([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bölümler silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapterSelection = (chapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const addBulkChapter = () => {
    const newNumber = bulkChapters.length > 0
      ? Math.max(...bulkChapters.map(ch => ch.number)) + 1
      : 1;
    setBulkChapters([{ number: newNumber, title: `Bölüm ${newNumber}`, files: [] }, ...bulkChapters]);
  };

  const removeBulkChapter = (index: number) => {
    setBulkChapters(bulkChapters => bulkChapters.filter((_, i) => i !== index));
  };

  const updateBulkChapter = (index: number, field: 'number' | 'title' | 'files', value: any) => {
    const newChapters = [...bulkChapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setBulkChapters(newChapters);
  };

  // Directory upload handler
  const handleDirectoryUpload = (files: FileList, index: number) => {
    // Sadece resim dosyalarını al
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    // Dosyaları isimlerine göre sırala
    imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    // FileList yerine dizi olarak kaydet
    updateBulkChapter(index, 'files', imageFiles);
  };

  const createBulkChapters = () => {
    const start = bulkChapters.length > 0 ? Math.max(...bulkChapters.map(ch => ch.number)) + 1 : 1;
    const newChapters = Array.from({ length: bulkCount }, (_, i) => ({
      number: start + i,
      title: `Bölüm ${start + i}`,
      files: [],
    }));
    setBulkChapters([...newChapters, ...bulkChapters]);
  };

  // Helper: recursively get all files from a directory entry
  type EntryFile = { file: File; relativePath: string };
  const getFilesFromEntry = async (entry: any, path = ''): Promise<EntryFile[]> => {
    if (entry.isFile) {
      return new Promise(resolve => {
        entry.file((file: File) => resolve([{ file, relativePath: path + file.name }]));
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      return new Promise(resolve => {
        reader.readEntries(async (entries: any[]) => {
          const files = await Promise.all(entries.map(e => getFilesFromEntry(e, path + entry.name + '/')));
          resolve(files.flat());
        });
      });
    }
    return [];
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const items = e.dataTransfer.items;
    let allFiles: EntryFile[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
      if (entry) {
        const files = await getFilesFromEntry(entry);
        allFiles = allFiles.concat(files);
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) allFiles.push({ file, relativePath: file.name });
      }
    }
    // Klasörlü yükleme: relativePath ile alt klasörleri bul
    const folderMap: Record<string, File[]> = {};
    allFiles.forEach(({ file, relativePath }) => {
      const parts = relativePath.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        if (!folderMap[folder]) folderMap[folder] = [];
        folderMap[folder].push(file);
      } else {
        if (!folderMap['Bölüm 1']) folderMap['Bölüm 1'] = [];
        folderMap['Bölüm 1'].push(file);
      }
    });

    // Mevcut bölümlerin en yüksek numarasını bul
    const currentMaxChapter = Math.max(
      ...(manga?.chapters || []).map(ch => ch.number),
      ...bulkChapters.map(ch => ch.number),
      0
    );

    let idx = 1;
    const newChapters = Object.entries(folderMap).map(([folder, files]) => {
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      return {
        number: currentMaxChapter + idx++,
        title: folder,
        files,
      };
    });
    setBulkChapters([...newChapters, ...bulkChapters]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kuzey-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-400">Manga bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 shadow transition"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Geri Dön
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-kuzey-blue drop-shadow-lg">Manga Düzenle</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Card - Manga Bilgileri */}
        <div className="lg:col-span-2">
          <div className="bg-[#181c2f] rounded-2xl shadow-xl p-8 border border-kuzey-blue/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-kuzey-blue mb-1">Başlık</label>
                  <input type="text" id="title" name="title" defaultValue={manga.title} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50" />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-semibold text-kuzey-blue mb-1">Slug</label>
                  <input type="text" id="slug" name="slug" defaultValue={manga.slug} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="author" className="block text-sm font-semibold text-kuzey-blue mb-1">Yazar</label>
                  <input type="text" id="author" name="author" defaultValue={manga.author} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50" />
                </div>
                <div>
                  <label htmlFor="artist" className="block text-sm font-semibold text-kuzey-blue mb-1">Çizer</label>
                  <input type="text" id="artist" name="artist" defaultValue={manga.artist} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-kuzey-blue mb-1">Durum</label>
                  <select id="status" name="status" defaultValue={manga.status} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50">
                    <option value="ONGOING">Devam Ediyor</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="HIATUS">Ara Verildi</option>
                    <option value="CANCELLED">İptal Edildi</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="genres" className="block text-sm font-semibold text-kuzey-blue mb-1">Türler</label>
                  <select id="genres" name="genres" multiple defaultValue={manga.genres} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50">
                    <option value="ACTION">Aksiyon</option>
                    <option value="ADVENTURE">Macera</option>
                    <option value="COMEDY">Komedi</option>
                    <option value="DRAMA">Drama</option>
                    <option value="FANTASY">Fantastik</option>
                    <option value="HORROR">Korku</option>
                    <option value="MYSTERY">Gizem</option>
                    <option value="ROMANCE">Romantik</option>
                    <option value="SCIFI">Bilim Kurgu</option>
                    <option value="SLICE_OF_LIFE">Günlük Yaşam</option>
                    <option value="FINAL">Final</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-kuzey-blue mb-1">Açıklama</label>
                <textarea id="description" name="description" defaultValue={manga.description} required rows={4} className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2 focus:ring-2 focus:ring-kuzey-blue/50" />
              </div>
              <div>
                <label htmlFor="coverImage" className="block text-sm font-semibold text-kuzey-blue mb-1">Kapak Resmi</label>
                <input type="file" id="coverImage" name="coverImage" accept="image/*" onChange={handleCoverChange} className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2" />
                {coverPreview && (
                  <div className="mt-3 flex items-center gap-4">
                    <img src={coverPreview} alt="Kapak önizleme" className="h-40 w-28 object-cover rounded-lg border border-kuzey-blue/30 shadow" />
                    <span className="text-gray-400 text-sm">Önizleme</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition font-semibold">İptal</button>
                <button type="submit" disabled={isLoading} className="px-8 py-2 rounded-lg bg-kuzey-blue text-white font-bold shadow hover:bg-blue-700 transition text-lg">
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* Sağ Card - Bölüm Listesi */}
        <div className="lg:col-span-1">
          <div className="bg-[#181c2f] rounded-2xl shadow-xl p-6 border border-kuzey-blue/20 sticky top-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-kuzey-blue">Bölümler</h2>
              <Link href={`/admin/manga/edit/${id}/chapter/new`} className="flex items-center gap-2 px-3 py-1 rounded bg-kuzey-blue text-white hover:bg-blue-700 transition text-sm font-semibold shadow">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Yeni Bölüm
              </Link>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[#353a50] scrollbar-track-[#181c2f] hover:scrollbar-thumb-blue-700">
              {(sortOrder === 'asc' ? [...manga.chapters].reverse() : manga.chapters).map((chapter) => (
                <div
                  key={chapter.id}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col gap-1 ${selectedChapter?.id === chapter.id ? 'border-kuzey-blue bg-kuzey-blue/10 shadow-lg' : 'border-gray-700 hover:border-kuzey-blue/60 bg-[#23263a] hover:bg-kuzey-blue/5'}`}
                  onClick={() => handleChapterSelect(chapter)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-kuzey-blue">Bölüm {chapter.number}</h3>
                      <p className="text-xs text-gray-400">{chapter.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); handleChapterDelete(chapter.id); }} className="text-red-400 hover:text-red-200 p-1 rounded transition"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                  </div>
                  {selectedChapter?.id === chapter.id && (
                    <div className="mt-2 text-xs text-gray-300">
                      <p>{chapter.pages.length} sayfa</p>
                    </div>
                  )}
                </div>
              ))}
              {manga.chapters.length === 0 && (
                <div className="text-gray-400 text-center py-8">Henüz bölüm eklenmemiş.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-kuzey-blue">Bölümler</h2>
          <div className="flex gap-4">
            <button
              onClick={toggleSortOrder}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex items-center gap-2"
            >
              <FaSort />
              {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
            </button>
            <button
              onClick={() => setBulkUploadMode(!bulkUploadMode)}
              className="bg-kuzey-blue text-white px-4 py-2 rounded hover:bg-kuzey-blue/80 transition"
            >
              {bulkUploadMode ? 'Normal Moda Dön' : 'Toplu Yükleme Modu'}
            </button>
          </div>
        </div>

        {bulkUploadMode ? (
          <div className="bg-[#23263a] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-kuzey-blue">Toplu Bölüm Yükleme</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-4 mb-6">
                  <input
                    type="number"
                    min={1}
                    value={bulkCount}
                    onChange={e => setBulkCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-[#23232b] text-white rounded p-2 border border-kuzey-blue/30"
                    placeholder="Bölüm adedi"
                  />
                  <button
                    onClick={createBulkChapters}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
                  >
                    Toplu Bölüm Kutusu Oluştur
                  </button>
                  <label className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 transition cursor-pointer">
                    Ana Klasör Seç
                    <input
                      type="file"
                      ref={parentDirInputRef}
                      style={{ display: 'none' }}
                      multiple
                    />
                  </label>
                </div>
              </div>
            </div>

            <div
              className={`mb-6 p-8 rounded-xl border-2 border-dashed transition-all duration-200 ${isDragActive ? 'border-kuzey-blue bg-kuzey-blue/10' : 'border-gray-600 bg-[#23232b]'}`}
              onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
              onDrop={handleDrop}
            >
              <div className="text-center text-lg text-gray-300">
                <span className="font-bold text-kuzey-blue">Sürükle & Bırak</span> ile klasör veya dosyaları buraya bırakabilirsin.<br />
                Klasör bırakırsan her alt klasör otomatik bölüm olur.
              </div>
            </div>

            {bulkChapters.map((chapter, index) => (
              <div key={index} className="bg-[#181820] p-4 rounded-lg mb-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Bölüm Numarası</label>
                        <input
                          type="number"
                          value={chapter.number}
                          onChange={(e) => updateBulkChapter(index, 'number', parseInt(e.target.value))}
                          className="w-full bg-[#23232b] text-white rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Bölüm Başlığı</label>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => updateBulkChapter(index, 'title', e.target.value)}
                          className="w-full bg-[#23232b] text-white rounded p-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Klasör Seç (Tüm Sayfalar)</label>
                        <input
                          type="file"
                          ref={el => {
                            if (el) el.setAttribute('webkitdirectory', '');
                          }}
                          multiple
                          accept="image/*"
                          onChange={e => handleDirectoryUpload(e.target.files!, index)}
                          className="w-full bg-[#23232b] text-white rounded p-2"
                        />
                        {Array.isArray(chapter.files) && (
                          <p className="text-sm text-gray-400 mt-1">{chapter.files.length} sayfa (klasörden) seçildi</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">veya ZIP Dosyası</label>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleZipUpload(file);
                          }}
                          className="w-full bg-[#23232b] text-white rounded p-2"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBulkChapter(index)}
                    className="text-red-400 hover:text-red-200 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-[#23232b] rounded-full h-2.5">
                  <div
                    className="bg-kuzey-blue h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Yükleniyor: %{Math.round(uploadProgress)}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setBulkUploadMode(false);
                  setBulkChapters([]);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
              >
                İptal
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={loading || !bulkChapters.length}
                className="bg-kuzey-blue text-white px-6 py-2 rounded hover:bg-kuzey-blue/80 transition disabled:opacity-50"
              >
                {loading ? 'Yükleniyor...' : 'Tümünü Yükle'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedChapters.length > 0 && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-red-400">
                    {selectedChapters.length} bölüm seçildi
                  </p>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition"
                  >
                    Seçilenleri Sil
                  </button>
                </div>
              </div>
            )}
            
            {(sortOrder === 'asc' ? [...manga.chapters].reverse() : manga.chapters).map((chapter) => (
              <div
                key={chapter.id}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col gap-1 ${
                  selectedChapter?.id === chapter.id
                    ? 'border-kuzey-blue bg-kuzey-blue/10 shadow-lg'
                    : selectedChapters.includes(chapter.id)
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-kuzey-blue/60 bg-[#23263a] hover:bg-kuzey-blue/5'
                }`}
                onClick={() => handleChapterSelect(chapter)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedChapters.includes(chapter.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleChapterSelection(chapter.id);
                      }}
                      className="w-4 h-4 rounded border-gray-600 bg-[#23232b] text-kuzey-blue focus:ring-kuzey-blue"
                    />
                    <div>
                      <h3 className="font-semibold text-kuzey-blue">Bölüm {chapter.number}</h3>
                      <p className="text-xs text-gray-400">{chapter.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleChapterDelete(chapter.id);
                      }}
                      className="text-red-400 hover:text-red-200 p-1 rounded transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {selectedChapter?.id === chapter.id && (
                  <div className="mt-2 text-xs text-gray-300">
                    <p>{chapter.pages.length} sayfa</p>
                  </div>
                )}
              </div>
            ))}
            {manga.chapters.length === 0 && (
              <div className="text-gray-400 text-center py-8">
                Henüz bölüm eklenmemiş.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 