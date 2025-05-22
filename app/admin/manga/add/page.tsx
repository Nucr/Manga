'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AddMangaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validate required fields
      const requiredFields = ['title', 'slug', 'description', 'author', 'artist', 'status', 'coverImage', 'genres'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`${field} alanı zorunludur`);
        }
      }

      const response = await fetch('/api/manga', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Manga eklenirken bir hata oluştu');
      }

      toast.success('Manga başarıyla eklendi');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Yeni Manga Ekle</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Başlık
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Açıklama
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            Yazar
          </label>
          <input
            type="text"
            id="author"
            name="author"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-gray-700">
            Çizer
          </label>
          <input
            type="text"
            id="artist"
            name="artist"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Durum
          </label>
          <select
            id="status"
            name="status"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ONGOING">Devam Ediyor</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="HIATUS">Ara Verildi</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
            Kapak Resmi
          </label>
          <input
            type="file"
            id="coverImage"
            name="coverImage"
            accept="image/*"
            required
            onChange={handleCoverChange}
            className="mt-1 block w-full"
          />
          {coverPreview && (
            <div className="mt-2">
              <img
                src={coverPreview}
                alt="Kapak önizleme"
                className="h-48 w-32 object-cover rounded"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="genres" className="block text-sm font-medium text-gray-700">
            Türler
          </label>
          <select
            id="genres"
            name="genres"
            multiple
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="action">Aksiyon</option>
            <option value="adventure">Macera</option>
            <option value="comedy">Komedi</option>
            <option value="drama">Drama</option>
            <option value="fantasy">Fantastik</option>
            <option value="horror">Korku</option>
            <option value="mystery">Gizem</option>
            <option value="romance">Romantik</option>
            <option value="sci-fi">Bilim Kurgu</option>
            <option value="slice-of-life">Günlük Yaşam</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
} 