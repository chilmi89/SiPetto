import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
        console.error("Kredensial Supabase URL atau KEY kosong. Silakan periksa .env Anda.");
        return NextResponse.json({ error: 'Konfigurasi Cloud Storage belum lengkap' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const oldUrl = formData.get('old_url') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File gambar avatar tidak terdeteksi' }, { status: 400 });
    }

    if (oldUrl) {
      try {
        const urlParts = oldUrl.split('/');
        const oldFileName = urlParts[urlParts.length - 1];
        if (oldFileName) {
          await supabase.storage.from('profile_umkm').remove([oldFileName]);
        }
      } catch (err) {
        console.error("Gagal menghapus file avatar lama:", err);
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now().toString();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filename = `avatar-${uniqueSuffix}-${originalName}`;
    
    // Upload eksklusif ke bucket profile_umkm
    const { data, error } = await supabase.storage
      .from('profile_umkm')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('SUPABASE AVATAR UPLOAD ERROR:', error);
      return NextResponse.json({ error: 'Gagal mengunggah foto profil ke Cloud' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile_umkm')
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error('SYSTEM AVATAR UPLOAD ERROR:', error);
    return NextResponse.json({ error: 'Terjadi kegagalan sistem saat mengunggah avatar' }, { status: 500 });
  }
}
