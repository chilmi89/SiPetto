"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/context/SidebarContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  ArrowRightLeft,
  FileText,
  ShieldAlert,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/backend/admin/dashboard" },
  { icon: Building2, label: "Manajemen Tenant", href: "/backend/admin/tenant" },
  { icon: Users, label: "Manajemen Pengguna", href: "/backend/admin/users" },
  { icon: ShieldCheck, label: "Peran & Izin", href: "/backend/admin/roles" },
  { icon: ArrowRightLeft, label: "Transaksi", href: "/backend/admin/transactions" },
  { icon: FileText, label: "Laporan Pendapatan", href: "/backend/admin/reports" },
  { icon: ShieldAlert, label: "Pusat Keamanan", href: "/backend/admin/security" },
  { icon: Settings, label: "Pengaturan", href: "/backend/admin/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-[#030037]/20 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300 pointer-events-none ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 h-full bg-[#030037] text-white flex flex-col p-6 z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 outline-none" : "-translate-x-full"
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10 pt-2 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tightest font-heading">Sippeto</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 font-sans">
              Admin Panel
            </p>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-2 lg:hidden hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/50" />
          </button>
        </div>

        {/* Navigation Items (Scrollable area) */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar();
                }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive
                    ? "bg-white/10 text-white font-bold shadow-lg shadow-black/20"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-white/30 group-hover:text-white"
                  }`}
                />
                <span className="text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-white/10 shrink-0">
          <button className="flex items-center gap-3 w-full px-5 py-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-all group">
            <HelpCircle className="w-5 h-5 text-white/30 group-hover:text-white" />
            <span className="text-sm font-bold tracking-tight">Bantuan</span>
          </button>
        </div>
      </aside>
    </>
  );
};
