import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil." }, { status: 200 });

  // Hapus semua cookie auth dengan set expired di masa lalu
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0, // Langsung expired
  };

  response.cookies.set("token", "", cookieOptions);
  response.cookies.set("role_name", "", { ...cookieOptions, httpOnly: false });

  return response;
}
