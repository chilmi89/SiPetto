"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/context/SidebarContext";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  UserCircle,
  Settings,
  HelpCircle,
  X,
  History,
  Receipt
} from "lucide-react";

const tenantNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/backend/tenant" },
  { icon: Receipt, label: "Catatan Transaksi", href: "/backend/tenant/transactions" },
  { icon: History, label: "Riwayat & Kelola", href: "/backend/tenant/transactions/history" },
  { icon: UserCircle, label: "Profil UMKM", href: "/backend/tenant/profile" },
  { icon: Package, label: "Produk Kami", href: "/backend/tenant/products" },
  { icon: ShoppingCart, label: "Pesanan Masuk", href: "/backend/tenant/orders" },
  { icon: BarChart3, label: "Statistik Penjualan", href: "/backend/tenant/reports" },
  { icon: Settings, label: "Pengaturan Toko", href: "/backend/tenant/settings" },
];

export const TenantSidebar = () => {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#030037]/20 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300 pointer-events-none ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
        onClick={closeSidebar}
      />

      <aside 
        className={`fixed inset-y-0 left-0 w-72 h-full bg-[#030037] text-white flex flex-col p-6 z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-10 pt-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
               <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tightest font-heading uppercase italic">SiPetto</h1>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1 font-sans leading-none">
                Tenant Portal
              </p>
            </div>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-2 lg:hidden hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tenantNavItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <div key={item.label} className="relative">
                <Link
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 1024) closeSidebar(); }}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all group ${
                    isActive ? "bg-white/5 text-white shadow-sm border border-white/5" : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-primary-light" : "text-white/20 group-hover:text-white"
                    }`}
                  />
                  <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 shrink-0">
           
          <button className="flex items-center gap-3 w-full px-5 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all group">
            <HelpCircle className="w-5 h-5 text-white/20 group-hover:text-white" />
            <span className="text-sm font-black tracking-tight">Pusat Bantuan</span>
          </button>
        </div>
      </aside>
    </>
  );
};
