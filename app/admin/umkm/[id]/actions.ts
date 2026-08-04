"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { firstLimitError, FORM_LIMITS } from "@/lib/form-limits";

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
  if (!user) throw new Error("Penyebab: Sesi login Anda telah berakhir.\nSolusi: Silakan masuk kembali ke akun pengelola Anda.");

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
    throw new Error("Penyebab: Anda tidak memiliki hak akses untuk mengelola UMKM ini.\nSolusi: Pastikan Anda masuk sebagai admin atau pemilik usaha ini.");
  }

  return { supabase, umkm, isAdmin: profile?.role === "admin" };
}

function revalidateUmkm(umkmId: number) {
  revalidatePath(`/admin/umkm/${umkmId}`);
  revalidatePath("/admin/umkm");
}

export async function deleteUmkm(umkmId: number): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Penyebab: Sesi belum terautentikasi.\nSolusi: Silakan login terlebih dahulu." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { error: "Penyebab: Hanya Administrator yang berhak menghapus data UMKM.\nSolusi: Hubungi pihak admin desa." };
    }

    const admin = createAdminClient();

    // Fetch UMKM details
    const { data: umkm, error: umkmError } = await admin
      .from("umkm")
      .select("id, user_id, nama")
      .eq("id", umkmId)
      .single();

    if (umkmError || !umkm) {
      return { error: "Penyebab: Data UMKM tidak ditemukan di database.\nSolusi: Refresh halaman untuk memperbarui daftar UMKM." };
    }

    // Delete stored media files
    const { data: images } = await admin
      .from("umkm_images")
      .select("storage_path")
      .eq("umkm_id", umkmId);

    if (images && images.length > 0) {
      const paths = images.map((img) => img.storage_path);
      await admin.storage.from("umkm-media").remove(paths);
    }

    // Delete UMKM record (cascades to umkm_kategori, umkm_images, produk)
    const { error: deleteUmkmError } = await admin.from("umkm").delete().eq("id", umkmId);
    if (deleteUmkmError) {
      return { error: "Penyebab: Gagal menghapus catatan UMKM dari basis data.\nSolusi: Coba beberapa saat lagi atau periksa koneksi." };
    }

    // Delete auth user profile if created for this UMKM
    if (umkm.user_id) {
      await admin.auth.admin.deleteUser(umkm.user_id);
    }

    revalidatePath("/admin/umkm");
    revalidatePath("/admin");
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Penyebab: Terjadi kesalahan sistem tak terduga saat menghapus UMKM.\nSolusi: Silakan coba lagi.",
    };
  }
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
    if (deleteError) return { error: "Penyebab: Gagal membersihkan kategori lama.\nSolusi: Coba simpan kembali." };

    if (categoryIds.length) {
      const { error } = await supabase.from("umkm_kategori").insert(
        categoryIds.map((kategori_id) => ({ umkm_id: umkmId, kategori_id })),
      );
      if (error) return { error: "Penyebab: Gagal menambahkan kategori terpilih.\nSolusi: Silakan coba lagi." };
    }

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Penyebab: Kategori gagal diperbarui.\nSolusi: Periksa koneksi internet Anda.",
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
    const rt = data.rt?.trim() ?? "";
    const rw = data.rw?.trim() ?? "";
    const dukuh = data.dukuh?.trim() ?? "";
    const dusun = data.dusun?.trim() ?? "";
    const alamatLengkap = data.alamat_lengkap?.trim() ?? "";
    const noWa = data.no_wa?.trim() ?? "";
    const password = data.password?.trim() ?? "";

    if (!nama || !pemilik || !rt || !rw || !dukuh || !dusun || !alamatLengkap || !noWa) {
      return { error: "Gagal Memperbarui Profil\nPenyebab: Kolom wajib (Nama, Pemilik, RT, RW, Dukuh, Dusun, Alamat Lengkap, No. WA) masih ada yang kosong.\nSolusi: Lengkapi seluruh kolom bertanda bintang merah (*) sebelum menyimpan." };
    }
    if (!/^\d+$/.test(rt) || !/^\d+$/.test(rw) || !/^[+\d\s()-]+$/.test(noWa)) {
      return { error: "Gagal Memperbarui Profil\nPenyebab: Format input angka RT/RW atau No. WA tidak valid.\nSolusi: Pastikan RT/RW hanya berupa angka dan No. WA diisi angka valid." };
    }

    if (password && password.length < 6) {
      return { error: "Penyebab: Password baru terlalu pendek.\nSolusi: Password harus terdiri dari minimal 6 karakter." };
    }
    const limitError = firstLimitError([
      { label: "Nama UMKM", value: nama, max: FORM_LIMITS.umkmName },
      { label: "Nama pemilik", value: pemilik, max: FORM_LIMITS.personName },
      { label: "RT", value: data.rt, max: FORM_LIMITS.rtRw },
      { label: "RW", value: data.rw, max: FORM_LIMITS.rtRw },
      { label: "Dukuh", value: data.dukuh, max: FORM_LIMITS.villageName },
      { label: "Dusun", value: data.dusun, max: FORM_LIMITS.villageName },
      { label: "Alamat lengkap", value: data.alamat_lengkap, max: FORM_LIMITS.address },
      { label: "Nomor WhatsApp", value: noWa, max: FORM_LIMITS.phone },
      { label: "Instagram", value: data.instagram, max: FORM_LIMITS.socialHandle },
      { label: "TikTok", value: data.tiktok, max: FORM_LIMITS.socialHandle },
      { label: "Facebook", value: data.facebook, max: FORM_LIMITS.socialHandle },
      { label: "Shopee", value: data.shopee, max: FORM_LIMITS.url },
      { label: "Tokopedia", value: data.tokopedia, max: FORM_LIMITS.url },
      { label: "Google Maps", value: data.google_maps, max: FORM_LIMITS.url },
      { label: "Keunggulan produk 1", value: data.keunggulan1, max: FORM_LIMITS.advantage },
      { label: "Keunggulan produk 2", value: data.keunggulan2, max: FORM_LIMITS.advantage },
      { label: "Keunggulan produk 3", value: data.keunggulan3, max: FORM_LIMITS.advantage },
      { label: "Keunggulan produk 4", value: data.keunggulan4, max: FORM_LIMITS.advantage },
      { label: "Password", value: password, max: FORM_LIMITS.password },
    ]);
    if (limitError) return { error: `Penyebab: ${limitError}\nSolusi: Singkatkan isian teks sesuai batas maksimum.` };

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
    if (error) return { error: "Penyebab: Gagal memperbarui data UMKM di database.\nSolusi: Coba simpan kembali dalam beberapa detik." };

    const admin = createAdminClient();

    if (password) {
      const { error: passwordError } = await admin.auth.admin.updateUserById(
        umkm.user_id,
        { password },
      );
      if (passwordError) return { error: "Penyebab: Gagal mengubah password akun.\nSolusi: Pastikan password memenuhi syarat minimum." };
    }

    if (noWa !== umkm.no_wa) {
      const normalizedPhone = phone(noWa);
      const authEmail = `umkm+${normalizedPhone.replace(/\D/g, "")}@umkm.local`;
      const { error: emailError } = await admin.auth.admin.updateUserById(
        umkm.user_id,
        { email: authEmail, email_confirm: true },
      );
      if (emailError) return { error: "Penyebab: Gagal mengaitkan No. WA dengan kredensial login.\nSolusi: Periksa format nomor WhatsApp." };
      await admin.from("profiles").update({ login_email: authEmail }).eq("id", umkm.user_id);
    }

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Penyebab: Profil UMKM gagal disimpan.\nSolusi: Periksa jaringan Anda.",
    };
  }
}

