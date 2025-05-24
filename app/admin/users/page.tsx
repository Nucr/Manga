"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBook, FaUsers, FaChartLine, FaCog } from 'react-icons/fa';
import { User } from '@prisma/client';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users'); // Kullanıcıları çekeceğimiz API route
        if (!response.ok) {
          throw new Error('Kullanıcılar alınamadı');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    // Silme işlemi burada yapılacak
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  if (loading) return <div>Yükleniyor...</div>;

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
          <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition bg-gray-700/50 text-white">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <Link href="/admin/users/new" className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            <FaPlus className="mr-2" />
            Yeni Kullanıcı Ekle
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* User List */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">E-posta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'USER' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <Link href={`/admin/users/edit/${user.id}`} className="text-blue-400 hover:text-blue-300">
                          <FaEdit />
                        </Link>
                        <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(user.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Toplam {users.length} kullanıcı
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">Önceki</button>
            <button className="px-3 py-1 rounded-lg bg-blue-600">1</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">2</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">3</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition">Sonraki</button>
          </div>
        </div>
      </div>
    </main>
  );
} 