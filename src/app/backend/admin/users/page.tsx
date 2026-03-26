"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar 
} from "lucide-react";
import { toast } from "react-toastify";

// Type definition berdasarkan Schema Prisma kita
interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  roles: { id: string, name: string } | null;
}

interface Role {
  id: string;
  name: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    role_id: "",
    is_active: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backend/users");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      setUsers(json.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/backend/role");
      const json = await res.json();
      if (res.ok) {
        // Karena endpoint /api/backend/role mengembalikan Array langsung 
        setRoles(Array.isArray(json) ? json : (json.data || []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: "", full_name: "", email: "", password: "", phone_number: "", role_id: "", is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setFormData({
      id: user.id,
      full_name: user.full_name || "",
      email: user.email,
      password: "", // Jangan tampilkan password lama untuk keamanan
      phone_number: user.phone_number || "",
      role_id: user.roles?.id || "",
      is_active: user.is_active
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = modalMode === "edit";
      const url = isEdit ? `/api/backend/users/${formData.id}` : "/api/backend/users";
      const method = isEdit ? "PUT" : "POST";
      
      const payload: any = { ...formData };
      if (isEdit && !payload.password) {
        delete payload.password; // Hindari mengirim password kosong jika tidak diubah
      }
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan data");
      
      toast.success(json.message || `User berhasil ${isEdit ? "selesai diedit" : "ditambahkan"}`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sistem akses untuk user ${name}?`)) return;

    try {
      const res = await fetch(`/api/backend/users/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus user");
      
      toast.success("User berhasil dihapus");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(term) ||
      (user.full_name && user.full_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data, role, dan hak akses staf atau pengguna sistem.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tambah User Baru
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan email atau nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Kontak Info</th>
                <th className="px-6 py-4">Otoritas Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    <div className="flex justify-center items-center gap-2">
                       <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></span>
                       Memuat data pengguna...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    Tidak ada data user yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.full_name || "Tanpa Nama"}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            Join {new Date(user.created_at).toLocaleDateString("id-ID")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone_number ? (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {user.phone_number}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-gray-300" />
                            Belum diset
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-50 text-purple-700 font-medium text-[11px] uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {user.roles?.name || "GUEST"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Aktif
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-medium text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Nonaktif
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.full_name || user.email)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-500/20"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !submitting && setIsModalOpen(false)} 
          />
          <div className="relative bg-white rounded-xl md:rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] md:max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 md:px-6 md:py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 text-base md:text-lg">
                {modalMode === "add" ? "Tambah User Baru" : "Edit Data User"}
              </h3>
              <button 
                type="button"
                onClick={() => !submitting && setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 md:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Kolom Kiri */}
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.full_name} 
                        onChange={e => setFormData({...formData, full_name: e.target.value})} 
                        placeholder="Mis. Bambang Pamungkas" 
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all" 
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Email Utama</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        placeholder="bambang@domain.com" 
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all" 
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Nomor Telepon</label>
                      <input 
                        type="tel" 
                        value={formData.phone_number} 
                        onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                        placeholder="0812345678" 
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all" 
                      />
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Otoritas Role</label>
                      <select 
                        value={formData.role_id} 
                        onChange={e => setFormData({...formData, role_id: e.target.value})} 
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white transition-all text-gray-900"
                      >
                        <option value="">-- Tidak ada --</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                        Kata Sandi 
                        {modalMode === "edit" && <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Kosongkan jika tidak berubah</span>}
                      </label>
                      <input 
                        required={modalMode === "add"} 
                        type="password" 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        placeholder="••••••••" 
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all" 
                      />
                    </div>

                    {/* Toggle isActive */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.is_active} 
                            onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                          />
                          <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 leading-none">Status Akun Aktif</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 md:px-6 md:py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50 rounded-b-xl md:rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={submitting}
                  className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Menyimpan...
                    </>
                  ) : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UsersPage;