export async function createProduct(
  umkmId: number,
  input: { name: string; description: string; price: string; priceMax?: string; isRange?: boolean },
): Promise<ActionResult & { id?: number }> {
  try {
    const { supabase } = await assertCanManageUmkm(umkmId);

    const nama = input.name.trim();
    const isRange = Boolean(input.isRange);
    const harga = Number(input.price.replace(/\D/g, "") || "0");
    const hargaMax = isRange ? Number(input.priceMax?.replace(/\D/g, "") || "0") : null;

    if (!nama) return { error: "Gagal Menambahkan Produk\nPenyebab: Nama produk belum diisi.\nSolusi: Tuliskan nama produk sebelum menyimpan." };
    const limitError = firstLimitError([{ label: "Nama produk", value: nama, max: FORM_LIMITS.productName }, { label: "Deskripsi produk", value: input.description, max: FORM_LIMITS.productDescription }]);
    if (limitError) return { error: `Gagal Menambahkan Produk\nPenyebab: ${limitError}\nSolusi: Kurangi jumlah karakter produk.` };

    if (Number.isNaN(harga) || harga < 0) {
      return { error: "Gagal Menambahkan Produk\nPenyebab: Format nominal harga tidak valid.\nSolusi: Isi angka harga dengan benar (tanpa huruf)." };
    }

    if (isRange) {
      if (hargaMax === null || Number.isNaN(hargaMax) || hargaMax < 0) {
        return { error: "Gagal Menambahkan Produk\nPenyebab: Batas harga maksimal tidak valid.\nSolusi: Masukkan nominal harga maksimal dengan angka yang benar." };
      }
      if (hargaMax < harga) {
        return { error: "Gagal Menambahkan Produk\nPenyebab: Batas maksimal harga tidak boleh lebih kecil dari batas minimal harga.\nSolusi: Pastikan nominal batas maksimal lebih besar atau sama dengan batas minimal." };
      }
    }

    const { data, error } = await supabase
      .from("produk")
      .insert({
        id_umkm: umkmId,
        nama,
        deskripsi: input.description.trim() || null,
        harga,
        harga_max: isRange ? hargaMax : null,
        is_range: isRange,
      })
      .select("id")
      .single();

    if (error || !data) return { error: "Gagal Menambahkan Produk\nPenyebab: Produk baru gagal disimpan ke server.\nSolusi: Coba simpan kembali." };

    revalidateUmkm(umkmId);
    return { error: null, id: data.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gagal Menambahkan Produk\nPenyebab: Terjadi gangguan saat membuat produk baru.\nSolusi: Periksa koneksi internet Anda.",
    };
  }
}

