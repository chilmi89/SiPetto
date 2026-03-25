"use client";

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="w-full  py-4 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] gap-4 z-50 bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="flex gap-6">
        <span>SiPetto © 2024. Hak cipta dilindungi.</span>
      </div>
      <div className="flex gap-10">
        <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
        <Link href="#" className="hover:text-white transition-colors">Syarat Layanan</Link>
        <Link href="#" className="hover:text-white transition-colors">Pusat Bantuan</Link>
      </div>
      <div className="text-white/50 font-medium">
        © 2024 SIPPETO All rights reserved.
      </div>
    </footer>
  );
};
