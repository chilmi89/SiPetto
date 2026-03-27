import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper for Auth
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let categories = await prisma.categories.findMany({
      where: { profile_id: user.id },
      orderBy: { name: 'asc' }
    });

    // 🌱 AUTO-SEED Defaults if empty
    if (categories.length === 0) {
      const defaults = [
        { profile_id: user.id, name: "Pemasukan Utama", type: "INCOME" },
        { profile_id: user.id, name: "Pengeluaran Umum", type: "EXPENSE" },
        { profile_id: user.id, name: "Pajak", type: "EXPENSE" }
      ];

      await prisma.categories.createMany({ data: defaults });
      
      // Refresh list
      categories = await prisma.categories.findMany({
        where: { profile_id: user.id },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET_CATEGORIES_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, type } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Name and Type are required" }, { status: 400 });
    }

    const category = await prisma.categories.create({
      data: {
        profile_id: user.id,
        name,
        type: type.toUpperCase(), // Ensure uppercase mapping to CHECK constraint
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("POST_CATEGORY_ERROR:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.categories.delete({
      where: { 
        id,
        profile_id: user.id // Safety check
      }
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE_CATEGORY_ERROR:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}