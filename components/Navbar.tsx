"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaBars, FaTimes, FaSearch, FaUser, FaBookmark } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const categories = [
  'Aksiyon', 'Bilim Kurgu', 'Canavar', 'Dahi Mc', 'Doğa Üstü', 'Dövüş Sanatları', 'Dram',
];

export default function Navbar({ allManga = [] }: { allManga?: any[] }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Mobil menüyü kapatmak için
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sayfa değiştiğinde menüyü kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = allManga.filter(manga =>
        manga.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <nav className="bg-[#181a20] border-b border-[#23263a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-400">
            <img src="/site-logo.png" alt="Site Logo" className="h-16 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Ana Sayfa
            </Link>
            <Link href="/manga" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Seriler
            </Link>
            <Link href="/manga" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Türler
            </Link>
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-300 hover:text-white p-2">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="User Avatar" className="w-6 h-6 rounded-full" />
                  ) : (
                    <img src="/default_human.svg" alt="Default Avatar" className="w-6 h-6 rounded-full" />
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#23263a] rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#18a20] hover:text-white">
                      Profilim
                    </Link>
                     <Link href="/following" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#18a20] hover:text-white">
                      Takip Ettiklerim
                    </Link>
                     <Link href="/lists" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#18a20] hover:text-white">
                      Listelerim
                    </Link>
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#18a20] hover:text-white">
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative hidden md:block">
                 <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-300 hover:text-white p-2">
                    <img src="/default_human.svg" alt="Default Avatar" className="w-6 h-6 rounded-full" />
                 </button>
                 {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#23263a] rounded-md shadow-lg py-1 z-50">
                       <Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#18a20] hover:text-white">
                          Giriş Yap
                       </Link>
                       <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#18a20] hover:text-white">
                          Kayıt Ol
                       </Link>
                    </div>
                 )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="max-w-2xl mx-auto mt-20 px-4">
            <div className="bg-[#23263a] rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Manga ara..."
                  className="flex-1 bg-[#181a20] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-kuzey-blue"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((manga) => (
                    <Link
                      key={manga.id}
                      href={`/manga/${manga.slug}`}
                      className="flex items-center gap-3 p-2 hover:bg-[#181a20] rounded-lg transition"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <img
                        src={manga.coverImage || '/default-cover.png'}
                        alt={manga.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="text-white font-medium">{manga.title}</h3>
                        <p className="text-sm text-gray-400">
                          {manga.chapters?.length || 0} Bölüm
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-[#181a20] border-t border-[#23263a]">
          <Link
            href="/manga"
            className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            <FaBookmark className="w-5 h-5 mr-2" />
            Manga Listesi
          </Link>
          <Link
            href="/manga?type=MANHWA"
            className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            <FaBookmark className="w-5 h-5 mr-2" />
            Manhwa
          </Link>
          <Link
            href="/manga?type=MANGA"
            className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            <FaBookmark className="w-5 h-5 mr-2" />
            Manga
          </Link>
          <Link
            href="/auth/signin"
            className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            <img src="/default_human.svg" alt="Default Avatar" className="w-5 h-5 mr-2 rounded-full" />
            Giriş Yap
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            <img src="/default_human.svg" alt="Default Avatar" className="w-5 h-5 mr-2 rounded-full" />
            Kayıt Ol
          </Link>
        </div>
      </div>
    </nav>
  );
} 