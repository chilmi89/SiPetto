"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search,
  ChevronLeft, 
  ChevronRight,
  Filter,
  Loader2,
  Trash2,
  Edit
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

interface Role {
  id: string;
  name: string;
  created_at: string;
}

const getRoleStyle = (name: string) => {
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    { bg: "bg-blue-100 text-blue-600" },
    { bg: "bg-purple-100 text-purple-600" },
    { bg: "bg-emerald-100 text-emerald-600" },
    { bg: "bg-orange-100 text-orange-600" },
    { bg: "bg-rose-100 text-rose-600" },
  ];
  const style = colors[hash % colors.length];
  const initial = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return { style, initial };
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backend/role");
      if (!response.ok) throw new Error("Gagal mengambil data peran");
      const data = await response.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/backend/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menambah peran");
      }

      setNewRoleName("");
      setIsModalOpen(false);
      toast.success("Peran berhasil ditambahkan!");
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambah peran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Master Data</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 tracking-tightest font-heading uppercase">Daftar Peran</h1>
          <p className="text-xs font-bold text-zinc-400">Kelola informasi dasar dan metadata peran sistem.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-6 py-3.5 rounded-xl text-xs font-black transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Tambah Peran
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama peran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-zinc-300"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-5 py-3.5 bg-white border border-zinc-100 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">
            <Filter className="w-3.5 h-3.5" />
            Urutkan
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Nama Peran</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Dibuat Pada</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-zinc-100 rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-zinc-100 rounded" />
                          <div className="h-3 w-20 bg-zinc-50 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-16 bg-zinc-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-20 bg-zinc-100 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-rose-500">
                      <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                      <button onClick={() => fetchRoles()} className="text-[10px] underline font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest">Coba Lagi</button>
                    </div>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <ShieldCheck className="w-12 h-12 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest leading-none">Tidak ada peran ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => {
                  const { style, initial } = getRoleStyle(role.name);
                  return (
                    <tr key={role.id} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <Link href={`/backend/admin/rbac/roles/${role.id}`} className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center font-black text-sm tracking-tight border border-black/5 shadow-inner`}>
                            {initial}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-zinc-800 tracking-tight">{role.name}</p>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Detail & Izin</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-zinc-500">
                          {new Date(role.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-black tracking-tight text-emerald-500 uppercase">
                            Aktif
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/backend/admin/rbac/roles/${role.id}`}
                            className="p-2 text-zinc-400 hover:text-primary transition-all rounded-xl hover:bg-white hover:shadow-sm active:scale-90"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-zinc-400 hover:text-rose-500 transition-all rounded-xl hover:bg-white hover:shadow-sm active:scale-90">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Pagination (Visual Only for now) */}
       {!loading && !error && filteredRoles.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-800 transition-all">
               <ChevronLeft className="w-4 h-4" />
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20">
               1
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-800 transition-all">
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
       )}

       {/* Modal Tambah Peran */}
       {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-[#030037]/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-zinc-100">
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-800 tracking-tight font-heading uppercase">Buat Peran Baru</h3>
                  <p className="text-xs font-bold text-zinc-400">Tentukan nama peran untuk mengatur hak akses pengguna.</p>
                </div>
                
                <form onSubmit={handleAddRole} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nama Peran</label>
                    <input 
                      autoFocus
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Contoh: Administrator Toko"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-black text-zinc-950 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-zinc-300 shadow-inner"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting || !newRoleName.trim()}
                      className="flex-[2] px-8 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : "Simpan Peran"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
       )}
    </div>
  );
}