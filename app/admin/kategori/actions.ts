"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FORM_LIMITS } from "@/lib/form-limits";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login tidak ditemukan.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Akses ditolak.");
  return supabase;
}

export async function saveCategory(input: { id?: number; name: string }) {
  try {
    const name = input.name.trim();
    if (!name) return { error: "Nama kategori wajib diisi." };
    if (name.length > FORM_LIMITS.categoryName) return { error: `Nama kategori maksimal ${FORM_LIMITS.categoryName} karakter.` };

    const supabase = await requireAdmin();
    const query = input.id
      ? supabase.from("kategori").update({ nama: name }).eq("id", input.id)
      : supabase.from("kategori").insert({ nama: name });
    const { error } = await query;
    if (error) return { error: "Kategori gagal disimpan. Nama mungkin sudah digunakan." };

    revalidatePath("/admin/kategori");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan kategori.",
    };
  }
}

export async function deleteCategory(id: number) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("kategori").delete().eq("id", id);
    if (error) return { error: "Kategori yang masih digunakan UMKM tidak dapat dihapus." };

    revalidatePath("/admin/kategori");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus kategori.",
    };
  }
}
