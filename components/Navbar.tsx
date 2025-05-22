"use client";

import Link from 'next/link';
import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';

const categories = [
  'Aksiyon', 'Bilim Kurgu', 'Canavar', 'Dahi Mc', 'Doğa Üstü', 'Dövüş Sanatları', 'Dram',
];

export default function Navbar({ allManga = [] }: { allManga?: any[] }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-kuzey-blue shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <span className="font-bold text-xl tracking-wide text-white">MangaSite</span>
          </Link>
        </div>
        <ul className="flex gap-6 font-semibold text-white items-center">
          <li><Link href="/" className="hover:text-kuzey-ice">Ana Sayfa</Link></li>
          <li><Link href="/manga" className="hover:text-kuzey-ice">Seriler</Link></li>
          <li><Link href="/genres" className="hover:text-kuzey-ice">Türler</Link></li>
        </ul>
        <div className="relative flex items-center gap-4">
          <div className="relative hidden md:block">
            <input type="text" placeholder="Arama" className="rounded-full px-4 py-1 bg-[#23263a] text-white focus:outline-none" />
            <span className="absolute right-3 top-1.5 text-gray-400">🔍</span>
          </div>
          {/* Profil ikonu ve menü */}
          <div className="relative">
            <button
              className="ml-4 text-white text-3xl focus:outline-none hover:text-kuzey-ice transition"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Profil Menüsü"
            >
              <FaUserCircle />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                {!session ? (
                  <>
                    <Link href="/auth/signin" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Giriş Yap</Link>
                    <Link href="/auth/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Kayıt Ol</Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profil</Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >Çıkış Yap</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 