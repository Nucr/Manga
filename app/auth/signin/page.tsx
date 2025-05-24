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
      {/* <div className="absolute inset-0 bg-[url('/anime-bg.jpg')] bg-cover bg-center opacity-10"></div> */}
      
      {/* Animasyonlu şekiller */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-kuzey-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-kuzey-blue to-kuzey-purple rounded-lg blur-lg opacity-20"></div>
        <div className="relative bg-[#23263a] p-8 rounded-lg shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Giriş Yap</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm sm:text-base font-medium text-gray-300 mb-1">Kullanıcı Adı veya E-posta</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#181a20] border border-[#353a50] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kuzey-blue focus:border-transparent transition text-sm sm:text-base"
                placeholder="kullanici_adi veya ornek@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-300 mb-1">Şifre</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#181a20] border border-[#353a50] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kuzey-blue focus:border-transparent transition text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-kuzey-blue to-blue-600 text-white font-bold py-2 sm:py-2.5 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-500 transition text-sm sm:text-base"
            >
              Giriş Yap
            </button>
          </form>
          {error && (
            <div className="mt-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-400">
              Hesabınız yok mu?{' '}
              <Link href="/auth/register" className="text-kuzey-blue hover:text-blue-400 font-medium transition">
                Kayıt Ol
              </Link>
            </p>
          </div>
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