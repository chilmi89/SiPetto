import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── 1. GET — Daftar Transaction Groups ───────────────────────────────────────
// Query params: profile_id, search (reference_number), date_start, date_end, page, limit
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const id         = searchParams.get("id") ?? undefined;
        const profile_id = searchParams.get("profile_id") ?? undefined;
        const search     = searchParams.get("search") ?? undefined;
        const date_start = searchParams.get("date_start") ?? undefined;
        const date_end   = searchParams.get("date_end") ?? undefined;
        const page       = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit      = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));

        // Jika ID diberikan, lakukan pencatatan spesifik
        if (id) {
            const tx = await prisma.transaction_groups.findUnique({
                where: { id },
                include: {
                    transaction_items: {
                        include: {
                            categories: true,
                            payment_methods: true
                        }
                    },
                    transaction_attachments: true
                }
            });
            return NextResponse.json({ data: tx ? [tx] : [], total: tx ? 1 : 0 });
        }

        const where = {
            ...(profile_id && { profile_id }),
            ...(search     && { reference_number: { contains: search, mode: "insensitive" as const } }),
            ...((date_start || date_end) && {
                transaction_date: {
                    ...(date_start && { gte: new Date(date_start) }),
                    ...(date_end   && { lte: new Date(date_end) }),
                },
            }),
        };

        const [total, data] = await Promise.all([
            prisma.transaction_groups.count({ where }),
            prisma.transaction_groups.findMany({
                where,
                orderBy: { transaction_date: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    transaction_items: {
                        include: {
                            categories: true,
                            payment_methods: true
                        }
                    },
                    transaction_attachments: true
                }
            }),
        ]);

        return NextResponse.json({
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("GET TRANSACTION GROUPS ERROR:", error);
        return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
    }
}

// ─── 2. POST — Tambah Transaction Group ──────────────────────────────────────
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { profile_id, reference_number, transaction_date, description, items } = body;

        if (!profile_id) {
            return NextResponse.json({ error: "Profile ID wajib disertakan" }, { status: 400 });
        }

        // Helper untuk mapping type sesuai constraint database (INCOME / EXPENSE)
        const mapType = (t: string) => {
            const low = t.toLowerCase();
            if (low === "pemasukan" || low === "income") return "INCOME";
            if (low === "pengeluaran" || low === "expense") return "EXPENSE";
            return t.toUpperCase();
        };

        // Hitung total income & expense dari items jika disertakan saat create
        let total_income = 0;
        let total_expense = 0;

        if (items && Array.isArray(items)) {
            items.forEach((item: any) => {
                const amount = Number(item.amount || 0);
                const mappedType = mapType(item.type);
                if (mappedType === "INCOME") total_income += amount;
                if (mappedType === "EXPENSE") total_expense += amount;
            });
        }

        const net_balance = total_income - total_expense;

        const newGroup = await prisma.transaction_groups.create({
            data: {
                profile_id,
                reference_number,
                transaction_date: transaction_date ? new Date(transaction_date) : undefined,
                description,
                total_income,
                total_expense,
                net_balance,
                ...(items && items.length > 0 && {
                    transaction_items: {
                        create: items.map((item: any) => ({
                            category_id: item.category_id,
                            payment_method_id: item.payment_method_id,
                            type: mapType(item.type),
                            name: item.name,
                            amount: item.amount,
                        }))
                    }
                })
            },
            include: {
                transaction_items: true
            }
        });

        return NextResponse.json(newGroup, { status: 201 });
    } catch (error) {
        console.error("POST TRANSACTION GROUP ERROR:", error);
        return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
    }
}

// ─── 3. PATCH — Ubah Transaksi ──────────────────────────────────────────────
export async function PATCH(req: Request) {
    try {
        const { id, items, ...data } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID transaksi wajib disertakan" }, { status: 400 });
        }

        // Helper mapping
        const mapType = (t: string) => {
            const low = t.toLowerCase();
            if (low === "pemasukan" || low === "income") return "INCOME";
            if (low === "pengeluaran" || low === "expense") return "EXPENSE";
            return t.toUpperCase();
        };

        // Jika mengubah tanggal, pastikan menggunakan objek Date
        if (data.transaction_date) {
            data.transaction_date = new Date(data.transaction_date);
        }

        // Jika items disertakan, hitung ulang total dan update secara atomik
        if (items && Array.isArray(items)) {
            let total_income = 0;
            let total_expense = 0;

            items.forEach((item: any) => {
                const amount = Number(item.amount || 0);
                const mappedType = mapType(item.type);
                if (mappedType === "INCOME") total_income += amount;
                if (mappedType === "EXPENSE") total_expense += amount;
            });

            const net_balance = total_income - total_expense;

            // Update Group, Hapus Item lama, Tambah Item baru (Transaction)
            const updated = await prisma.$transaction([
                prisma.transaction_items.deleteMany({ where: { group_id: id } }),
                prisma.transaction_groups.update({
                    where: { id },
                    data: {
                        ...data,
                        total_income,
                        total_expense,
                        net_balance,
                        transaction_items: {
                            create: items.map((item: any) => ({
                                category_id: item.category_id,
                                payment_method_id: item.payment_method_id,
                                type: mapType(item.type),
                                name: item.name,
                                amount: item.amount,
                            }))
                        }
                    },
                    include: { transaction_items: true }
                })
            ]);

            return NextResponse.json(updated[1]);
        }

        const updated = await prisma.transaction_groups.update({
            where: { id },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH TRANSACTION GROUP ERROR:", error);
        return NextResponse.json({ error: "Gagal memperbarui transaksi" }, { status: 500 });
    }
}

// ─── 4. DELETE — Hapus Transaksi ─────────────────────────────────────────────
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID transaksi wajib disertakan" }, { status: 400 });
        }

        await prisma.transaction_groups.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Transaksi berhasil dihapus" });
    } catch (error) {
        console.error("DELETE TRANSACTION GROUP ERROR:", error);
        return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
    }
}
