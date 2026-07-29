"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { firstLimitError, FORM_LIMITS } from "@/lib/form-limits";

export type CreateUmkmState = { error?: string; umkmId?: number };

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim() || null; }
function normalizePhone(input: string) { const digits = input.replace(/\D/g, ""); if (digits.startsWith("0")) return `+62${digits.slice(1)}`; if (digits.startsWith("62")) return `+${digits}`; if (input.startsWith("+")) return `+${digits}`; return `+${digits}`; }
function umkmAuthEmail(phone: string) { return `umkm+${phone.replace(/\D/g, "")}@umkm.local`; }
function slugify(name: string) { return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "umkm"; }

export async function createUmkm(_previous: CreateUmkmState, formData: FormData): Promise<CreateUmkmState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
    if (profile?.role !== "admin") return { error: "Sesi Anda sudah berakhir. Silakan masuk kembali." };

    const nama = value(formData, "nama"); const pemilik = value(formData, "pemilik"); const noWa = value(formData, "no_wa"); const password = String(formData.get("password") ?? "");
    if (!nama || !pemilik || !noWa || password.length < 6) return { error: "Nama, pemilik, nomor WhatsApp, dan password minimal 6 karakter wajib diisi." };
    if ((value(formData, "rt") && !/^\d+$/.test(value(formData, "rt")!)) || (value(formData, "rw") && !/^\d+$/.test(value(formData, "rw")!)) || !/^[+\d\s()-]+$/.test(noWa)) return { error: "RT dan RW harus berupa angka. Nomor WhatsApp hanya boleh berisi angka atau tanda telepon." };
    const limitError = firstLimitError([
      { label: "Nama UMKM", value: nama, max: FORM_LIMITS.umkmName }, { label: "Nama pemilik", value: pemilik, max: FORM_LIMITS.personName }, { label: "RT", value: value(formData, "rt"), max: FORM_LIMITS.rtRw }, { label: "RW", value: value(formData, "rw"), max: FORM_LIMITS.rtRw }, { label: "Dukuh", value: value(formData, "dukuh"), max: FORM_LIMITS.villageName }, { label: "Dusun", value: value(formData, "dusun"), max: FORM_LIMITS.villageName }, { label: "Alamat lengkap", value: value(formData, "alamat_lengkap"), max: FORM_LIMITS.address }, { label: "Nomor WhatsApp", value: noWa, max: FORM_LIMITS.phone }, { label: "Instagram", value: value(formData, "instagram"), max: FORM_LIMITS.socialHandle }, { label: "TikTok", value: value(formData, "tiktok"), max: FORM_LIMITS.socialHandle }, { label: "Facebook", value: value(formData, "facebook"), max: FORM_LIMITS.socialHandle }, { label: "Shopee", value: value(formData, "shopee"), max: FORM_LIMITS.url }, { label: "Tokopedia", value: value(formData, "tokopedia"), max: FORM_LIMITS.url }, { label: "Google Maps", value: value(formData, "google_maps"), max: FORM_LIMITS.url }, { label: "Keunggulan produk", value: value(formData, "keunggulan1"), max: FORM_LIMITS.advantage }, { label: "Keunggulan produk", value: value(formData, "keunggulan2"), max: FORM_LIMITS.advantage }, { label: "Keunggulan produk", value: value(formData, "keunggulan3"), max: FORM_LIMITS.advantage }, { label: "Keunggulan produk", value: value(formData, "keunggulan4"), max: FORM_LIMITS.advantage }, { label: "Password", value: password, max: FORM_LIMITS.password },
    ]);
    if (limitError) return { error: limitError };

    const normalizedPhone = normalizePhone(noWa);
    const admin = createAdminClient();
    const email = umkmAuthEmail(normalizedPhone);
    const { data: auth, error: authError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (authError || !auth.user) return { error: "Akun UMKM gagal dibuat. Nomor WhatsApp mungkin sudah digunakan." };
    const { error: profileError } = await admin.from("profiles").insert({ id: auth.user.id, role: "umkm", login_email: email });
    if (profileError) { await admin.auth.admin.deleteUser(auth.user.id); return { error: "Akun UMKM gagal disiapkan. Silakan coba lagi." }; }

    const baseSlug = slugify(nama);
    const { data: duplicate } = await admin.from("umkm").select("id").eq("slug", baseSlug).maybeSingle();
    const insertSlug = duplicate ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}` : baseSlug;
    const { data: umkm, error: umkmError } = await admin.from("umkm").insert({ user_id: auth.user.id, slug: insertSlug, nama, pemilik, no_wa: normalizedPhone, rt: value(formData,"rt"), rw: value(formData,"rw"), dukuh: value(formData,"dukuh"), dusun: value(formData,"dusun"), alamat_lengkap: value(formData,"alamat_lengkap"), instagram: value(formData,"instagram"), tiktok: value(formData,"tiktok"), facebook: value(formData,"facebook"), shopee: value(formData,"shopee"), tokopedia: value(formData,"tokopedia"), google_maps: value(formData,"google_maps"), keunggulan1: value(formData,"keunggulan1"), keunggulan2: value(formData,"keunggulan2"), keunggulan3: value(formData,"keunggulan3"), keunggulan4: value(formData,"keunggulan4") }).select("id").single();
    if (umkmError || !umkm?.id) { await admin.from("profiles").delete().eq("id", auth.user.id); await admin.auth.admin.deleteUser(auth.user.id); return { error: "Data UMKM gagal disimpan. Silakan coba lagi." }; }
    if (duplicate) await admin.from("umkm").update({ slug: `${baseSlug}-${umkm.id}` }).eq("id", umkm.id);

    revalidatePath("/admin/umkm");
    return { umkmId: umkm.id };
  } catch {
    return { error: "Terjadi gangguan saat membuat UMKM. Silakan coba lagi." };
  }
}
