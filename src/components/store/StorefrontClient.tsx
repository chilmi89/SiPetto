"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Package, 
  MapPin, 
  Phone, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Store,
  MessageSquareShare,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface Product {
  id: string;
  profile_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  base_price: any;
  sell_price: any;
  image_url: string | null;
  is_active: boolean;
  product_categories: {
    name: string;
  } | null;
  product_stocks: {
    stock: number;
    branch_id: string;
  }[];
}

interface Profile {
  id: string;
  business_name: string | null;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  username: string | null;
  created_at: any;
}

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone_number: string | null;
}

interface VirtualProduct {
  virtualId: string;
  originalProduct: Product;
  branchId: string;
  branchName: string;
  displayName: string;
  stock: number;
  phone_number: string | null;
}

interface StorefrontClientProps {
  profile: Profile;
  products: Product[];
  branches: Branch[];
}

interface CartItem {
  virtualProduct: VirtualProduct;
  quantity: number;
}

export default function StorefrontClient({ profile, products, branches }: StorefrontClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPayment, setCheckoutPayment] = useState("COD");
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedVP, setSelectedVP] = useState<VirtualProduct | null>(null);

  // Load cart from LocalStorage on mount with legacy migration
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${profile.id}`);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const migrated = parsed.map((item: any) => {
          if (item.product && !item.virtualProduct) {
            const isPusat = true;
            return {
              virtualProduct: {
                virtualId: `${item.product.id}_pusat`,
                originalProduct: item.product,
                branchId: 'pusat',
                branchName: 'Pusat',
                displayName: `${item.product.name} (Pusat)`,
                stock: item.product.product_stocks?.reduce((sum: number, s: any) => sum + s.stock, 0) ?? 99,
                phone_number: profile.phone_number
              },
              quantity: item.quantity
            };
          }
          return item;
        });
        setCart(migrated);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, [profile.id, profile.phone_number]);

  // Save cart to LocalStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(`cart_${profile.id}`, JSON.stringify(newCart));
  };

  // Get unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.product_categories?.name) {
        set.add(p.product_categories.name);
      }
    });
    return Array.from(set);
  }, [products]);

  // Temukan Cabang Pusat (Utama)
  const pusatBranch = useMemo(() => {
    if (!branches || branches.length === 0) return null;
    return branches.find(b => 
      b.name.toLowerCase().includes("utama") || 
      b.name.toLowerCase().includes("pusat")
    ) || branches[0];
  }, [branches]);

  // Map products into virtual products per branch depending on selection
  const virtualProducts = useMemo(() => {
    const list: VirtualProduct[] = [];
    
    products.forEach((p) => {
      const activeStocks = p.product_stocks || [];
      
      if (selectedBranchId === "all") {
        let renderedAny = false;
        
        // Render a card for each branch that has stock > 0
        activeStocks.forEach((ps) => {
          const branch = branches.find(b => b.id === ps.branch_id);
          if (branch && ps.stock > 0) {
            const isPusat = branch.name.toLowerCase().includes("utama") || branch.name.toLowerCase().includes("pusat");
            list.push({
              virtualId: `${p.id}_${branch.id}`,
              originalProduct: p,
              branchId: branch.id,
              branchName: branch.name,
              displayName: `${p.name} (${isPusat ? "Pusat" : branch.name})`,
              stock: ps.stock,
              phone_number: branch.phone_number
            });
            renderedAny = true;
          }
        });
        
        // Fallback: If no branch has stock, show a single card as "Pusat" with 0 stock
        if (!renderedAny) {
          const defaultBranch = pusatBranch || branches[0];
          list.push({
            virtualId: `${p.id}_${defaultBranch ? defaultBranch.id : 'pusat'}`,
            originalProduct: p,
            branchId: defaultBranch ? defaultBranch.id : 'pusat',
            branchName: defaultBranch ? defaultBranch.name : 'Pusat',
            displayName: `${p.name} (Pusat)`,
            stock: 0,
            phone_number: defaultBranch ? defaultBranch.phone_number : null
          });
        }
      } else {
        // Render only for the selected branch
        const branch = branches.find(b => b.id === selectedBranchId);
        if (branch) {
          const ps = activeStocks.find(s => s.branch_id === selectedBranchId);
          const isPusat = branch.name.toLowerCase().includes("utama") || branch.name.toLowerCase().includes("pusat");
          list.push({
            virtualId: `${p.id}_${branch.id}`,
            originalProduct: p,
            branchId: branch.id,
            branchName: branch.name,
            displayName: `${p.name} (${isPusat ? "Pusat" : branch.name})`,
            stock: ps ? ps.stock : 0,
            phone_number: branch.phone_number
          });
        }
      }
    });
    
    return list;
  }, [products, branches, selectedBranchId, pusatBranch]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return virtualProducts.filter((vp) => {
      const p = vp.originalProduct;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        vp.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
        (p.product_categories && p.product_categories.name === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [virtualProducts, searchQuery, selectedCategory]);

  const addToCart = (vp: VirtualProduct) => {
    const existing = cart.find((item) => item.virtualProduct.virtualId === vp.virtualId);
    const stock = vp.stock;
    
    if (existing) {
      if (existing.quantity >= stock) {
        alert("Tidak bisa menambah lebih dari stok yang tersedia");
        return;
      }
      const updated = cart.map((item) => 
        item.virtualProduct.virtualId === vp.virtualId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      saveCart(updated);
    } else {
      if (stock <= 0) {
        alert("Stok produk ini sedang kosong");
        return;
      }
      saveCart([...cart, { virtualProduct: vp, quantity: 1 }]);
    }
  };

  const updateQuantity = (virtualId: string, delta: number) => {
    const existing = cart.find((item) => item.virtualProduct.virtualId === virtualId);
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      const updated = cart.filter((item) => item.virtualProduct.virtualId !== virtualId);
      saveCart(updated);
    } else {
      const stock = existing.virtualProduct.stock;
      if (newQty > stock) {
        alert("Stok produk terbatas");
        return;
      }
      const updated = cart.map((item) => 
        item.virtualProduct.virtualId === virtualId 
          ? { ...item, quantity: newQty } 
          : item
      );
      saveCart(updated);
    }
  };

  const cartTotalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity * Number(item.virtualProduct.originalProduct.sell_price)), 0);
  }, [cart]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
      alert("Harap lengkapi semua data formulir pengiriman");
      return;
    }

    // Tentukan nomor WhatsApp tujuan
    let targetPhone = profile.phone_number || "";
    let branchName = "";
    
    // Cek jika seluruh item di keranjang berasal dari cabang yang sama
    const uniqueBranches = Array.from(new Set(cart.map(item => item.virtualProduct.branchId)));
    if (uniqueBranches.length === 1 && uniqueBranches[0] !== 'pusat') {
      const selectedBranch = branches.find((b) => b.id === uniqueBranches[0]);
      if (selectedBranch) {
        branchName = selectedBranch.name;
        if (selectedBranch.phone_number) {
          targetPhone = selectedBranch.phone_number;
        }
      }
    } else if (selectedBranchId !== "all") {
      const selectedBranch = branches.find((b) => b.id === selectedBranchId);
      if (selectedBranch) {
        branchName = selectedBranch.name;
        if (selectedBranch.phone_number) {
          targetPhone = selectedBranch.phone_number;
        }
      }
    }

    // Format phone number to clean WhatsApp international format (62...)
    if (targetPhone.startsWith("0")) {
      targetPhone = "62" + targetPhone.slice(1);
    } else if (targetPhone.startsWith("+")) {
      targetPhone = targetPhone.slice(1);
    }
    
    if (!targetPhone) {
      alert("Nomor WhatsApp untuk pemesanan tidak ditemukan. Harap hubungi toko.");
      return;
    }

    // Compile WhatsApp message
    const storeTitle = profile.business_name || profile.username;
    const branchGreeting = branchName ? ` (Cabang ${branchName})` : "";
    let message = `*Halo ${storeTitle}${branchGreeting}! Saya ingin memesan produk berikut:*\n\n`;
    message += `───────────────────────\n`;
    cart.forEach((item) => {
      const vp = item.virtualProduct;
      const subtotal = item.quantity * Number(vp.originalProduct.sell_price);
      message += `🛍️ *${vp.displayName}*\n`;
      message += `   ${item.quantity} x ${formatCurrency(Number(vp.originalProduct.sell_price))} = *${formatCurrency(subtotal)}*\n\n`;
    });
    message += `───────────────────────\n`;
    message += `💵 *Total Belanja:* ${formatCurrency(cartTotalPrice)}\n\n`;
    message += `*📋 DATA PENGIRIMAN:*\n`;
    message += `👤 *Nama Penerima:* ${checkoutName}\n`;
    message += `📞 *No. WhatsApp:* ${checkoutPhone}\n`;
    message += `📍 *Alamat Lengkap:* ${checkoutAddress}\n`;
    if (branchName) {
      message += `📍 *Cabang Pengiriman:* ${branchName}\n`;
    }
    message += `💳 *Metode Pembayaran:* ${checkoutPayment}\n\n`;
    message += `_Pesanan dibuat via E-Catalog SiPetto_`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMessage}`;

    // Open WhatsApp
    window.open(waUrl, "_blank");

    // Clear cart and state
    saveCart([]);
    setIsCartOpen(false);
    setCheckoutName("");
    setCheckoutPhone("");
    setCheckoutAddress("");
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-800" style={{ fontFamily: 'var(--font-jakarta), var(--font-outfit), sans-serif' }}>
      
      {/* 1. Header Banner & Profile Section */}
      <div className="relative bg-white border-b border-zinc-200 shadow-sm">
        {/* Banner - full bleed */}
        <div className="h-44 md:h-60 w-full relative bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 overflow-hidden" style={{ margin: 0, padding: 0 }}>
          {profile.banner_url && (
            <img 
              src={profile.banner_url} 
              alt="Banner Toko"
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                opacity: 0.9
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Card Info */}
        <div className="max-w-5xl mx-auto px-4 pb-6 pt-2 flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-16 sm:-mt-20 relative z-10">
          {/* Logo / Avatar */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-1.5 shadow-xl border border-zinc-150 shrink-0">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Logo Toko" 
                className="w-full h-full object-cover rounded-2xl" 
              />
            ) : (
              <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl">
                <Store className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#030037] tracking-tight">{profile.business_name || profile.username}</h1>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
            {profile.bio && <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-2xl">{profile.bio}</p>}
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {profile.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate max-w-[280px]">{profile.address}</span>
                </div>
              )}
              {profile.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{profile.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Store Marketplace Content */}
      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 flex flex-col gap-6 md:gap-8">

        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari produk di toko ini..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 shadow-sm focus:ring-2 focus:ring-emerald-500/10 text-zinc-800 transition-all placeholder-zinc-400"
            />
          </div>

          {/* Categories Slider */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button 
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                selectedCategory === "all" 
                  ? "bg-[#030037] text-white border-[#030037]" 
                  : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? "bg-[#030037] text-white border-[#030037]" 
                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2">
            <Check className="w-5 h-5 bg-emerald-500 text-white rounded-full p-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Pemesanan WhatsApp Berhasil Dipicu!</p>
              <p className="text-xs text-emerald-600">Terima kasih, Anda akan dialihkan ke ruang obrolan WhatsApp toko untuk merampungkan pesanan.</p>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-16 text-center flex flex-col items-center gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#030037]">Tidak Ada Produk</h3>
            <p className="text-zinc-500 text-sm max-w-sm">Produk yang Anda cari tidak tersedia di etalase toko saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {filteredProducts.map((vp) => {
              const product = vp.originalProduct;
              const stock = vp.stock;
              const isOutOfStock = stock <= 0;
              const cartItem = cart.find(item => item.virtualProduct.virtualId === vp.virtualId);
              const isPusat = vp.branchName.toLowerCase().includes("utama") || vp.branchName.toLowerCase().includes("pusat");

              return (
                <div
                  key={vp.virtualId}
                  className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => setSelectedVP(vp)}
                >
                  {/* Image - lebih tinggi */}
                  <div className="aspect-[4/3] w-full relative bg-zinc-50 overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                    {/* Overlay zoom hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-md text-zinc-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all translate-y-2 group-hover:translate-y-0">
                        Lihat Detail
                      </div>
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {isOutOfStock ? (
                        <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                          Habis
                        </span>
                      ) : product.product_categories ? (
                        <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                          {product.product_categories.name}
                        </span>
                      ) : null}
                      {branches.length > 0 && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm ${isPusat ? 'bg-zinc-900/80 text-white' : 'bg-emerald-500 text-white'}`}>
                          {isPusat ? "Pusat" : vp.branchName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="font-black text-[#030037] text-base md:text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight" title={product.name}>
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none mb-1">Harga</p>
                          <span className="text-lg font-black text-emerald-600 font-mono">
                            {formatCurrency(Number(product.sell_price))}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${isOutOfStock ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isOutOfStock ? 'Habis' : `Stok ${stock}`}
                        </span>
                      </div>

                      {/* Action Button - stop propagation agar klik tombol tidak buka modal */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {isOutOfStock ? (
                          <button 
                            disabled 
                            className="w-full py-3 rounded-2xl bg-zinc-100 text-zinc-400 text-xs font-black uppercase tracking-wider cursor-not-allowed"
                          >
                            Stok Habis
                          </button>
                        ) : cartItem ? (
                          <div className="flex items-center justify-between bg-emerald-50 rounded-2xl border border-emerald-100 p-1">
                            <button 
                              onClick={() => updateQuantity(vp.virtualId, -1)}
                              className="p-2.5 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-black text-emerald-700">{cartItem.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(vp.virtualId, 1)}
                              className="p-2.5 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => addToCart(vp)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#030037] hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-lg transition-all"
                          >
                            <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer Branding */}
      <footer className="bg-white border-t border-zinc-200 py-8 text-center shrink-0">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-[0.2em]">&copy; 2026 SiPetto E-Catalog</p>
          <p className="text-[10px] text-zinc-300 font-bold uppercase">Supported by Advanced UMKM Ecosystem</p>
        </div>
      </footer>

      {/* 4. Floating Cart Bubble */}
      {cartTotalItems > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-4 sm:p-5 rounded-full shadow-2xl flex items-center justify-center border-2 border-white hover:scale-110 active:scale-95 transition-all animate-bounce"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border border-white shadow-md">
              {cartTotalItems}
            </span>
          </div>
        </button>
      )}

      {/* 5. Shopping Cart & Checkout Modal Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          
          {/* Drawer Body */}
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-hidden flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#030037] leading-tight">Keranjang Belanja</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{cartTotalItems} Items</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-150 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => {
                const product = item.virtualProduct.originalProduct;
                const subtotal = item.quantity * Number(product.sell_price);
                const virtualId = item.virtualProduct.virtualId;
                return (
                  <div key={virtualId} className="flex gap-4 p-3.5 bg-zinc-50 border border-zinc-150 rounded-2xl">
                    {/* Img */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Package className="w-6 h-6 text-zinc-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[#030037] text-sm line-clamp-1">{product.name}</h4>
                        <p className="text-xs font-mono font-bold text-emerald-600">{formatCurrency(Number(product.sell_price))}</p>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between items-center pt-1.5">
                        <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 scale-90 -ml-1">
                          <button 
                            onClick={() => updateQuantity(virtualId, -1)}
                            className="p-1 hover:bg-zinc-50 rounded text-zinc-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-zinc-700">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(virtualId, 1)}
                            className="p-1 hover:bg-zinc-50 rounded text-zinc-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-[#030037] font-mono">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Checkout Form */}
              <div className="pt-4 border-t border-zinc-150 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-[#030037] rounded-full" />
                  <h4 className="text-xs font-black text-[#030037] uppercase tracking-wider">Form Pengiriman</h4>
                </div>
                
                <form onSubmit={handleCheckoutSubmit} id="checkout-form" className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nama Penerima <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No. WhatsApp Penerima <span className="text-rose-500">*</span></label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Contoh: 08123456789"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Alamat Lengkap Penerima <span className="text-rose-500">*</span></label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Contoh: Jl. Mawar No. 12, RT 01/RW 03, Kel. Sukamaju, Kec. Ciluar, Bogor"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => setCheckoutPayment("COD")}
                        className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                          checkoutPayment === "COD" 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100"
                        }`}
                      >
                        Bayar di Tempat (COD)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCheckoutPayment("Transfer")}
                        className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                          checkoutPayment === "Transfer" 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100"
                        }`}
                      >
                        Transfer Bank
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Sticky total & button action */}
            <div className="p-6 border-t border-zinc-150 bg-zinc-50 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Pembayaran:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">{formatCurrency(cartTotalPrice)}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <MessageSquareShare className="w-4 h-4" /> Kirim Pesanan via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Product Detail Modal (Zoom View) */}
      {selectedVP && (() => {
        const mp = selectedVP.originalProduct;
        const mStock = selectedVP.stock;
        const mOutOfStock = mStock <= 0;
        const mCartItem = cart.find(ci => ci.virtualProduct.virtualId === selectedVP.virtualId);
        const mIsPusat = selectedVP.branchName.toLowerCase().includes("utama") || selectedVP.branchName.toLowerCase().includes("pusat");
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedVP(null)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Modal Card */}
            <div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10 animate-in zoom-in-95 fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedVP(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-white transition-all border border-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Panel */}
              <div className="md:w-1/2 aspect-square md:aspect-auto bg-zinc-100 flex-shrink-0 relative overflow-hidden">
                {mp.image_url ? (
                  <img
                    src={mp.image_url}
                    alt={mp.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-3">
                    <Package className="w-20 h-20" />
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tidak Ada Foto</p>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {mOutOfStock ? (
                    <span className="bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow">Stok Habis</span>
                  ) : mp.product_categories ? (
                    <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl">{mp.product_categories.name}</span>
                  ) : null}
                  {branches.length > 0 && (
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow ${mIsPusat ? 'bg-zinc-900 text-white' : 'bg-emerald-500 text-white'}`}>
                      {mIsPusat ? "Pusat" : selectedVP.branchName}
                    </span>
                  )}
                </div>
              </div>

              {/* Info Panel */}
              <div className="flex-1 p-7 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-[#030037] leading-tight mb-2">{mp.name}</h2>
                    {mp.description && (
                      <p className="text-zinc-500 text-sm leading-relaxed">{mp.description}</p>
                    )}
                  </div>

                  {/* Price Block */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Harga Jual</p>
                    <p className="text-3xl font-black text-emerald-600 font-mono">{formatCurrency(Number(mp.sell_price))}</p>
                  </div>

                  {/* Stock & Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Ketersediaan</p>
                      <p className={`text-sm font-black ${mOutOfStock ? 'text-rose-500' : 'text-zinc-800'}`}>
                        {mOutOfStock ? 'Stok Habis' : `${mStock} pcs tersedia`}
                      </p>
                    </div>
                    {mp.product_categories && (
                      <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Kategori</p>
                        <p className="text-sm font-black text-zinc-800">{mp.product_categories.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="pt-6 space-y-3">
                  {mOutOfStock ? (
                    <button disabled className="w-full py-4 rounded-2xl bg-zinc-100 text-zinc-400 text-sm font-black uppercase tracking-wider cursor-not-allowed">
                      Stok Habis
                    </button>
                  ) : mCartItem ? (
                    <div>
                      <p className="text-xs text-zinc-400 font-bold text-center mb-2 uppercase tracking-wider">Jumlah di Keranjang</p>
                      <div className="flex items-center justify-between bg-emerald-50 rounded-2xl border border-emerald-100 p-2">
                        <button onClick={() => updateQuantity(selectedVP.virtualId, -1)} className="p-3 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors">
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-xl font-black text-emerald-700">{mCartItem.quantity}</span>
                        <button onClick={() => updateQuantity(selectedVP.virtualId, 1)} className="p-3 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => { setSelectedVP(null); setIsCartOpen(true); }}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#030037] hover:bg-emerald-700 text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5" /> Lihat Keranjang
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { addToCart(selectedVP); setSelectedVP(null); }}
                      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#030037] hover:bg-emerald-600 text-white text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" /> Tambah ke Keranjang
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
