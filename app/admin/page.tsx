"use client";

import Link from 'next/link';
import { FaBook, FaUsers, FaChartLine, FaCog, FaPlus, FaUserPlus, FaFileAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [actLoading, setActLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('İstatistikler alınamadı');
        setLoading(false);
      });
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setActLoading(false);
      })
      .catch(() => setActLoading(false));
  }, []);

  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} saniye önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaChartLine className="mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/manga" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaBook className="mr-3" />
            Manga Yönetimi
          </Link>
          <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaUsers className="mr-3" />
            Kullanıcı Yönetimi
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition">
            <FaCog className="mr-3" />
            Ayarlar
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Toplam Manga</h3>
            <p className="text-3xl font-bold">
              {loading ? '...' : error ? '-' : stats?.mangaCount ?? '-'}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Aktif Kullanıcılar</h3>
            <p className="text-3xl font-bold">
              {loading ? '...' : error ? '-' : stats?.userCount ?? '-'}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Bugünkü Ziyaret</h3>
            <p className="text-3xl font-bold">
              {loading ? '...' : error ? '-' : stats?.todayViews ?? '-'}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Yeni Bölümler</h3>
            <p className="text-3xl font-bold">
              {loading ? '...' : error ? '-' : stats?.todayChapters ?? '-'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
            <div className="space-y-4">
              <Link href="/admin/manga/new" className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-center transition">
                Yeni Manga Ekle
              </Link>
              <Link href="/admin/users/new" className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-center transition">
                Yeni Kullanıcı Ekle
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Son Aktiviteler</h2>
            <div className="space-y-3">
              {actLoading ? (
                <div className="text-gray-400">Yükleniyor...</div>
              ) : activities.length === 0 ? (
                <div className="text-gray-400">Aktivite yok.</div>
              ) : (
                activities.slice(0, 6).map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {act.type === 'manga' && <FaBook className="text-blue-400" />}
                      {act.type === 'user' && <FaUserPlus className="text-green-400" />}
                      {act.type === 'chapter' && <FaFileAlt className="text-purple-400" />}
                      <span>
                        {act.type === 'manga' && <>Yeni manga eklendi: <b>{act.title}</b></>}
                        {act.type === 'user' && <>Yeni kullanıcı kaydı: <b>{act.title}</b></>}
                        {act.type === 'chapter' && <>Yeni bölüm: <b>{act.title}</b></>}
                      </span>
                    </div>
                    <span className="text-gray-400">{timeAgo(act.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 