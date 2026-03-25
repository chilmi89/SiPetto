"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, Sparkles, User } from 'lucide-react';

export const RegisterCard = () => {
  return (
    <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700 delay-200 w-full">
      <div className="glass w-full max-w-[440px] xl:max-w-[480px] p-6 lg:p-7 rounded-[2rem] relative overflow-hidden group shadow-[0_0_40px_rgba(30,64,175,0.2)]">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
        
        <div className="relative space-y-4 xl:space-y-5">
          <div className="space-y-0.5 text-center lg:text-left">
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight">Daftar Akun</h2>
            <p className="text-white/50 font-medium text-[11px] xl:text-xs flex items-center justify-center lg:justify-start gap-1.5">
              Bergabung bersama kami <Sparkles className="w-3.5 h-3.5 text-white/50" />
            </p>
          </div>

          <form className="space-y-2 xl:space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.1em] text-white/60 ml-1">Nama Lengkap</label>
              <div className="relative group/input">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Masukkan nama" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl py-1.5 xl:py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 text-xs font-medium transition-all"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.1em] text-white/60 ml-1">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-white transition-colors" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl py-1.5 xl:py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 text-xs font-medium transition-all"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.1em] text-white/60 ml-1">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-white transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl py-1.5 xl:py-2 pl-9 pr-9 outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 text-xs font-medium transition-all"
                  suppressHydrationWarning
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center text-[10px] font-bold text-white/60 px-1 pt-0 opacity-90 hover:opacity-100 transition-opacity">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <div className="w-3.5 h-3.5 rounded-sm border border-white/20 bg-white/5 flex items-center justify-center group-hover/check:border-white/40 transition-all">
                  <input type="checkbox" className="hidden peer" />
                  <div className="w-1.5 h-1.5 bg-white rounded-[1px] opacity-0 peer-checked:opacity-100 transition-all" />
                </div>
                <span>Saya setuju dengan <Link href="#" className="hover:text-white underline decoration-white/30 underline-offset-2">Syarat Ketentuan</Link></span>
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-1"
            >
              Buat Akun <Sparkles className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-0.5">
            <p className="text-white/40 text-[11px] font-medium">
              Sudah punya akun? <Link href="/login" className="text-white font-bold hover:underline decoration-white/30 underline-offset-4 transition-colors">Masuk sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
