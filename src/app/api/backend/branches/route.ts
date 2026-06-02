import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 1. GET - Ambil daftar cabang dengan data pengelolanya
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id") ?? undefined;
        const tenant_id = searchParams.get("tenant_id") ?? undefined;

        if (id) {
            const branch = await prisma.branches.findUnique({
                where: { id },
                include: {
                    tenant: true,
                    staff: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            is_active: true
                        }
                    },
                    _count: {
                        select: { transaction_groups: true }
                    }
                }
            });
            return NextResponse.json({ data: branch ? [branch] : [] });
        }

        if (!tenant_id) {
            return NextResponse.json({ error: "Tenant ID (profile_id) wajib disertakan" }, { status: 400 });
        }

        const branches = await prisma.branches.findMany({
            where: { tenant_id },
            orderBy: { name: "asc" },
            include: {
                staff: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        is_active: true
                    }
                },
                _count: {
                    select: { transaction_groups: true }
                }
            }
        });

        return NextResponse.json({ data: branches });
    } catch (error) {
        console.error("GET BRANCHES ERROR:", error);
        return NextResponse.json({ error: "Gagal mengambil data cabang" }, { status: 500 });
    }
}

// 2. POST - Buat cabang baru sekaligus akun pengelola (Franchisee / Manager) secara atomik
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            tenant_id, 
            name, 
            address, 
            phone_number,
            manager_name,
            manager_email,
            manager_password
        } = body;

        if (!tenant_id || !name) {
            return NextResponse.json({ error: "Tenant ID dan nama cabang wajib diisi" }, { status: 400 });
        }

        // Jika menginput kredensial pengelola, lakukan validasi awal
        if (manager_email) {
            if (!manager_name || !manager_password) {
                return NextResponse.json({ error: "Nama dan password pengelola wajib dilengkapi" }, { status: 400 });
            }
            // Cek apakah email pengelola sudah terdaftar
            const existingUser = await prisma.profiles.findUnique({
                where: { email: manager_email }
            });
            if (existingUser) {
                return NextResponse.json({ error: "Email pengelola sudah terdaftar di sistem" }, { status: 400 });
            }
        }

        // Gunakan Prisma $transaction agar proses pembuatan cabang dan user bersifat atomik
        const result = await prisma.$transaction(async (tx) => {
            // A. Buat Cabang Baru
            const branch = await tx.branches.create({
                data: {
                    tenant_id,
                    name,
                    address: address ?? null,
                    phone_number: phone_number ?? null,
                    is_active: true
                }
            });

            // B. Jika ada input pengelola, buat profile user baru
            if (manager_email) {
                const hashedPassword = await bcrypt.hash(manager_password, 10);
                
                // Cari ID Role 'UMKM'
                let role = await tx.roles.findUnique({
                    where: { name: 'UMKM' }
                });
                
                if (!role) {
                    role = await tx.roles.findUnique({
                        where: { name: 'owner' }
                    });
                }

                await tx.profiles.create({
                    data: {
                        email: manager_email,
                        password: hashedPassword,
                        full_name: manager_name,
                        business_name: `${name} (Franchise/Cabang)`,
                        phone_number: phone_number ?? null,
                        address: address ?? null,
                        role_id: role?.id ?? null,
                        branch_id: branch.id,
                        is_active: true
                    }
                });
            }

            return branch;
        });

        return NextResponse.json({ data: result, message: "Cabang dan akun pengelola berhasil dibuat" }, { status: 201 });
    } catch (error) {
        console.error("POST BRANCH ERROR:", error);
        return NextResponse.json({ error: "Gagal membuat cabang dan pengelola" }, { status: 500 });
    }
}

// 3. PATCH - Perbarui informasi cabang
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, name, address, phone_number, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: "ID cabang wajib disertakan" }, { status: 400 });
        }

        const updatedBranch = await prisma.branches.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(address !== undefined && { address }),
                ...(phone_number !== undefined && { phone_number }),
                ...(is_active !== undefined && { is_active })
            }
        });

        return NextResponse.json({ data: updatedBranch, message: "Informasi cabang berhasil diperbarui" });
    } catch (error) {
        console.error("PATCH BRANCH ERROR:", error);
        return NextResponse.json({ error: "Gagal memperbarui cabang" }, { status: 500 });
    }
}

// 4. DELETE - Hapus cabang
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID cabang tidak ditemukan" }, { status: 400 });
        }

        await prisma.branches.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Cabang berhasil dihapus" });
    } catch (error) {
        console.error("DELETE BRANCH ERROR:", error);
        return NextResponse.json({ error: "Gagal menghapus cabang" }, { status: 500 });
    }
}
