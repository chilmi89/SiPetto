"use client";

import React from "react";
import { 
  TrendingUp, TrendingDown, Wallet, DollarSign, 
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

/* ════════ DUMMY DATA (Highly Erratic & Unique per Category) ════════ */
const saldoData = [
  { name: "Jan", saldo: 25000000 }, { name: "Feb", saldo: 8000000 },  { name: "Mar", saldo: 32000000 },
  { name: "Apr", saldo: 15000000 }, { name: "Mei", saldo: 29000000 }, { name: "Jun", saldo: 5000000 },
  { name: "Jul", saldo: 35000000 }, { name: "Ags", saldo: 19000000 }, { name: "Sep", saldo: 10000000 },
  { name: "Okt", saldo: 28000000 }, { name: "Nov", saldo: 33000000 }, { name: "Des", saldo: 12000000 },
];

const pendapatanData = [
  { name: "Jan", pendapatan: 5000000 },  { name: "Feb", pendapatan: 28000000 }, { name: "Mar", pendapatan: 12000000 },
  { name: "Apr", pendapatan: 3000000 },  { name: "Mei", pendapatan: 35000000 }, { name: "Jun", pendapatan: 18000000 },
  { name: "Jul", pendapatan: 30000000 }, { name: "Ags", pendapatan: 7000000 },  { name: "Sep", pendapatan: 22000000 },
  { name: "Okt", pendapatan: 15000000 }, { name: "Nov", pendapatan: 4000000 },  { name: "Des", pendapatan: 29000000 },
];

const pengeluaranData = [
  { name: "Jan", pengeluaran: 22000000 }, { name: "Feb", pengeluaran: 10000000 }, { name: "Mar", pengeluaran: 25000000 },
  { name: "Apr", pengeluaran: 30000000 }, { name: "Mei", pengeluaran: 5000000 },  { name: "Jun", pengeluaran: 12000000 },
  { name: "Jul", pengeluaran: 8000000 },  { name: "Ags", pengeluaran: 33000000 }, { name: "Sep", pengeluaran: 15000000 },
  { name: "Okt", pengeluaran: 5000000 },  { name: "Nov", pengeluaran: 28000000 }, { name: "Des", pengeluaran: 19000000 },
];

const labaRugiData = [
  { name: "Jan", untung: 15000000, rugi: 5000000 },  { name: "Feb", untung: 12000000, rugi: 8000000 },
  { name: "Mar", untung: 22000000, rugi: 3000000 },  { name: "Apr", untung: 8000000, rugi: 15000000 },
  { name: "Mei", untung: 25000000, rugi: 5000000 },  { name: "Jun", untung: 12000000, rugi: 18000000 },
  { name: "Jul", untung: 32000000, rugi: 4000000 },  { name: "Ags", untung: 10000000, rugi: 22000000 },
  { name: "Sep", untung: 28000000, rugi: 6000000 },  { name: "Okt", untung: 15000000, rugi: 12000000 },
  { name: "Nov", untung: 5000000, rugi: 28000000 },  { name: "Des", untung: 35000000, rugi: 5000000 },
];

const formatCurrencyFull = (v: number) => {
  const isNegative = v < 0;
  const absV = Math.abs(v);
  const formatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(absV);
  return isNegative ? `-${formatted}` : formatted;
};

/* ════════ CUSTOM TOOLTIP ════════ */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#030037] text-white px-5 py-4 rounded-xl shadow-2xl text-xs font-bold border border-white/10 backdrop-blur-md">
      <p className="text-white/40 mb-2 text-[10px] uppercase tracking-widest">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.value < 0 ? "#f43f5e" : (p.color || "#fff") }} className="text-sm font-black">
          {p.name.toUpperCase()}: {formatCurrencyFull(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ════════ MAIN COMPONENT ════════ */
export default function TenantDashboard() {
  return (
    <div className="w-full flex flex-col gap-4 py-2 pb-20" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      
      {/* HEADER TANPA WRAPPER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4 py-2">
        <div>
           <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-1">
              <div className="w-6 h-1 bg-primary rounded-full" />
              Dashboard Tenant UMKM
           </div>
           <h1 className="text-4xl font-black text-[#030037] tracking-tighter">Selamat Datang Di <span className="text-primary">Sipetto</span></h1>
           <p className="text-zinc-500 font-medium text-sm mt-0.5">Laporan grafik performa finansial real-time Anda.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-zinc-100 shadow-sm">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none">Status Sistem</span>
              <span className="text-emerald-500 font-black text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Terkoneksi
              </span>
           </div>
        </div>
      </div>

      {/* 🌟 2x2 LARGE CHARTS 🌟 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-full px-4">

        {/* Chart 1: Saldo */}
        <LargeChartItem 
          title="Saldo Akumulatif" 
          value="Rp 24,800,000" 
          change="+8.2%" 
          color="#3c39d6" 
          data={saldoData} 
          dataKey="saldo" 
          icon={<Wallet className="w-6 h-6" />}
        />

        {/* Chart 2: Pendapatan */}
        <LargeChartItem 
          title="Pendapatan Bersih" 
          value="Rp 18,350,000" 
          change="+15.4%" 
          color="#10b981" 
          data={pendapatanData} 
          dataKey="pendapatan" 
          icon={<TrendingUp className="w-6 h-6" />}
        />

        {/* Chart 3: Pengeluaran */}
        <LargeChartItem 
          title="Pengeluaran Bersih" 
          value="Rp 6,420,000" 
          change="-3.1%" 
          color="#f43f5e" 
          data={pengeluaranData} 
          dataKey="pengeluaran" 
          icon={<TrendingDown className="w-6 h-6" />}
          negative
        />

        {/* Chart 4: Untung vs Rugi */}
        <LargeChartItem 
          title="Perbandingan Untung & Rugi" 
          value="Rp 15,200,000" 
          change="+22.7%" 
          color="#10b981" 
          data={labaRugiData} 
          dataKey={["untung", "rugi"]} 
          icon={<DollarSign className="w-6 h-6" />}
          isProfitLoss
        />

      </div>
    </div>
  );
}

const LargeChartItem = ({ title, value, change, color, data, dataKey, icon, negative = false, isProfitLoss = false }: any) => {
  // Handle single or multiple data keys
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];
  const allValues = data.flatMap((d: any) => keys.map(k => d[k]));
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-8 sm:p-10 shadow-sm flex flex-col h-[500px] hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-zinc-50 text-zinc-400 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
            {icon}
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-1">{title}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#030037] tracking-tighter leading-none">{value}</h2>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${negative ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} shadow-sm border border-black/0 group-hover:border-current/10`}>
          {change}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 w-full relative z-10 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUntung" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRugi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`colorGrad-${keys[0]}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" vertical={true} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 800 }} 
              axisLine={{ stroke: '#f1f1f4' }} 
              tickLine={{ stroke: '#f1f1f4' }} 
              dy={15}
            />
            <YAxis 
              domain={[0, maxVal]}
              tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 800 }} 
              axisLine={{ stroke: '#f1f1f4' }} 
              tickLine={{ stroke: '#f1f1f4' }} 
              tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {isProfitLoss ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="untung" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fill="url(#colorUntung)" 
                  animationDuration={1500}
                  dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2, opacity: 1 }}
                  activeDot={{ r: 8, fill: "#10b981", stroke: "#fff", strokeWidth: 4 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rugi" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  fill="url(#colorRugi)" 
                  animationDuration={1500}
                  dot={{ r: 4, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2, opacity: 1 }}
                  activeDot={{ r: 8, fill: "#f43f5e", stroke: "#fff", strokeWidth: 4 }}
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey={keys[0]} 
                stroke={color} 
                strokeWidth={4} 
                fill={`url(#colorGrad-${keys[0]})`} 
                animationDuration={1500}
                dot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2, opacity: 1 }}
                activeDot={{ r: 8, fill: color, stroke: "#fff", strokeWidth: 4 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};