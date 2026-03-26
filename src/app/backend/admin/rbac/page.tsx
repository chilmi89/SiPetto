"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  ShieldAlert,
  Grid3X3,
  List as ListIcon,
  Check,
  X,
  Search,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Role {
  id: string;
  name: string;
  created_at: string;
  _count?: {
    role_permissions: number;
  };
}

interface Permission {
  id: string;
  name: string;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
}

const getRoleStyle = (name: string) => {
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    { bg: "bg-blue-100 text-blue-600", border: "border-blue-500" },
    { bg: "bg-purple-100 text-purple-600", border: "border-purple-500" },
    { bg: "bg-emerald-100 text-emerald-600", border: "border-emerald-500" },
    { bg: "bg-orange-100 text-orange-600", border: "border-orange-500" },
    { bg: "bg-rose-100 text-rose-600", border: "border-rose-500" },
  ];
  const style = colors[hash % colors.length];
  const initial = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return { style, initial };
};

export default function RbacPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [mappings, setMappings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");

  // Modal State
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchPermQuery, setSearchPermQuery] = useState("");

  const fetchRbacData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, mappingsRes] = await Promise.all([
        fetch("/api/backend/role"),
        fetch("/api/backend/permission"),
        fetch("/api/backend/role-permission")
      ]);

      if (!rolesRes.ok || !permsRes.ok || !mappingsRes.ok) throw new Error("Gagal mengambil data RBAC");

      const [rolesData, permsData, mappingsData] = await Promise.all([
        rolesRes.json(),
        permsRes.json(),
        mappingsRes.json()
      ]);

      setRoles(rolesData);
      setPermissions(permsData);
      
      const mappingSet = new Set<string>(
        mappingsData.map((m: RolePermission) => `${m.role_id}:${m.permission_id}`)
      );
      setMappings(mappingSet);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, []);

  const handleToggleMapping = async (roleId: string, permissionId: string) => {
    const key = `${roleId}:${permissionId}`;
    const exists = mappings.has(key);
    
    // Optimistic Update
    const newMappings = new Set(mappings);
    if (exists) newMappings.delete(key);
    else newMappings.add(key);
    setMappings(newMappings);

    try {
      const res = await fetch("/api/backend/role-permission", {
        method: exists ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: roleId, permission_id: permissionId })
      });

      if (!res.ok) throw new Error("Gagal sinkronisasi");
      toast.success(exists ? "Izin dicabut" : "Izin diberikan", { autoClose: 800 });
      
      // Update role counts in our local state
      setRoles(prev => prev.map(r => {
        if (r.id === roleId) {
          return {
            ...r,
            _count: {
              role_permissions: (r._count?.role_permissions || 0) + (exists ? -1 : 1)
            }
          };
        }
        return r;
      }));
    } catch (err: any) {
      toast.error(err.message);
      fetchRbacData(); // Revert
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Hapus peran ini?")) return;
    try {
      const res = await fetch(`/api/backend/role/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Peran dihapus");
      fetchRbacData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const rbacStats = [
    { label: "Total Peran", value: roles.length.toString(), color: "border-blue-500" },
    { label: "Total Izin", value: permissions.length.toString(), color: "border-emerald-500" },
    { label: "Total Pemetaan", value: mappings.size.toString(), color: "border-orange-500" },
    { label: "Status Sistem", value: "SEHAT", color: "bg-emerald-500 text-white" },
  ];

  const filteredPermissionsForModal = permissions.filter(p => 
    p.name.toLowerCase().includes(searchPermQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-800 tracking-tightest font-heading uppercase">Role Has Permission Matrix</h1>
          <p className="text-sm font-bold text-zinc-400">Kelola pemetaan hak akses antara peran dan kemampuan sistem secara modular.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-zinc-100 p-1.5 rounded-2xl shadow-sm">
            <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === "list" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-400 hover:bg-zinc-50'}`}
            >
                <ListIcon className="w-4 h-4" />
                Daftar Peran
            </button>
            <button 
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === "matrix" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-400 hover:bg-zinc-50'}`}
            >
                <Grid3X3 className="w-4 h-4" />
                Matrix Otoritas
            </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {rbacStats.map((stat) => (
          <div 
            key={stat.label} 
            className={`bg-white p-7 h-36 flex flex-col justify-center rounded-2xl shadow-xl shadow-zinc-200/20 border-l-4 transition-all hover:shadow-2xl ${
              stat.color.includes('bg-') ? stat.color + " border-transparent" : stat.color + " border-zinc-100"
            }`}
          >
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${stat.color.includes('bg-') ? 'text-white/60' : 'text-zinc-400'}`}>
              {stat.label}
            </p>
            <div className={`flex items-baseline gap-2 ${stat.color.includes('bg-') ? 'text-white' : 'text-zinc-900'}`}>
              <h2 className="text-4xl font-black tracking-tighterest font-heading">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-2xl shadow-zinc-200/30 overflow-hidden min-h-[500px] relative">
        {loading ? (
             <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sinkronisasi Database...</p>
             </div>
        ) : error ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <ShieldAlert className="w-16 h-16 text-rose-500 opacity-20" />
                <p className="text-sm font-black text-rose-500 uppercase tracking-widest">{error}</p>
                <button onClick={fetchRbacData} className="px-6 py-3 bg-zinc-100 rounded-xl text-xs font-black text-zinc-600 hover:bg-zinc-200 transition-all">Coba Segarkan</button>
            </div>
        ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-zinc-50/50">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Nama Peran</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left">Terbuat Pada</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Izin Terpasang</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {roles.map((role) => {
                            const { style, initial } = getRoleStyle(role.name);
                            return (
                                <tr key={role.id} className="group hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => setEditingRole(role)}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center font-black text-sm border border-black/5 transition-transform group-hover:scale-110`}>
                                                {initial}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-zinc-800 tracking-tight uppercase">{role.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Klik untuk Konfigurasi</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                                        {new Date(role.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-xl text-xs font-black text-zinc-600 group-hover:bg-primary group-hover:text-white transition-all">
                                            {role._count?.role_permissions || 0}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={() => setEditingRole(role)}
                                                className="p-2.5 text-zinc-300 hover:text-primary transition-all rounded-xl hover:bg-white hover:shadow-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteRole(role.id)} className="p-2.5 text-zinc-300 hover:text-rose-500 transition-all rounded-xl hover:bg-white hover:shadow-sm">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20 bg-zinc-50 shadow-sm">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left bg-zinc-50 w-64 border-r border-zinc-100">Izin \ Peran</th>
                            {roles.map(role => (
                                <th key={role.id} className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center min-w-[120px] max-w-[150px] truncate">
                                    {role.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {permissions.map((perm) => (
                            <tr key={perm.id} className="group hover:bg-zinc-50/30">
                                <td className="p-6 border-r border-zinc-100 sticky left-0 z-10 bg-white group-hover:bg-zinc-50/30">
                                    <p className="text-[11px] font-black text-zinc-800 uppercase tracking-tight">{perm.name.replace(/_/g, ' ')}</p>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] leading-none mt-1">{perm.name}</p>
                                </td>
                                {roles.map(role => {
                                    const isAssigned = mappings.has(`${role.id}:${perm.id}`);
                                    return (
                                        <td key={`${role.id}:${perm.id}`} className="p-4 text-center">
                                            <button 
                                                onClick={() => handleToggleMapping(role.id, perm.id)}
                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto transition-all transform active:scale-90 border ${
                                                    isAssigned 
                                                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                                                    : 'bg-zinc-50 text-zinc-200 border-zinc-100 hover:border-zinc-300 hover:text-zinc-400'
                                                }`}
                                            >
                                                {isAssigned ? <Check className="w-4 h-4" /> : <X className="w-3 h-3" />}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      
      {/* Legend for Matrix */}
        {viewMode === "matrix" && !loading && (
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Petunjuk Matrix:</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md bg-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Izin Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md bg-zinc-50 border border-zinc-100" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Izin Dicabut</span>
                </div>
                <div className="ml-auto flex items-center gap-2 text-zinc-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase italic">Klik pada kotak untuk toggle izin secara instan</span>
                </div>
            </div>
        )}

        {/* PERMISSION MODAL */}
        {editingRole && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-[#030037]/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setEditingRole(null)}
                />
                <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col border border-zinc-100">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-zinc-800 tracking-tight uppercase">Konfigurasi {editingRole.name}</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Manajemen Izin Granular</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Cari izin..."
                                    value={searchPermQuery}
                                    onChange={(e) => setSearchPermQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={() => setEditingRole(null)}
                                className="p-3 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-800 hover:border-zinc-300 transition-all active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPermissionsForModal.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <ShieldAlert className="w-16 h-16 mx-auto opacity-10 mb-4" />
                                    <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Tidak ada izin ditemukan</p>
                                </div>
                            ) : (
                                filteredPermissionsForModal.map(perm => {
                                    const isAssigned = mappings.has(`${editingRole.id}:${perm.id}`);
                                    return (
                                        <div 
                                            key={perm.id} 
                                            onClick={() => handleToggleMapping(editingRole.id, perm.id)}
                                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                                isAssigned 
                                                ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200 shadow-sm' 
                                                : 'bg-zinc-50/50 border-zinc-100 hover:border-zinc-200'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <p className={`text-sm font-black tracking-tight uppercase ${isAssigned ? 'text-emerald-700' : 'text-zinc-700'}`}>
                                                    {perm.name.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                                    {perm.name}
                                                </p>
                                            </div>
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                                isAssigned 
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-0' 
                                                : 'bg-white border border-zinc-200 text-zinc-100 scale-90 -rotate-12'
                                            }`}>
                                                <Check className={`w-4 h-4 ${isAssigned ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    {roles.find(r => r.id === editingRole.id)?._count?.role_permissions || 0} Izin Aktif
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setEditingRole(null)}
                            className="bg-[#030037] text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#030037]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan & Selesai
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}