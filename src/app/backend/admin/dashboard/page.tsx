"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag,
  Activity,
  Calendar,
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const mainStats = [
  { label: "Total Pendapatan", value: "Rp 128.5Jt", growth: "+14.2%", up: true, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Total Tenant", value: "1,284", growth: "+8.1%", up: true, icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Pengguna Aktif", value: "8,432", growth: "-2.4%", up: false, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Pesanan Baru", value: "432", growth: "+12.5%", up: true, icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
];

const chartData = [
  { name: 'Jan', pendapatan: 45 },
  { name: 'Feb', pendapatan: 52 },
  { name: 'Mar', pendapatan: 38 },
  { name: 'Apr', pendapatan: 65 },
  { name: 'Mei', pendapatan: 48 },
  { name: 'Jun', pendapatan: 85 },
  { name: 'Jul', pendapatan: 72 },
  { name: 'Agt', pendapatan: 55 },
  { name: 'Sep', pendapatan: 92 },
  { name: 'Okt', pendapatan: 82 },
  { name: 'Nov', pendapatan: 105 },
  { name: 'Des', pendapatan: 120 },
];

const activity = [
  { id: 1, user: "Pusaka Tani", action: "Upgrade ke Enterprise", time: "2 Menit lalu", icon: Building2, color: "text-rose-500" },
  { id: 2, user: "John Doe", action: "Login ke sistem", time: "5 Menit lalu", icon: Users, color: "text-blue-500" },
  { id: 3, user: "Bengkel Sejahtera", action: "Pembayaran Berhasil", time: "12 Menit lalu", icon: Wallet, color: "text-emerald-500" },
  { id: 4, user: "Digital Solusi", action: "Menambahkan User baru", time: "25 Menit lalu", icon: Activity, color: "text-purple-500" },
];

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-800 tracking-tightest uppercase font-heading">Ringkasan Admin</h1>
          <p className="text-sm font-bold text-zinc-400">Selamat datang kembali, John Doe! Inilah ringkasan bisnis Anda hari ini.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm active:scale-95">
          <Calendar className="w-4 h-4 text-primary" />
          Maret 2026
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/20 group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-xl transition-transform group-hover:rotate-6`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-black px-2.5 py-1 rounded-full ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.growth}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] leading-none mb-1.5">{stat.label}</p>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighterest">{stat.value}</h2>
            </div>
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${stat.bg} opacity-20 blur-3xl rounded-full`} />
          </div>
        ))}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-200/40 p-8 flex flex-col gap-8 min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-800 tracking-tight font-heading">Performa Pendapatan</h3>
              <p className="text-xs font-bold text-zinc-400">Analisis statistik pertumbuhan bulanan (Juta Rupiah)</p>
            </div>
            <select className="bg-zinc-50 border border-zinc-200 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer font-sans">
              <option>12 Bulan Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          
          <div className="flex-1 w-full -ml-4">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3c39d6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3c39d6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: 900 }} 
                    itemStyle={{ color: '#3c39d6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pendapatan" 
                    stroke="#3c39d6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPendapatan)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-[#030037] rounded-2xl p-8 text-white flex flex-col gap-8 shadow-2xl shadow-primary/40 relative overflow-hidden group min-h-[500px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full -ml-24 -mb-24 blur-[80px]" />
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-xl font-black tracking-tight font-heading">Aktivitas Terbaru</h3>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>
          
          <div className="flex-1 flex flex-col gap-8 relative z-10">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-5 group/list cursor-pointer">
                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-xl flex items-center justify-center border border-white/5 transition-all group-hover/list:bg-white group-hover/list:scale-110 shadow-lg">
                  <item.icon className={`w-6 h-6 ${item.color} transition-colors group-hover/list:text-primary`} />
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-bold text-white/95 leading-tight tracking-tight font-sans">
                    {item.user} <br />
                    <span className="text-white/40 font-medium text-xs tracking-normal">{item.action}</span>
                  </p>
                  <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] font-sans">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="relative z-10 w-full py-4.5 bg-white/10 hover:bg-white border border-white/10 text-white hover:text-primary transition-all duration-300 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl hover:shadow-white/10 active:scale-95 font-sans">
            Lihat Semua Log
          </button>
        </div>
      </div>
    </div>
  );
}
