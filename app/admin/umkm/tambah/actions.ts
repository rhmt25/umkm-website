"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim() || null; }
function normalizePhone(input: string) { const digits = input.replace(/\D/g, ""); if (digits.startsWith("0")) return `+62${digits.slice(1)}`; if (digits.startsWith("62")) return `+${digits}`; if (input.startsWith("+")) return `+${digits}`; return `+${digits}`; }
function umkmAuthEmail(phone: string) { const digits = phone.replace(/\D/g, ""); return `umkm+${digits}@umkm.local`; }
function slugify(name: string) { return `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 8)}`; }

export async function createUmkm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "admin") throw new Error("Akses ditolak.");
  const nama = value(formData, "nama"); const pemilik = value(formData, "pemilik"); const noWa = value(formData, "no_wa"); const password = String(formData.get("password") ?? "");
  if (!nama || !pemilik || !noWa || password.length < 6) throw new Error("Nama, pemilik, nomor WhatsApp, dan password minimal 6 karakter wajib diisi.");
  const normalizedPhone = normalizePhone(noWa);
  const admin = createAdminClient();
  const email = umkmAuthEmail(normalizedPhone);
  const { data: auth, error: authError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (authError || !auth.user) throw new Error(authError?.message ?? "Akun UMKM gagal dibuat.");
  const { error: profileError } = await admin.from("profiles").insert({ id: auth.user.id, role: "umkm", login_email: email });
  if (profileError) { await admin.auth.admin.deleteUser(auth.user.id); throw new Error("Profil UMKM gagal dibuat."); }
  const payload = { user_id: auth.user.id, slug: slugify(nama), nama, pemilik, no_wa: normalizedPhone, rt: value(formData,"rt"), rw: value(formData,"rw"), dukuh: value(formData,"dukuh"), dusun: value(formData,"dusun"), alamat_lengkap: value(formData,"alamat_lengkap"), instagram: value(formData,"instagram"), tiktok: value(formData,"tiktok"), facebook: value(formData,"facebook"), shopee: value(formData,"shopee"), tokopedia: value(formData,"tokopedia"), google_maps: value(formData,"google_maps"), keunggulan1: value(formData,"keunggulan1"), keunggulan2: value(formData,"keunggulan2"), keunggulan3: value(formData,"keunggulan3"), keunggulan4: value(formData,"keunggulan4") };
  const { data: umkm, error: umkmError } = await admin.from("umkm").insert(payload).select("id").single();

  if (umkmError || !umkm?.id) {
    await admin.from("profiles").delete().eq("id", auth.user.id);
    await admin.auth.admin.deleteUser(auth.user.id);
    const message = umkmError?.message ? `${umkmError.message} ` : "";
    throw new Error(`${message}Data UMKM gagal disimpan.`);
  }

  revalidatePath("/admin/umkm"); redirect(`/admin/umkm/${umkm.id}`);
}
