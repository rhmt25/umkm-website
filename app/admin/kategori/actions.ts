"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FORM_LIMITS } from "@/lib/form-limits";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    throw new Error(
      "Gagal Memproses Kategori\nPenyebab: Sesi login Anda tidak ditemukan.\nSolusi: Silakan masuk kembali sebagai Admin.",
    );

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    throw new Error(
      "Gagal Memproses Kategori\nPenyebab: Akses ditolak. Hanya Admin yang dapat mengelola kategori.\nSolusi: Masuk dengan akun admin.",
    );
  return supabase;
}

export async function saveCategory(input: { id?: number; name: string }) {
  try {
    const name = input.name.trim();
    if (!name)
      return {
        error:
          "Gagal Menyimpan Kategori\nPenyebab: Nama kategori tidak boleh kosong.\nSolusi: Masukkan nama kategori terlebih dahulu sebelum menyimpan.",
      };
    if (name.length > FORM_LIMITS.categoryName)
      return {
        error: `Gagal Menyimpan Kategori\nPenyebab: Nama kategori melebihi batas ${FORM_LIMITS.categoryName} karakter.\nSolusi: Singkatkan nama kategori yang dimasukkan.`,
      };

    const supabase = await requireAdmin();
    const query = input.id
      ? supabase.from("kategori").update({ nama: name }).eq("id", input.id)
      : supabase.from("kategori").insert({ nama: name });
    const { error } = await query;
    if (error)
      return {
        error:
          "Gagal Menyimpan Kategori\nPenyebab: Kategori gagal disimpan ke database. Nama kategori mungkin sudah terdaftar.\nSolusi: Gunakan nama kategori lain yang belum ada.",
      };

    revalidatePath("/admin/kategori");
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal Menyimpan Kategori\nPenyebab: Terjadi gangguan jaringan saat menyimpan kategori.\nSolusi: Silakan coba beberapa saat lagi.",
    };
  }
}

export async function deleteCategory(id: number) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("kategori").delete().eq("id", id);
    if (error)
      return {
        error:
          "Gagal Menghapus Kategori\nPenyebab: Kategori yang masih digunakan oleh UMKM tidak dapat dihapus.\nSolusi: Lepas kategori ini dari UMKM yang menggunakannya terlebih dahulu.",
      };

    revalidatePath("/admin/kategori");
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal Menghapus Kategori\nPenyebab: Terjadi gangguan jaringan saat menghapus kategori.\nSolusi: Silakan coba beberapa saat lagi.",
    };
  }
}
