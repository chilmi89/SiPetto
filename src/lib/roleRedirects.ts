/**
 * ============================================================
 * KONFIGURASI REDIRECT BERDASARKAN ROLE
 * ============================================================
 * Tambahkan mapping role_name → path tujuan di sini.
 * Nama role harus sama PERSIS (case-insensitive) dengan yang
 * ada di database (tabel: roles.name).
 *
 * Contoh:
 *   "ADMIN"    → dashboard admin
 *   "TENANT"   → dashboard tenant/UMKM
 *   "STAFF"    → halaman khusus staff
 * ============================================================
 */

export const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN:  "/backend/admin/dashboard",
  TENANT: "/backend/tenant",
  STAFF:  "/backend/staff",   // tambahkan halaman ini jika sudah ada
  // Tambahkan role baru di bawah ini:
  // KASIR:    "/backend/kasir",
  // MANAJER:  "/backend/manajer",
};

/**
 * Default redirect jika role tidak ada di mapping di atas.
 * Bisa diubah ke halaman "akses ditolak" atau dashboard umum.
 */
export const DEFAULT_REDIRECT = "/backend/admin/dashboard";

/**
 * Helper: ambil path redirect berdasarkan nama role.
 * @param roleName - nama role dari database (case-insensitive)
 */
export function getRedirectByRole(roleName: string | null | undefined): string {
  if (!roleName) return DEFAULT_REDIRECT;
  const key = roleName.toUpperCase();
  return ROLE_REDIRECTS[key] ?? DEFAULT_REDIRECT;
}
