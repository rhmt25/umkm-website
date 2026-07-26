"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

const IMAGE_SLOTS = ["logo", "gambar_1", "gambar_2", "gambar_3"] as const;
type ImageSlot = (typeof IMAGE_SLOTS)[number];

const ALLOWED_MIME = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function phone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  return `+${digits}`;
}

function extFromMime(mime: string) {
  return mime === "image/png" ? "png" : "jpg";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

async function assertCanManageUmkm(umkmId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login tidak ditemukan.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const { data: umkm } = await supabase
    .from("umkm")
    .select("user_id, no_wa")
    .eq("id", umkmId)
    .single();

  if (!umkm || (profile?.role !== "admin" && umkm.user_id !== user.id)) {
    throw new Error("Akses ditolak.");
  }

  return { supabase, umkm, isAdmin: profile?.role === "admin" };
}

function revalidateUmkm(umkmId: number) {
  revalidatePath(`/admin/umkm/${umkmId}`);
  revalidatePath("/admin/umkm");
}

export async function updateUmkmCategories(
  umkmId: number,
  categoryIds: number[],
): Promise<ActionResult> {
  try {
    const { supabase } = await assertCanManageUmkm(umkmId);
    const { error: deleteError } = await supabase
      .from("umkm_kategori")
      .delete()
      .eq("umkm_id", umkmId);
    if (deleteError) return { error: "Kategori gagal diperbarui." };

    if (categoryIds.length) {
      const { error } = await supabase.from("umkm_kategori").insert(
        categoryIds.map((kategori_id) => ({ umkm_id: umkmId, kategori_id })),
      );
      if (error) return { error: "Kategori gagal diperbarui." };
    }

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Kategori gagal diperbarui.",
    };
  }
}

export async function updateUmkmProfile(
  umkmId: number,
  data: Record<string, string>,
): Promise<ActionResult> {
  try {
    const { supabase, umkm } = await assertCanManageUmkm(umkmId);

    const nama = data.nama?.trim() ?? "";
    const pemilik = data.pemilik?.trim() ?? "";
    const noWa = data.no_wa?.trim() ?? "";
    const password = data.password?.trim() ?? "";

    if (!nama || !pemilik || !noWa) {
      return { error: "Nama UMKM, pemilik, dan nomor WhatsApp wajib diisi." };
    }

    if (password && password.length < 6) {
      return { error: "Password minimal 6 karakter." };
    }

    const payload = {
      nama,
      pemilik,
      no_wa: noWa,
      rt: optional(data.rt ?? ""),
      rw: optional(data.rw ?? ""),
      dukuh: optional(data.dukuh ?? ""),
      dusun: optional(data.dusun ?? ""),
      alamat_lengkap: optional(data.alamat_lengkap ?? ""),
      instagram: optional(data.instagram ?? ""),
      tiktok: optional(data.tiktok ?? ""),
      facebook: optional(data.facebook ?? ""),
      shopee: optional(data.shopee ?? ""),
      tokopedia: optional(data.tokopedia ?? ""),
      google_maps: optional(data.google_maps ?? ""),
      keunggulan1: optional(data.keunggulan1 ?? ""),
      keunggulan2: optional(data.keunggulan2 ?? ""),
      keunggulan3: optional(data.keunggulan3 ?? ""),
      keunggulan4: optional(data.keunggulan4 ?? ""),
    };

    const { error } = await supabase.from("umkm").update(payload).eq("id", umkmId);
    if (error) return { error: "Profil UMKM gagal disimpan." };

    const admin = createAdminClient();

    if (password) {
      const { error: passwordError } = await admin.auth.admin.updateUserById(
        umkm.user_id,
        { password },
      );
      if (passwordError) return { error: "Password gagal diperbarui." };
    }

    if (noWa !== umkm.no_wa) {
      const normalizedPhone = phone(noWa);
      const authEmail = `umkm+${normalizedPhone.replace(/\D/g, "")}@umkm.local`;
      const { error: emailError } = await admin.auth.admin.updateUserById(
        umkm.user_id,
        { email: authEmail, email_confirm: true },
      );
      if (emailError) return { error: "Nomor WhatsApp gagal diperbarui." };
      await admin.from("profiles").update({ login_email: authEmail }).eq("id", umkm.user_id);
    }

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Profil UMKM gagal disimpan.",
    };
  }
}

