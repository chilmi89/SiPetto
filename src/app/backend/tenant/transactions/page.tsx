"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Receipt,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronDown,
  History,
  Info,
  Banknote
} from "lucide-react";
import { useRouter } from "next/navigation";

// Data type for each financial record line
interface TransactionItem {
  id: string;
  name: string;
  amount: number;
  category_id: string;
  payment_method: string;
  type: "INCOME" | "EXPENSE";
}

const UnifiedRecordingPage = () => {
  const router = useRouter();

  // Header state (Empty initially to avoid hydration mismatch)
  const [date, setDate] = useState("");
  const [reference, setReference] = useState("");

  // Categories (Fetch from API in real implementation)
  const [categories, setCategories] = useState<{id: string, name: string, type: string}[]>([]);

  useEffect(() => {
    // Populate dynamic values only on mount (client-side)
    setDate(new Date().toISOString().split("T")[0]);
    setReference(`TRX-${Date.now().toString().slice(-6)}`);

    // Simulasi fetch categories
    setCategories([
      { id: "c1", name: "Penjualan Produk", type: "INCOME" },
      { id: "c2", name: "Jasa Layanan", type: "INCOME" },
      { id: "c3", name: "Biaya Operasional", type: "EXPENSE" },
      { id: "c4", name: "Pembelian Stok", type: "EXPENSE" },
      { id: "c5", name: "Sewa Tempat", type: "EXPENSE" },
      { id: "c6", name: "Pajak", type: "EXPENSE" },
    ]);
  }, []);


  // Items state
  const [items, setItems] = useState<TransactionItem[]>([
    { id: "1", name: "", amount: 0, category_id: "", payment_method: "Tunai", type: "INCOME" },
    { id: "2", name: "", amount: 0, category_id: "", payment_method: "Tunai", type: "EXPENSE" },
  ]);

  // Totals calculation
  const totalIncome = items.filter(i => i.type === "INCOME").reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = items.filter(i => i.type === "EXPENSE").reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpense;

  const addItem = (itemType: "INCOME" | "EXPENSE") => {
    setItems([...items, { id: Math.random().toString(), name: "", amount: 0, category_id: "", payment_method: "Tunai", type: itemType }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof TransactionItem, value: any) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSave = async () => {
    alert("Laporan keuangan berhasil disimpan!");
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-2 px-3 lg:py-4 lg:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      
      {/* Container wrapper */}
      <div className="w-full max-w-7xl space-y-4">
        
        {/* Header Section (Fully Responsive) */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-4 h-[2px] bg-primary rounded-full"></div>
               <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">Pencatatan Finansial</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.back()}
                className="p-1 -ml-1.5 rounded-md hover:bg-zinc-50 text-zinc-400 hover:text-black transition-all outline-none"
                suppressHydrationWarning
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <h1 className="text-2xl lg:text-3xl font-black text-[#030037] tracking-tighter leading-tight">
                Catat Transaksi <span className="text-primary italic">Finansial</span>
              </h1>
            </div>
            <p className="text-[11px] lg:text-sm font-medium text-zinc-400 max-w-2xl leading-tight">
               Input data mutasi kas harian operasional UMKM secara akurat.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5">
             <div className="bg-[#f8f9fa] border border-zinc-200 p-2 lg:p-3 rounded-xl flex flex-row md:flex-col items-center gap-3 md:gap-1 min-w-0 md:min-w-[130px] shadow-sm flex-1">
                <span className="hidden md:block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Status Laporan</span>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[8px] font-black uppercase tracking-tight whitespace-nowrap">Siap Input</span>
                </div>
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-[#f8f9fa] border border-zinc-200 rounded-xl text-[10px] lg:text-[11px] font-bold text-zinc-900 shadow-sm hover:bg-zinc-100 transition-all group" suppressHydrationWarning>
                <History className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" /> 
                <span className="hidden sm:inline">Riwayat</span>
             </button>
          </div>
        </div>

        {/* The Card Section */}
        <div className="bg-[#f8f9fa] border border-zinc-300/50 rounded-2xl p-3 lg:p-7 shadow-lg shadow-zinc-200/50 space-y-4 lg:space-y-6">
          
          {/* Metadata Grid (Compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 border-b border-zinc-200/50 pb-4 lg:pb-6">
             <div className="space-y-1">
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Tanggal Entry</label>
                <div className="relative group">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                   <input 
                    type="date"
                    className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-2.5 bg-white border border-zinc-200 rounded-xl text-[11px] lg:text-xs font-bold text-black focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
             </div>
             <div className="space-y-1">
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">No. Referensi / Nota</label>
                <div className="relative group">
                   <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                   <input 
                    type="text"
                    placeholder="TRX-XXXXXX"
                    className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-2.5 bg-white border border-zinc-200 rounded-xl text-[11px] lg:text-xs font-bold text-black focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
             </div>
          </div>

          {/* Table Area */}
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex flex-col gap-0.5">
                 <h3 className="text-[10px] lg:text-[11px] font-black text-[#030037] uppercase tracking-widest flex items-center gap-2">
                   <Info className="w-3.5 h-3.5 text-primary" /> Rincian Mutasi
                 </h3>
                 <span className="hidden sm:inline text-[9px] font-medium text-zinc-400 ml-5.5 italic">Gunakan (+) untuk Pemasukan dan (-) untuk Biaya.</span>
               </div>
               <div className="flex gap-1.5 lg:gap-2">
                 <button onClick={() => addItem("INCOME")} className="px-3 lg:px-4 py-1.5 lg:py-2 bg-emerald-600 text-white text-[8px] lg:text-[9px] font-bold uppercase rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1.5 lg:gap-2 shadow-sm active:scale-95" suppressHydrationWarning>
                    <Plus className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Pemasukan
                 </button>
                 <button onClick={() => addItem("EXPENSE")} className="px-3 lg:px-4 py-1.5 lg:py-2 bg-rose-600 text-white text-[8px] lg:text-[9px] font-bold uppercase rounded-lg hover:bg-rose-700 transition-all flex items-center gap-1.5 lg:gap-2 shadow-sm active:scale-95" suppressHydrationWarning>
                    <Plus className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Pengeluaran
                 </button>
               </div>
            </div>

            {/* Desktop Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-5 text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1 border-b border-zinc-100 pb-2">
               <div className="col-span-1 text-center font-black">Status</div>
               <div className="col-span-3">Item / Keterangan</div>
               <div className="col-span-2">Kategori</div>
               <div className="col-span-2">Metode</div>
               <div className="col-span-3 text-right pr-6">Nominal (Rp)</div>
               <div className="col-span-1"></div>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <div key={item.id} className="relative bg-white border border-zinc-200 p-3 lg:p-3.5 rounded-xl transition-all hover:bg-zinc-50 hover:border-zinc-300 group shadow-sm">
                  
                  {/* Grid Layout: Responsive Stacking */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-3">
                    
                    {/* 1. Status & Delete (Mobile Row) */}
                    <div className="flex items-center justify-between lg:col-span-1 lg:justify-center">
                      <div className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg shrink-0 ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {item.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="lg:hidden flex items-center gap-2 pr-1">
                        <span className={`text-[8px] font-black uppercase ${item.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {item.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-md hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Rincian Item */}
                    <div className="lg:col-span-3 space-y-1">
                       <input
                         type="text"
                         placeholder="Tulis urusan transaksi..."
                         className="w-full bg-zinc-50/50 lg:bg-transparent border border-zinc-100 lg:border-none p-2 lg:p-0 rounded-lg lg:rounded-none text-xs font-bold text-zinc-900 focus:ring-0 outline-none placeholder:text-zinc-300"
                         value={item.name}
                         onChange={(e) => updateItem(item.id, "name", e.target.value)}
                         suppressHydrationWarning
                       />
                    </div>

                    {/* 3. Kategori & Metode Row (Mobile) */}
                    <div className="grid grid-cols-2 lg:contents gap-2">
                       <div className="lg:col-span-2 bg-zinc-50/50 lg:bg-transparent border border-zinc-100 lg:border-none p-2 lg:p-0 rounded-lg">
                          <label className="lg:hidden block text-[8px] text-zinc-400 font-bold uppercase mb-1">Kategori</label>
                          <select
                            className="w-full bg-transparent border-none p-0 text-[10px] lg:text-[11px] font-black text-zinc-700 appearance-none outline-none cursor-pointer focus:ring-0"
                            value={item.category_id}
                            onChange={(e) => updateItem(item.id, "category_id", e.target.value)}
                            suppressHydrationWarning
                          >
                            <option value="">Pilih Kategori</option>
                            {categories.filter(c => c.type === item.type).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                       </div>

                       <div className="lg:col-span-2 bg-zinc-50/50 lg:bg-transparent border border-zinc-100 lg:border-none p-2 lg:p-0 rounded-lg">
                          <label className="lg:hidden block text-[8px] text-zinc-400 font-bold uppercase mb-1">Metode</label>
                          <div className="relative flex items-center gap-1.5 group/select">
                             <Banknote className="w-3.5 h-3.5 text-zinc-300 transition-colors group-focus-within/select:text-primary shrink-0" />
                             <select
                               className="w-full bg-transparent border-none p-0 text-[10px] lg:text-[11px] font-black text-zinc-700 appearance-none outline-none cursor-pointer focus:ring-0 pr-4 lg:pr-6"
                               value={item.payment_method}
                               onChange={(e) => updateItem(item.id, "payment_method", e.target.value)}
                               suppressHydrationWarning
                             >
                               <option>Tunai</option>
                               <option>Transfer</option>
                               <option>E-Wallet</option>
                               <option>QRIS</option>
                             </select>
                             <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 lg:w-3.5 lg:h-3.5 text-zinc-300 pointer-events-none" />
                          </div>
                       </div>
                    </div>

                    {/* 4. Nominal */}
                    <div className="lg:col-span-3 flex items-center justify-end bg-zinc-50/50 lg:bg-white border border-zinc-100 lg:border-zinc-200 rounded-xl px-3 py-2 lg:py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                       <span className={`text-[9px] font-black mr-2 ${item.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp</span>
                       <input
                         type="number"
                         className={`w-full bg-transparent border-none p-0 text-base lg:text-lg font-black text-right outline-none focus:ring-0 ${item.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}
                         value={item.amount === 0 && !isNaN(item.amount) ? "0" : item.amount}
                         onFocus={(e) => e.target.select()}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                         onChange={(e) => {
                           const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                           updateItem(item.id, "amount", val);
                         }}
                         suppressHydrationWarning
                       />
                    </div>

                    {/* 5. Delete (Desktop Only) */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                       <button
                         onClick={() => removeItem(item.id)}
                         className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm opacity-60 hover:opacity-100"
                         disabled={items.length === 1}
                         suppressHydrationWarning
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Summary Area */}
          <div className="space-y-3 pt-2 border-t border-zinc-200/50">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                <div className="p-3 lg:p-4 bg-white border border-zinc-200 rounded-xl lg:rounded-2xl flex flex-col items-center shadow-sm">
                   <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pemasukan</span>
                   <h4 className="text-lg lg:text-xl font-black text-emerald-600 tracking-tight">{formatIDR(totalIncome)}</h4>
                </div>
                
                <div className="p-3 lg:p-4 bg-white border border-zinc-200 rounded-xl lg:rounded-2xl flex flex-col items-center shadow-sm">
                   <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pengeluaran</span>
                   <h4 className="text-lg lg:text-xl font-black text-rose-600 tracking-tight">{formatIDR(totalExpense)}</h4>
                </div>

                <div className="sm:col-span-2 lg:col-span-1 p-3 lg:p-4 bg-[#030037] rounded-xl lg:rounded-2xl flex flex-col items-center shadow-lg group">
                   <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Saldo Akhir</span>
                   <h4 className={`text-xl lg:text-2xl font-black tracking-tighter transition-all group-hover:scale-105 ${balance >= 0 ? 'text-primary' : 'text-rose-400'}`}>
                      {formatIDR(balance)}
                   </h4>
                </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-zinc-200 rounded-2xl p-3 lg:p-4 px-6 lg:px-8 gap-3 lg:gap-4 shadow-sm">
                <div className="flex items-center gap-3 text-zinc-400">
                   <Info className="w-4 h-4" />
                   <p className="text-[10px] font-semibold italic">Laporan akan tersinkronisasi otomatis dengan dashboard.</p>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 lg:py-3 bg-[#030037] text-white hover:bg-black rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all group border border-white/5"
                  suppressHydrationWarning
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Simpan Laporan
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRecordingPage;