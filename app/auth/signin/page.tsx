'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
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
      <div className="absolute inset-0 bg-gradient-to-b from-kuzey-blue/20 to-transparent"></div>
      <div className="absolute inset-0 bg-[url('/anime-bg.jpg')] bg-cover bg-center opacity-10"></div>
      
      {/* Animasyonlu şekiller */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-kuzey-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-[#23263a]/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-kuzey-blue/20">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-kuzey-blue mb-2 animate-fade-in">
              Hoş Geldiniz!
            </h2>
            <p className="text-gray-400">Manga dünyasına adım atın</p>
            {registered && (
              <p className="mt-2 text-sm text-green-400 animate-bounce">
                Kayıt işlemi başarılı! Şimdi giriş yapabilirsiniz.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full pl-10 px-4 py-3 bg-[#181a20] border-2 border-kuzey-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-kuzey-blue transition-all duration-300"
                  placeholder="Kullanıcı Adı"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-kuzey-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="w-full pl-10 px-4 py-3 bg-[#181a20] border-2 border-kuzey-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-kuzey-blue transition-all duration-300"
                  placeholder="Şifre"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-kuzey-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="w-full py-3 px-4 bg-gradient-to-r from-kuzey-blue to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-kuzey-blue transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-kuzey-blue hover:text-blue-400 transition-colors duration-300"
              >
                Hesabınız yok mu? Kayıt olun
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
} 