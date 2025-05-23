'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  params: any;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ChapterEditPage({ params }: Props) {
  const router = useRouter();
  const { id, chapterId } = params;
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bu bölümü silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/manga/${id}/chapter/${chapterId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Bölüm silinemedi');
      router.push(`/admin/manga/edit/${id}`);
    } catch (err) {
      alert('Bölüm silinemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Bölüm Sil</h1>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-8 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition text-lg"
      >
        {loading ? 'Siliniyor...' : 'Bu Bölümü Sil'}
      </button>
    </div>
  );
} 