"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search,
  Filter,
  Loader2,
  Trash2,
  Edit,
  ChevronRight,
  ShieldAlert,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

interface Permission {
  id: string;
  name: string;
  created_at: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backend/permission");
      if (!response.ok) throw new Error("Gagal mengambil data izin");
      const data = await response.json();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermissionName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/backend/permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPermissionName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menambah izin");
      }

      setNewPermissionName("");
      setIsCreateModalOpen(false);
      toast.success("Izin baru berhasil diregistrasi!");
      fetchPermissions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus izin ini? Aksi ini akan mempengaruhi matrix otoritas yang ada.")) return;

    try {
      const response = await fetch(`/api/backend/permission/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus izin");
      
      toast.success("Izin telah dihapus");
      fetchPermissions();
    } catch (err: any) {
      toast.error(err.message);
    }
  };



  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-1">
        <Link href="/backend/admin/rbac" className="hover:text-primary transition-all">RBAC Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary italic">Registri Izin</span>
      </div>

      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/20 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 bg-primary h-full opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-primary mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Otoritas Registry</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 tracking-tightest font-heading uppercase">Master Data Izin</h1>
          <p className="text-xs font-bold text-zinc-400">Kelola daftar kemampuan granular dalam ekosistem sistem.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-6 py-3.5 rounded-xl text-xs font-black transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest relative z-10"
        >
          <Plus className="w-4 h-4" />
          Tambah Izin
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Cari kemampuan/izin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-zinc-300"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Nama Kemampuan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Dibuat Pada</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center uppercase tracking-tightest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 w-48 bg-zinc-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-24 bg-zinc-100 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-rose-500">
                      <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                      <button onClick={() => fetchPermissions()} className="text-[10px] underline font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest">Coba Lagi</button>
                    </div>
                  </td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-zinc-400">
                    <ShieldAlert className="w-12 h-12 mx-auto opacity-10 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest leading-none">Tidak ada izin terdaftar</p>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 font-black text-xs border border-zinc-200 shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                             {permission.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-black text-zinc-800 tracking-tightest uppercase">{permission.name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                      {new Date(permission.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/backend/admin/rbac/permission/${permission.id}`}
                            className="p-2 text-zinc-300 hover:text-primary transition-all rounded-xl hover:bg-white hover:shadow-sm active:scale-95"
                          >
                             <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(permission.id)}
                            className="p-2 text-zinc-300 hover:text-rose-500 transition-all rounded-xl hover:bg-white hover:shadow-sm active:scale-95"
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#030037]/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
          />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-zinc-100">
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-zinc-800 tracking-tight font-heading uppercase">Registrasi Izin</h3>
                <p className="text-xs font-bold text-zinc-400">Deskripsikan kemampuan baru secara singkat.</p>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 underline decoration-primary/30 underline-offset-4">Identity String</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newPermissionName}
                    onChange={(e) => setNewPermissionName(e.target.value)}
                    placeholder="Contoh: create_post"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-black text-zinc-950 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-zinc-300 shadow-inner"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-all font-sans"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !newPermissionName.trim()}
                    className="flex-[2] px-8 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Simpan Izin
                      </>
                    )}
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