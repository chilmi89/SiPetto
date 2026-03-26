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
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
