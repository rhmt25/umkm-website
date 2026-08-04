"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { firstLimitError, FORM_LIMITS } from "@/lib/form-limits";

export type CreateUmkmState = { error?: string; umkmId?: number };

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  if (input.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

function umkmAuthEmail(phone: string) {
  return `umkm+${phone.replace(/\D/g, "")}@umkm.local`;
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "umkm"
  );
}

export async function createUmkm(
  _previous: CreateUmkmState,
  formData: FormData,
): Promise<CreateUmkmState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).single()
      : { data: null };
    if (profile?.role !== "admin")
      return {
        error:
          "Gagal Menyimpan UMKM\nPenyebab: Sesi admin Anda sudah berakhir atau tidak valid.\nSolusi: Silakan masuk kembali ke akun admin.",
      };

    const nama = value(formData, "nama");
    const pemilik = value(formData, "pemilik");
    const rt = value(formData, "rt");
    const rw = value(formData, "rw");
    const dukuh = value(formData, "dukuh");
    const dusun = value(formData, "dusun");
    const alamatLengkap = value(formData, "alamat_lengkap");
    const noWa = value(formData, "no_wa");
    const password = String(formData.get("password") ?? "");

    if (!nama || !pemilik || !rt || !rw || !dukuh || !dusun || !alamatLengkap || !noWa || password.length < 6)
      return {
        error:
          "Gagal Menyimpan UMKM\nPenyebab: Kolom wajib (Nama UMKM, Pemilik, RT, RW, Dukuh, Dusun, Alamat Lengkap, No. WA) atau Password belum terisi.\nSolusi: Lengkapi seluruh kolom bertanda bintang (*) dan pastikan password minimal 6 karakter.",
      };

    if (
      !/^\d+$/.test(rt) ||
      !/^\d+$/.test(rw) ||
      !/^[+\d\s()-]+$/.test(noWa)
    )
      return {
        error:
          "Gagal Menyimpan UMKM\nPenyebab: Format RT/RW atau No. WhatsApp tidak valid.\nSolusi: RT/RW harus berupa angka. No. WA hanya boleh berisi angka, +, spasi, atau tanda -.",
      };

    const limitError = firstLimitError([
      { label: "Nama UMKM", value: nama, max: FORM_LIMITS.umkmName },
      { label: "Nama pemilik", value: pemilik, max: FORM_LIMITS.personName },
      { label: "RT", value: rt, max: FORM_LIMITS.rtRw },
      { label: "RW", value: rw, max: FORM_LIMITS.rtRw },
      { label: "Dukuh", value: dukuh, max: FORM_LIMITS.villageName },
      { label: "Dusun", value: dusun, max: FORM_LIMITS.villageName },
      { label: "Alamat lengkap", value: alamatLengkap, max: FORM_LIMITS.address },
      { label: "Nomor WhatsApp", value: noWa, max: FORM_LIMITS.phone },
      { label: "Instagram", value: value(formData, "instagram"), max: FORM_LIMITS.socialHandle },
      { label: "TikTok", value: value(formData, "tiktok"), max: FORM_LIMITS.socialHandle },
      { label: "Facebook", value: value(formData, "facebook"), max: FORM_LIMITS.socialHandle },
      { label: "Shopee", value: value(formData, "shopee"), max: FORM_LIMITS.url },
      { label: "Tokopedia", value: value(formData, "tokopedia"), max: FORM_LIMITS.url },
      { label: "Google Maps", value: value(formData, "google_maps"), max: FORM_LIMITS.url },
      { label: "Keunggulan produk 1", value: value(formData, "keunggulan1"), max: FORM_LIMITS.advantage },
      { label: "Keunggulan produk 2", value: value(formData, "keunggulan2"), max: FORM_LIMITS.advantage },
      { label: "Keunggulan produk 3", value: value(formData, "keunggulan3"), max: FORM_LIMITS.advantage },
      { label: "Keunggulan produk 4", value: value(formData, "keunggulan4"), max: FORM_LIMITS.advantage },
      { label: "Password", value: password, max: FORM_LIMITS.password },
    ]);
    if (limitError)
      return { error: `Gagal Menyimpan UMKM\nPenyebab: ${limitError}\nSolusi: Kurangi jumlah karakter sesuai batas yang ditentukan.` };

    const normalizedPhone = normalizePhone(noWa);
    const admin = createAdminClient();
    const email = umkmAuthEmail(normalizedPhone);

    const { data: auth, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !auth.user)
      return {
        error:
          "Gagal Membuat Akun UMKM\nPenyebab: Akun UMKM gagal dibuat. Nomor WhatsApp mungkin sudah digunakan oleh UMKM lain.\nSolusi: Gunakan nomor WhatsApp yang belum terdaftar.",
      };

    const { error: profileError } = await admin
      .from("profiles")
      .insert({ id: auth.user.id, role: "umkm", login_email: email });
    if (profileError) {
      await admin.auth.admin.deleteUser(auth.user.id);
      return {
        error:
          "Gagal Menyiapkan Akun\nPenyebab: Gagal menyiapkan profil akun UMKM.\nSolusi: Silakan coba lagi dalam beberapa detik.",
      };
    }

    const baseSlug = slugify(nama);
    const { data: duplicate } = await admin
      .from("umkm")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();
    const insertSlug = duplicate
      ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
      : baseSlug;

    const { data: umkm, error: umkmError } = await admin
      .from("umkm")
      .insert({
        user_id: auth.user.id,
        slug: insertSlug,
        nama,
        pemilik,
        no_wa: normalizedPhone,
        rt,
        rw,
        dukuh,
        dusun,
        alamat_lengkap: alamatLengkap,
        instagram: value(formData, "instagram"),
        tiktok: value(formData, "tiktok"),
        facebook: value(formData, "facebook"),
        shopee: value(formData, "shopee"),
        tokopedia: value(formData, "tokopedia"),
        google_maps: value(formData, "google_maps"),
        keunggulan1: value(formData, "keunggulan1"),
        keunggulan2: value(formData, "keunggulan2"),
        keunggulan3: value(formData, "keunggulan3"),
        keunggulan4: value(formData, "keunggulan4"),
      })
      .select("id")
      .single();

    if (umkmError || !umkm?.id) {
      await admin.from("profiles").delete().eq("id", auth.user.id);
      await admin.auth.admin.deleteUser(auth.user.id);
      return {
        error:
          "Gagal Menyimpan Data\nPenyebab: Data UMKM gagal disimpan ke database.\nSolusi: Silakan coba simpan kembali.",
      };
    }

    if (duplicate)
      await admin.from("umkm").update({ slug: `${baseSlug}-${umkm.id}` }).eq("id", umkm.id);

    revalidatePath("/admin/umkm");
    return { umkmId: umkm.id };
  } catch {
    return {
      error:
        "Gagal Menyimpan Data\nPenyebab: Terjadi gangguan tak terduga saat membuat UMKM.\nSolusi: Periksa koneksi internet dan silakan coba lagi.",
    };
  }
}
