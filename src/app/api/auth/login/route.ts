import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Ambil user beserta nama role-nya
    const user = await prisma.profiles.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const roleName = user.roles?.name ?? null;

    const secret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, role_name: roleName },
      secret,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      {
        message: "Login berhasil.",
        user: {
          id: user.id,
          nama: user.full_name,
          email: user.email,
          role_name: roleName,
        },
        token,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie (token)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Set cookie role_name agar middleware bisa baca tanpa decode JWT
    response.cookies.set("role_name", roleName ?? "", {
      httpOnly: false, // boleh dibaca client untuk UI
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
