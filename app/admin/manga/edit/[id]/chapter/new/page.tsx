'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function NewChapterPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pages, setPages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Görselleri base64'e çevir
      const pageImages = await Promise.all(
        pages.map(file => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }))
      );
      const body = {
        number: parseFloat(number),
        title,
        content,
        pages: pageImages.map((img, idx) => ({ number: idx + 1, imageUrl: img })),
      };
      const res = await fetch(`/api/manga/${id}/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Bölüm eklenemedi');
      router.push(`/admin/manga/edit/${id}`);
    } catch (err) {
      alert('Bölüm eklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Yeni Bölüm Ekle</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#181c2f] p-8 rounded-2xl shadow-xl border border-kuzey-blue/20">
        <div>
          <label className="block text-sm font-semibold text-kuzey-blue mb-1">Bölüm No</label>
          <input type="number" value={number} onChange={e => setNumber(e.target.value)} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-kuzey-blue mb-1">Başlık</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-kuzey-blue mb-1">İçerik</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} required rows={3} className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-kuzey-blue mb-1">Sayfa Görselleri</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full rounded-lg border border-kuzey-blue/30 bg-[#23263a] text-white px-4 py-2" />
          <div className="flex flex-wrap gap-2 mt-2">
            {pages.map((file, idx) => (
              <span key={idx} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{file.name}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition font-semibold">İptal</button>
          <button type="submit" disabled={loading} className="px-8 py-2 rounded-lg bg-kuzey-blue text-white font-bold shadow hover:bg-blue-700 transition text-lg">
            {loading ? 'Ekleniyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 