export async function createProduct(
  umkmId: number,
  input: { name: string; description: string; price: string },
): Promise<ActionResult & { id?: number }> {
  try {
    const { supabase } = await assertCanManageUmkm(umkmId);

    const nama = input.name.trim();
    const harga = Number(input.price.replace(/\D/g, "") || "0");

    if (!nama) return { error: "Nama produk wajib diisi." };
    if (Number.isNaN(harga) || harga < 0) {
      return { error: "Harga produk tidak valid." };
    }

    const { data, error } = await supabase
      .from("produk")
      .insert({
        id_umkm: umkmId,
        nama,
        deskripsi: input.description.trim() || null,
        harga,
      })
      .select("id")
      .single();

    if (error || !data) return { error: "Produk gagal ditambahkan." };

    revalidateUmkm(umkmId);
    return { error: null, id: data.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Produk gagal ditambahkan.",
    };
  }
}

export async function updateProduct(
  umkmId: number,
  productId: number,
  input: { name: string; description: string; price: string },
): Promise<ActionResult> {
  try {
    const { supabase } = await assertCanManageUmkm(umkmId);

    const nama = input.name.trim();
    const harga = Number(input.price.replace(/\D/g, "") || "0");

    if (!nama) return { error: "Nama produk wajib diisi." };
    if (Number.isNaN(harga) || harga < 0) {
      return { error: "Harga produk tidak valid." };
    }

    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        deskripsi: input.description.trim() || null,
        harga,
      })
      .eq("id", productId)
      .eq("id_umkm", umkmId);

    if (error) return { error: "Produk gagal disimpan." };

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Produk gagal disimpan.",
    };
  }
}

export async function deleteProduct(
  umkmId: number,
  productId: number,
): Promise<ActionResult> {
  try {
    const { supabase } = await assertCanManageUmkm(umkmId);

    const { error } = await supabase
      .from("produk")
      .delete()
      .eq("id", productId)
      .eq("id_umkm", umkmId);

    if (error) return { error: "Produk gagal dihapus." };

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Produk gagal dihapus.",
    };
  }
}

export async function uploadUmkmImage(
  umkmId: number,
  slot: ImageSlot,
  formData: FormData,
): Promise<ActionResult> {
  try {
    if (!IMAGE_SLOTS.includes(slot)) {
      return { error: "Slot gambar tidak valid." };
    }

    const { supabase } = await assertCanManageUmkm(umkmId);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "File gambar wajib dipilih." };
    }

    if (!ALLOWED_MIME.includes(file.type) || file.size > MAX_FILE_SIZE) {
      return {
        error: "Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.",
      };
    }

    const { data: existing } = await supabase
      .from("umkm_images")
      .select("storage_path")
      .eq("umkm_id", umkmId)
      .eq("slot", slot)
      .maybeSingle();

    const ext = extFromMime(file.type);
    const storagePath = `umkm/${umkmId}/${slot}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("umkm-media")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) return { error: "Gambar gagal diunggah." };

    const { error: dbError } = await supabase.from("umkm_images").upsert(
      {
        umkm_id: umkmId,
        slot,
        storage_path: storagePath,
      },
      { onConflict: "umkm_id,slot" },
    );

    if (dbError) {
      await supabase.storage.from("umkm-media").remove([storagePath]);
      return { error: "Referensi gambar gagal disimpan." };
    }

    if (existing?.storage_path && existing.storage_path !== storagePath) {
      await supabase.storage.from("umkm-media").remove([existing.storage_path]);
    }

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gambar gagal diunggah.",
    };
  }
}

export async function deleteUmkmImage(
  umkmId: number,
  slot: ImageSlot,
): Promise<ActionResult> {
  try {
    if (!IMAGE_SLOTS.includes(slot)) {
      return { error: "Slot gambar tidak valid." };
    }

    const { supabase } = await assertCanManageUmkm(umkmId);

    const { data: existing } = await supabase
      .from("umkm_images")
      .select("storage_path")
      .eq("umkm_id", umkmId)
      .eq("slot", slot)
      .maybeSingle();

    if (!existing) return { error: null };

    const { error: dbError } = await supabase
      .from("umkm_images")
      .delete()
      .eq("umkm_id", umkmId)
      .eq("slot", slot);

    if (dbError) return { error: "Gambar gagal dihapus." };

    await supabase.storage.from("umkm-media").remove([existing.storage_path]);

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gambar gagal dihapus.",
    };
  }
}
