"use client";

import React from "react";
import { 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Gem, 
  Search, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const stats = [
  { label: "Total Tenant", value: "1,284", sub: "+12% Bulan ini", color: "text-blue-600", icon: Users },
  { label: "Tenant Aktif", value: "1,150", sub: "89.5% dari total", color: "text-emerald-500", icon: TrendingUp },
  { label: "Paket Premium", value: "432", sub: "Top Performing", color: "text-amber-500", icon: Gem },
  { label: "Menunggu Verifikasi", value: "18", sub: "Perlu tindakan segera", color: "text-rose-500", icon: Clock },
];

const tenants = [
  { id: "T-90210", name: "Pusaka Tani Mandiri", initial: "PT", email: "contact@pusakatani.com", plan: "ENTERPRISE", status: "Aktif" },
  { id: "T-88219", name: "Bengkel Sejahtera", initial: "BS", email: "admin@bengkel-sejahtera.id", plan: "STANDARD", status: "Ditangguhkan" },
  { id: "T-77211", name: "Digital Solusi Nusantara", initial: "DSN", email: "info@digisolusi.net", plan: "PRO", status: "Aktif" },
  { id: "T-12290", name: "Kopi Mantap Group", initial: "KM", email: "billing@kopimantap.com", plan: "STANDARD", status: "Aktif" },
];

export default function TenantManagement() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-800 tracking-tightest">Manajemen Tenant</h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
            Kelola dan pantau semua mitra bisnis dalam ekosistem Sippetto.
          </p>
        </div>
        
        <div className="flex bg-zinc-100/80 p-1 rounded-xl border border-zinc-200 shadow-sm self-start">
          {["Semua", "Aktif", "Ditangguhkan"].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                tab === "Semua"
                  ? "bg-white text-primary shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 group hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none pt-1">
                  {stat.label}
                </p>
                <div className={`p-2 bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors`}>
                  <stat.icon className={`w-4 h-4 ${stat.color} opacity-80`} />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighterest">{stat.value}</h2>
                <div className="flex items-center gap-1.5 pt-1">
                  {stat.label === "Total Tenant" ? (
                    <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px]">
                      <TrendingUp className="w-3 h-3" />
                      {stat.sub}
                    </div>
                  ) : (
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.sub}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/30 overflow-hidden flex flex-col">
        {/* Table Header/Filter */}
        <div className="px-8 py-6 border-b border-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter berdasarkan nama..." 
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm font-medium transition-all"
            />
          </div>
          <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 text-xs font-black uppercase tracking-widest transition-colors px-4 py-2 hover:bg-zinc-50 rounded-xl active:scale-95">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tenant</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Paket</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm tracking-tight border border-primary/5 uppercase shadow-sm">
                        {tenant.initial}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-zinc-800 tracking-tight">{tenant.name}</p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID: {tenant.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-500">{tenant.email}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest transition-all ${
                      tenant.plan === "ENTERPRISE" ? "bg-rose-500/10 text-rose-500 border border-rose-500/10" :
                      tenant.plan === "PRO" ? "bg-primary/10 text-primary border border-primary/10" :
                      "bg-zinc-100 text-zinc-500 border border-zinc-200"
                    }`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                      <span className={`text-[11px] font-black tracking-tighter ${tenant.status === 'Aktif' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tenant.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 text-zinc-400 hover:text-primary transition-all hover:bg-white rounded-xl shadow-sm hover:shadow-primary/10 active:scale-90">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className={`p-2 transition-all hover:bg-white rounded-xl shadow-sm active:scale-90 ${
                        tenant.status === 'Aktif' ? 'text-zinc-400 hover:text-rose-500 hover:shadow-rose-500/10' : 'text-zinc-400 hover:text-emerald-500 hover:shadow-emerald-500/10'
                      }`}>
                        {tenant.status === 'Aktif' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-8 py-6 bg-zinc-50/30 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-zinc-50">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Menampilkan 4 dari 1,284 Tenant
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 bg-white rounded-xl border border-zinc-100 text-zinc-400 hover:text-primary transition-all hover:shadow-md active:scale-95 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                  page === 1 
                  ? "bg-primary text-white shadow-xl shadow-primary/30" 
                  : "bg-white border border-zinc-100 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 bg-white rounded-xl border border-zinc-100 text-zinc-400 hover:text-primary transition-all hover:shadow-md active:scale-95">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
