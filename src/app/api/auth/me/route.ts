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

    // Ambil full_name dari database
    const profile = await prisma.profiles.findUnique({
      where: { id: decoded.id },
      select: { full_name: true, email: true },
    });

    return NextResponse.json({
      id: decoded.id,
      email: profile?.email ?? decoded.email,
      full_name: profile?.full_name ?? null,
      role_name: decoded.role_name ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 401 });
  }
}
