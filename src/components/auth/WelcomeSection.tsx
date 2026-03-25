"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

export const WelcomeSection = () => {
  return (
    <div className="hidden lg:flex flex-col text-white space-y-6 animate-in fade-in slide-in-from-left duration-1000">
      <div className="space-y-3">
        <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight">
          Selamat Datang <br /> di <span className="text-white drop-shadow-md">SIPPETO</span> 🚀
        </h1>
        <p className="text-sm xl:text-base text-white/80 font-medium leading-relaxed max-w-md">

          Sistem Pencatatan Penjualan TOYORESMI
        </p>
        <p className="text-sm xl:text-base text-white/80 font-medium leading-relaxed max-w-md">
          Solusi modern untuk manajemen dan pertumbuhan bisnis lokal Anda di Desa Toyoresmi
        </p>
      </div>

      <div className="relative w-full max-w-[340px] xl:max-w-[380px] aspect-square lg:aspect-[4/3] group pt-4">
        {/* Main Glass Card */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-2xl p-6 xl:p-8 flex flex-col space-y-6 animate-float ring-1 ring-white/10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Sales Growth</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white tracking-tighter">Rp 82.5M</h3>
                <span className="text-[10px] font-bold text-emerald-400 opacity-100">+28.4%</span>
              </div>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 relative group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full animate-pulse" />
            </div>
          </div>

          {/* Rising Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-3 px-1 pb-4 relative group/chart">
            {/* Perspective Lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-white" />
              ))}
            </div>
            
            {[25, 38, 52, 65, 78, 85, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative h-full group/bar">
                {/* Tooltip on Hover */}
                <div className="absolute -top-8 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 translate-y-2 group-hover/bar:translate-y-0 z-30">
                  +{height}%
                </div>

                {/* The Growing Bar */}
                <div className="w-full relative flex flex-col items-center h-full justify-end">
                  {/* Outer Bar (Shadow/Glow) */}
                  <div 
                    className="w-full rounded-2xl bg-white/5 absolute bottom-0 transition-all duration-1000 ease-out" 
                    style={{ height: '100%' }} 
                  />
                  
                  {/* Inner Bar (Gradient Content) */}
                  <div 
                    className="w-full rounded-2xl bg-gradient-to-t from-emerald-500/80 via-emerald-400 to-white/60 relative z-10 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    style={{ 
                      height: `${height}%`,
                      transitionDelay: `${i * 100}ms`
                    }}
                  >
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl" />
                  </div>
                </div>

                <span className="absolute -bottom-7 text-[9px] font-black text-white/30 tracking-tighter uppercase whitespace-nowrap">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Small Floating Card: Sales Point */}
        <div className="absolute -top-4 -right-4 w-32 h-20 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl p-4 flex flex-col justify-center animate-float [animation-delay:2s] ring-1 ring-white/10">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Volatility</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-black text-white text-rose-400">Low</p>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </div>
        </div>

        {/* Small Floating Card: Progress */}
        <div className="absolute -bottom-2 -left-6 w-38 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl p-3 flex flex-col justify-between animate-float [animation-delay:4s] ring-1 ring-white/10">
          <div className="flex justify-between items-center text-[8px] font-black text-white/40 uppercase">
            <span>Profit Margin</span>
            <span className="text-emerald-400">22%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full w-[72%] bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
