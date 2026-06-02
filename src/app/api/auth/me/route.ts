import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role_name: string | null;
    };

    // Ambil full detail dari database dengan permission
    const profile = await prisma.profiles.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    if (!profile) return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 });

    const permissions = profile.roles?.role_permissions.map(rp => rp.permissions.name) || [];

    // Hapus data sensitif jika ada
    const { ...userProfile } = profile;

    return NextResponse.json({
        ...userProfile,
        role_name: profile.roles?.name || decoded.role_name,
        permissions
    });
  } catch (err) {
    console.error("AUTH ME ERROR:", err);
    return NextResponse.json({ error: "Token tidak valid atau sistem bermasalah." }, { status: 401 });
  }
}
