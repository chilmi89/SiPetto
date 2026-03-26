"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Edit3
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

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

export default function RoleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch(`/api/backend/role/${id}`);
        if (!response.ok) throw new Error("Peran tidak ditemukan");
        const data = await response.json();
        setRole(data);
        setRoleName(data.name);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRole();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/backend/role/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memperbarui peran");
      }
      
      const updated = await response.json();
      setRole(updated);
      toast.success("Peran berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui peran");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus peran ini? Tindakan ini tidak dapat dibatalkan.")) return;

    try {
      const response = await fetch(`/api/backend/role/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus peran");
      
      toast.success("Peran berhasil dihapus");
      router.push("/backend/admin/rbac/roles");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus peran");
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 font-sans">Sinkronisasi Data...</p>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6 text-rose-500 font-sans">
        <ShieldAlert className="w-12 h-12 opacity-30" />
        <div className="text-center space-y-1">
          <p className="text-xl font-black uppercase tracking-tightest leading-none">{error || "Data Tidak Ditemukan"}</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gagal memverifikasi identitas peran sistem</p>
        </div>
        <Link href="/backend/admin/rbac/roles" className="px-10 py-4 bg-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl active:scale-95">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const { style, initial } = getRoleStyle(roleName || role.name);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-20">
      
      {/* Breadcrumbs Section */}
      <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-1">
        <Link href="/backend/admin/rbac/roles" className="hover:text-primary transition-all flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Daftar Peran
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary italic">Detail Konfigurasi</span>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl">
        {/* Simplified Main Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
           
           <div className="p-10 space-y-10">
              {/* Identity Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl ${style.bg} flex items-center justify-center font-black text-xl tracking-tighter border border-black/5 shadow-inner`}>
                       {initial}
                    </div>
                    <div className="space-y-1">
                       <h1 className="text-4xl font-black text-zinc-800 tracking-tightest font-heading uppercase leading-none">{role.name}</h1>
                       <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[9px] font-black uppercase tracking-widest leading-none">PRYMK1</span>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID: {role.id}</span>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black transition-all shadow-sm active:scale-95 border border-rose-100 uppercase tracking-widest"
                 >
                    <Trash2 className="w-4 h-4" />
                    Hapus Peran
                 </button>
              </div>

              {/* Simple Edit Form */}
              <div className="pt-10 border-t border-zinc-50 space-y-10">
                 <div className="flex items-center gap-3">
                    <Edit3 className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Ubah Informasi Utama</h3>
                 </div>

                 <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Nama Peran Baru</label>
                       <input 
                         type="text" 
                         value={roleName}
                         onChange={(e) => setRoleName(e.target.value)}
                         className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-base font-black text-zinc-950 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-inner placeholder:text-zinc-300"
                         placeholder="Masukan nama peran..."
                       />
                       <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-2 italic">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Nama peran ini bersifat unik dan akan digunakan di seluruh modul RBAC.
                       </p>
                    </div>

                    <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                       <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Sinkronisasi Real-time Aktif</p>
                       <button 
                         type="submit"
                         disabled={isUpdating || !roleName.trim() || roleName === role.name}
                         className="flex items-center justify-center gap-3 px-12 py-5 bg-primary text-white rounded-2xl text-[10px] font-black transition-all shadow-xl shadow-primary/20 hover:bg-primary/95 disabled:opacity-50 disabled:shadow-none uppercase tracking-widest active:scale-98 group flex-shrink-0"
                       >
                         {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                         Simpan Perubahan
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}