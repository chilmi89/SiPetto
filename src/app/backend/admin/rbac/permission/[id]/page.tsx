"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  Save,
  ChevronRight,
  ShieldAlert,
  Edit3,
  Trash2,
  Lock,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface Permission {
  id: string;
  name: string;
  created_at: string;
}

export default function PermissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [permissionName, setPermissionName] = useState("");

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const response = await fetch(`/api/backend/permission/${id}`);
        if (!response.ok) throw new Error("Izin tidak ditemukan");
        const data = await response.json();
        setPermission(data);
        setPermissionName(data.name);
      } catch (err: any) {
        // Fallback or double check if it's a role ID by mistake
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPermission();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionName.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/backend/permission/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: permissionName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memperbarui izin");
      }
      
      const updated = await response.json();
      setPermission(updated);
      toast.success("Izin berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui izin");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus izin ini? Tindakan ini akan berpengaruh pada semua peran yang menggunakannya.")) return;

    try {
      const response = await fetch(`/api/backend/permission/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus izin");
      
      toast.success("Izin berhasil dihapus");
      router.push("/backend/admin/rbac/permission");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus izin");
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 font-sans">Mengambil Data Izin...</p>
      </div>
    );
  }

  if (error || !permission) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6 text-rose-500 font-sans">
        <ShieldAlert className="w-12 h-12 opacity-30" />
        <div className="text-center space-y-1">
          <p className="text-xl font-black uppercase tracking-tightest leading-none">{error || "Data Tidak Ditemukan"}</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gagal memverifikasi identitas izin sistem</p>
        </div>
        <Link href="/backend/admin/rbac/permission" className="px-10 py-4 bg-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl active:scale-95">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-20">
      
      {/* Breadcrumbs Section */}
      <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-1">
        <Link href="/backend/admin/rbac/permission" className="hover:text-primary transition-all flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Daftar Izin
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary italic">Detail Otoritas</span>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/40 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all group-hover:bg-primary/10" />
           
           <div className="p-12 space-y-12">
              {/* Identity Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center font-black text-2xl tracking-tighter text-white shadow-2xl shadow-zinc-400 border border-white/10 ring-8 ring-zinc-50">
                       {permission.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1.5">
                       <h1 className="text-4xl font-black text-zinc-800 tracking-tightest font-heading uppercase leading-none">{permission.name}</h1>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest border border-amber-100">
                             <Lock className="w-3 h-3" />
                             Identity Key
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">UUID: {permission.id}</span>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[1.25rem] text-[10px] font-black transition-all shadow-sm active:scale-95 border border-rose-100 uppercase tracking-widest"
                 >
                    <Trash2 className="w-4 h-4" />
                    Hapus Izin
                 </button>
              </div>

              {/* Form Section */}
              <div className="pt-12 border-t border-zinc-50 space-y-12">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <Edit3 className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                       <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">Modifikasi Otoritas</h3>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Perbarui label izin dalam registry sistem</p>
                    </div>
                 </div>

                 <form onSubmit={handleUpdate} className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 underline decoration-primary/30 underline-offset-8 ml-1">Nama Izin Baru</label>
                       <div className="relative group">
                          <input 
                            type="text" 
                            value={permissionName}
                            onChange={(e) => setPermissionName(e.target.value)}
                            className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-3xl text-lg font-black text-zinc-950 focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-inner placeholder:text-zinc-300"
                            placeholder="Contoh: edit_store_settings"
                          />
                       </div>
                       <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic">
                             Perubahan akan berdampak pada seluruh matrix RBAC yang terikat.
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                       <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400">
                             <Calendar className="w-4 h-4" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Terdaftar Pada</span>
                          </div>
                          <p className="text-xs font-black text-zinc-800">
                             {new Date(permission.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                       </div>
                       
                       <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400">
                             <ShieldCheck className="w-4 h-4" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Status Registry</span>
                          </div>
                          <p className="text-xs font-black text-emerald-500 uppercase italic">Verifikasi Aktif</p>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-zinc-50 flex items-center justify-end">
                       <button 
                         type="submit"
                         disabled={isUpdating || !permissionName.trim() || permissionName === permission.name}
                         className="flex items-center justify-center gap-4 px-14 py-6 bg-zinc-900 text-white rounded-3xl text-xs font-black transition-all shadow-2xl shadow-zinc-900/40 hover:bg-black disabled:opacity-50 disabled:shadow-none uppercase tracking-widest active:scale-95 group"
                       >
                         {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                         Perbarui Izin
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