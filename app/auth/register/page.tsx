'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (res.ok) {
        router.push('/auth/signin?registered=true');
      } else {
        const data = await res.json();
        setError(data.message || 'Kayıt işlemi başarısız oldu');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181a20] relative overflow-hidden">
      {/* Anime tarzı arka plan efektleri */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent"></div>
      <div className="absolute inset-0 bg-[url('/anime-bg.jpg')] bg-cover bg-center opacity-10"></div>
      
      {/* Animasyonlu şekiller */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-kuzey-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-[#23263a]/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-purple-400 mb-2 animate-fade-in">
              Kayıt Ol
            </h2>
            <p className="text-gray-400">Manga dünyasına katılın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full pl-10 px-4 py-3 bg-[#181a20] border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                  placeholder="Kullanıcı Adı"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 px-4 py-3 bg-[#181a20] border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                  placeholder="Şifre"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-10 px-4 py-3 bg-[#181a20] border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                  placeholder="Şifreyi Tekrarla"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:from-purple-600 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kayıt yapılıyor...
                </span>
              ) : (
                'Kayıt Ol'
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
              >
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 