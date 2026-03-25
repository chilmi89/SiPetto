"use client";

import React from 'react';
import Image from 'next/image';

export const WelcomeSection = () => {
  return (
    <div className="hidden lg:flex flex-col text-white space-y-6 animate-in fade-in slide-in-from-left duration-1000">
      <div className="space-y-3">
        <div className="inline-block bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md text-[9px] font-bold tracking-[0.2em] uppercase shadow-sm">
          Digitalisasi UMKM
        </div>
        <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight">
          Selamat Datang <br /> di <span className="text-white drop-shadow-md">SIPPETO</span> 🚀
        </h1>
        <p className="text-sm xl:text-base text-white/80 font-medium leading-relaxed max-w-md">
          Solusi modern untuk manajemen dan pertumbuhan bisnis lokal Anda di Desa Toyoresmi. Tingkatkan efisiensi sekarang.
        </p>
      </div>
      
      <div className="relative w-full max-w-[280px] xl:max-w-[340px] aspect-[4/3] drop-shadow-xl">
        <Image 
          src="/sippetto_illustration.png"
          alt="SiPetto Illustration"
          fill
          className="object-contain animate-float"
          priority
        />
      </div>
    </div>
  );
};
