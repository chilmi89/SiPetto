-- Simplified SQL Schema for SiPetto (Supabase / Postgres)

-- 1. Roles Table (Simple)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Permissions Table (Simple)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'manage:all', 'post:edit'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Role Permissions (Mapping)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Profiles Table (Menggantikan public.users agar tidak bentrok)
-- Tabel ini terhubung langsung dengan auth.users milik Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Bebas tanpa ikatan Foreign Key SQL. Prisma akan melihatnya seperti ID biasa yang super bersih!
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- Supabase menangani password, kita simpan email untuk kemudahan
    full_name VARCHAR(255), -- Diisi saat register (Langkah 1)
    business_name VARCHAR(255), -- Dibuang NOT NULL nya, diisi belakangan saat Setup UMKM (Langkah 2)
    phone_number VARCHAR(20), 
    address TEXT, 
    avatar_url TEXT, 
    bio TEXT, 
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trigger Supabase: Otomatis buat Profile saat User Register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name' -- Mengambil nama dari metadata saat register
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang Trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatic Updated At trigger for Profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
