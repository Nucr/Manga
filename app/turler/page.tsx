import Link from 'next/link';

const categories = [
  'Aksiyon', 'Bilim Kurgu', 'Canavar', 'Dahi Mc', 'Doğa Üstü', 'Dövüş Sanatları', 'Dram',
  'Fantastik', 'Fantezi', 'Gender Bender', 'Geri Dönüş', 'Gizem', 'Harem', 'Hayattan Kesit',
  'Horror', 'İntikam', 'Josei', 'Komedi', 'Korku', 'Macera', 'Murim', 'Okul Yaşamı',
  'Psikolojik', 'Reenkarnasyon', 'Romantik', 'Romantizm', 'Seinen', 'Shoujo', 'Shounen',
  'Tarihi', 'Trajedi'
];

async function getAllManga() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/manga`, { cache: 'no-store' });
  return res.json();
}

export default async function TurlerPage() {
  const allManga = await getAllManga();
  return (
    <div className="min-h-screen bg-[#181a20] text-white">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Türler</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => {
            const count = allManga.filter((manga: any) =>
              manga.genres?.some((g: string) =>
                g.trim().toLowerCase() === cat.trim().toLowerCase()
              )
            ).length;
            return (
              <Link
                key={cat}
                href={`/tur/${encodeURIComponent(cat.toLowerCase())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#23263a] rounded-lg p-4 text-center font-semibold hover:bg-kuzey-dark transition"
              >
                <span>{cat}</span>
                <span className="ml-2 bg-[#353a50] px-2 py-0.5 rounded text-xs">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 