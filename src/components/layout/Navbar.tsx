"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="w-full py-4 px-6 md:px-10 flex justify-between items-center text-white/90 z-10">
      <div className="text-2xl font-black tracking-tighter flex items-center gap-2 group cursor-pointer">
        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-primary transition-all duration-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">SIPPETO</span>
      </div>
      <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest leading-none">
        <Link href="/login" className="hover:text-white transition-all hover:scale-105 active:scale-95">Login</Link>

      </div>
    </nav>
  );
};
