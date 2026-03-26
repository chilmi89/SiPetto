"use client";

import React from "react";
import { Search, Bell, User, Plus, Menu } from "lucide-react";
import { useSidebar } from "@/lib/context/SidebarContext";
import Image from "next/image";

export const DashboardHeader = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-20 bg-white border-b border-zinc-100 px-4 md:px-8 flex items-center justify-between shadow-sm z-30 shrink-0">
      {/* Search Bar & Toggle */}
      <div className="flex-1 flex items-center gap-4 max-w-xl">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-100"
        >
          <Menu className="w-6 h-6 text-zinc-600" />
        </button>

        <div className="relative group w-full hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Cari sesuatu..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm font-medium transition-all"
          />
        </div>
        <button className="sm:hidden p-2 bg-zinc-50 rounded-xl">
          <Search className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Nav Links & Action */}
      <div className="flex items-center gap-3 md:gap-8">
        <nav className="hidden xl:flex items-center gap-6">
          
        </nav>

        {/* User & Actions */}
        <div className="flex items-center gap-2 md:gap-4 border-l border-zinc-100 pl-3 md:pl-8">
          <button className="relative p-2 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors hidden sm:block">
            <Bell className="w-5 h-5 text-zinc-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer group px-1">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-zinc-100 group-hover:border-primary/20 transition-all">
              <div className="bg-zinc-100 w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-zinc-800 leading-tight tracking-tight">
                John Doe
              </p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                Super Admin
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Tambah Tenant</span>
          </button>
        </div>
      </div>
    </header>
  );
};
