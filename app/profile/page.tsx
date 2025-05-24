"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [username, setUsername] = useState(session?.user?.username || "");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(session?.user?.profileImage || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [changeAnim, setChangeAnim] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log('API response data:', data);
      if (data.url) {
        console.log('New profile image URL:', data.url);
        setProfileImage(data.url);
        setMessage("Profil fotoğrafı güncellendi.");
        update();
      } else {
        console.log('API response did not contain a URL:', data);
        setMessage("Yükleme başarısız oldu.");
      }
    } catch {
      console.error('Image upload error');
      setMessage("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, profileImage }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profil başarıyla güncellendi.");
        update();
      } else {
        setMessage(data.error || "Bir hata oluştu.");
      }
    } catch {
      setMessage("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Profil Ayarları</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <Image
              src={profileImage || "/default-avatar.png"}
              alt="Profil Fotoğrafı"
              fill
              className="rounded-full object-cover border-2 border-purple-400"
            />
            <button
              type="button"
              className={`absolute bottom-0 right-0 bg-purple-500 text-white rounded-full p-1 text-xs transition-all duration-200 ${changeAnim ? 'bg-purple-700 scale-95' : ''}`}
              onClick={() => {
                setChangeAnim(true);
                setTimeout(() => setChangeAnim(false), 300);
                fileInputRef.current?.click();
              }}
            >
              Değiştir
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-800 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İsim</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-800 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-800 text-white"
            placeholder="••••••••"
          />
        </div>
        {message && <div className="text-center text-sm text-purple-400">{message}</div>}
        <div className="flex gap-4">
           <Link href="/" className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-semibold text-center shadow-lg hover:bg-gray-700 transition-all duration-300">
              Ana Sayfa
           </Link>
           <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:from-purple-600 hover:to-purple-500 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
        </div>
      </form>
    </div>
  );
} 