-- 🧠 Optimized SQL Schema for SiPetto (Supabase / Prisma)

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Roles
INSERT INTO public.roles (name) VALUES ('Admin'), ('UMKM'), ('Owner') ON CONFLICT (name) DO NOTHING;

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Role Permissions (Mapping)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Profiles Table (Linked to auth.users)
-- We store email and full_name as cache for visibility in Prisma without schema joins
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Removed physical REFERENCES to avoid Prisma multi-schema issues
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL, 
    password VARCHAR(255), -- Back for manual auth
    full_name VARCHAR(255), 
    business_name VARCHAR(255), -- Fill in Step 2 (UMKM Setup)
    phone_number VARCHAR(20), 
    address TEXT, 
    avatar_url TEXT, 
    bio TEXT, 
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Trigger Supabase: Auto-create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nama'), -- Flexible key support
    (SELECT id FROM public.roles WHERE name = 'UMKM' LIMIT 1) -- Assign 'UMKM' as default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatic Updated At trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime 
-- 6. Categories Table (For dynamic Income/Expense categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, name, type)
);

-- 7. Transactions Table (Catatan Transaksi)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number VARCHAR(50),
    type VARCHAR(20) CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    net_amount NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    other_fees NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) GENERATED ALWAYS AS (net_amount + tax_amount + other_fees) STORED,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Accounting Settings (Pengaturan Pembukuan)
CREATE TABLE IF NOT EXISTS public.accounting_settings (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'Rp',
    start_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for New Tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
CREATE POLICY "Users can manage their own categories" ON public.categories
    FOR ALL USING (auth.uid() = profile_id);

-- RLS Policies for Transactions
CREATE POLICY "Users can manage their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = profile_id);

-- RLS Policies for Accounting Settings
CREATE POLICY "Users can manage their own settings" ON public.accounting_settings
    FOR ALL USING (auth.uid() = profile_id);

-- 📋 URUT PENGERJAAN (Roadmap/Task List):
/*
1. MASKR: Eksekusi SQL ini di Supabase SQL Editor untuk membuat tabel dasar.
2. PRISMA: Jalankan 'npx prisma db pull' kemudian 'npx prisma generate' agar model terbaca di Next.js.
3. SETUP MODUL (Pengaturan):
   - Buat fungsi CRUD untuk Tabel 'Categories' (Pendapatan & Pengeluaran).
   - Buat form untuk 'Accounting Settings' (Mata Uang & Tanggal Mulai).
4. TRANSACTION MODUL (Catatan Transaksi):
   - Implementasi form input transaksi yang terhubung ke Kategori.
   - Buat tabel list 'Catatan Transaksi' sesuai layout Excel yang Anda berikan.
5. DASHBOARD INTEGRATION:
   - Hubungkan data dari tabel 'transactions' ke grafik AreaChart yang sudah kita buat sebelumnya (Saldo, Pendapatan, Pengeluaran).
*/