export async function updateProduct(
  umkmId: number,
  productId: number,
  input: { name: string; description: string; price: string; priceMax?: string; isRange?: boolean },
): Promise<ActionResult> {
  try {
    const { supabase } = await assertCanManageUmkm(umkmId);

    const nama = input.name.trim();
    const isRange = Boolean(input.isRange);
    const harga = Number(input.price.replace(/\D/g, "") || "0");
    const hargaMax = isRange ? Number(input.priceMax?.replace(/\D/g, "") || "0") : null;

    if (!nama) return { error: "Gagal Memperbarui Produk\nPenyebab: Nama produk wajib diisi.\nSolusi: Masukkan nama produk terlebih dahulu." };
    const limitError = firstLimitError([{ label: "Nama produk", value: nama, max: FORM_LIMITS.productName }, { label: "Deskripsi produk", value: input.description, max: FORM_LIMITS.productDescription }]);
    if (limitError) return { error: `Gagal Memperbarui Produk\nPenyebab: ${limitError}\nSolusi: Kurangi panjang teks produk.` };

    if (Number.isNaN(harga) || harga < 0) {
      return { error: "Gagal Memperbarui Produk\nPenyebab: Angka harga tidak valid.\nSolusi: Isi nominal harga dengan angka positif." };
    }

    if (isRange) {
      if (hargaMax === null || Number.isNaN(hargaMax) || hargaMax < 0) {
        return { error: "Gagal Memperbarui Produk\nPenyebab: Batas harga maksimal tidak valid.\nSolusi: Masukkan nominal harga maksimal dengan angka yang benar." };
      }
      if (hargaMax < harga) {
        return { error: "Gagal Memperbarui Produk\nPenyebab: Batas maksimal harga tidak boleh lebih kecil dari batas minimal harga.\nSolusi: Pastikan nominal batas maksimal lebih besar atau sama dengan batas minimal." };
      }
    }

    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        deskripsi: input.description.trim() || null,
        harga,
        harga_max: isRange ? hargaMax : null,
        is_range: isRange,
      })
      .eq("id", productId)
      .eq("id_umkm", umkmId);

    if (error) return { error: "Gagal Memperbarui Produk\nPenyebab: Produk gagal diperbarui di server.\nSolusi: Coba simpan kembali." };

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gagal Memperbarui Produk\nPenyebab: Terjadi masalah saat menyimpan data produk.\nSolusi: Periksa koneksi internet.",
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

    if (error) return { error: "Penyebab: Gagal menghapus data produk dari server.\nSolusi: Coba klik hapus kembali." };

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Penyebab: Produk gagal dihapus.\nSolusi: Periksa jaringan internet.",
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
      return { error: "Penyebab: Slot gambar tidak valid.\nSolusi: Pilih slot gambar yang tersedia." };
    }

    const { supabase } = await assertCanManageUmkm(umkmId);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Penyebab: File gambar belum dipilih.\nSolusi: Silakan pilih file foto dari perangkat Anda." };
    }

    if (!ALLOWED_MIME.includes(file.type) || file.size > MAX_FILE_SIZE) {
      return {
        error: "Penyebab: Format file tidak didukung atau ukuran gambar > 2 MB.\nSolusi: Gunakan foto berformat JPEG/PNG dengan ukuran maksimal 2 MB.",
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

    if (uploadError) return { error: "Penyebab: Gagal mengunggah foto ke penyimpanan server.\nSolusi: Periksa koneksi internet dan coba lagi." };

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
      return { error: "Penyebab: Gagal mendaftarkan foto ke database.\nSolusi: Coba unggah ulang gambar." };
    }

    if (existing?.storage_path && existing.storage_path !== storagePath) {
      await supabase.storage.from("umkm-media").remove([existing.storage_path]);
    }

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Penyebab: Gambar gagal diunggah.\nSolusi: Coba beberapa saat lagi.",
    };
  }
}

export async function deleteUmkmImage(
  umkmId: number,
  slot: ImageSlot,
): Promise<ActionResult> {
  try {
    if (!IMAGE_SLOTS.includes(slot)) {
      return { error: "Penyebab: Slot gambar tidak dikenali.\nSolusi: Pilih slot gambar yang sesuai." };
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

    if (dbError) return { error: "Penyebab: Gagal menghapus catatan gambar di database.\nSolusi: Coba hapus lagi." };

    await supabase.storage.from("umkm-media").remove([existing.storage_path]);

    revalidateUmkm(umkmId);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Penyebab: Gambar gagal dihapus.\nSolusi: Silakan periksa jaringan Anda.",
    };
  }
}
