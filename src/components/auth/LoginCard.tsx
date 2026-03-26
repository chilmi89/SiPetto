"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { getRedirectByRole } from '@/lib/roleRedirects';

export const LoginCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan saat login.');
        return;
      }

      toast.success('Login berhasil!');

      // Redirect berdasarkan role — konfigurasi ada di src/lib/roleRedirects.ts
      const redirectPath = getRedirectByRole(data.user?.role_name);
      router.push(redirectPath);

    } catch (err) {
      toast.error('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700 delay-200 w-full">
      <div className="glass w-full max-w-[440px] xl:max-w-[480px] p-6 lg:p-7 rounded-[2rem] relative overflow-hidden group shadow-[0_0_40px_rgba(30,64,175,0.2)]">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
        
        <div className="relative space-y-4 xl:space-y-5">
          <div className="space-y-0.5 text-center lg:text-left">
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight">Login Akun</h2>
            <p className="text-white/50 font-medium text-[11px] xl:text-xs flex items-center justify-center lg:justify-start gap-1.5">
              Mulai sekarang <Sparkles className="w-3.5 h-3.5 text-white/50" />
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 xl:space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.1em] text-white/60 ml-1">Email</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-white transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl py-2 xl:py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 text-xs font-medium transition-all"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.1em] text-white/60 ml-1">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-white transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl py-2 xl:py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 text-xs font-medium transition-all"
                  required
                  suppressHydrationWarning
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-white/60 px-1 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <div className="w-3.5 h-3.5 rounded-sm border border-white/20 bg-white/5 flex items-center justify-center group-hover/check:border-white/40 transition-all">
                  <input type="checkbox" className="hidden peer" />
                  <div className="w-1.5 h-1.5 bg-white rounded-[1px] opacity-0 peer-checked:opacity-100 transition-all" />
                </div>
                <span>Ingat saya</span>
              </label>
              <Link href="#" className="hover:text-white transition-colors">Lupa sandi?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-1"
            >
              {loading ? "Memproses..." : "Login Sistem"} <Sparkles className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-0.5">
            <p className="text-white/40 text-[11px] font-medium">
              Belum punya akun? <Link href="/register" className="text-white font-bold hover:underline decoration-white/30 underline-offset-4 transition-colors">Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
