"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FORM_LIMITS } from "@/lib/form-limits";

type LoginState = { error?: string };

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  if (value.startsWith("+")) return `+${digits}`;

  return `+${digits}`;
}

function umkmAuthEmailFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `umkm+${digits}@umkm.local`;
}

async function ensureUmkmEmailIdentity(admin: ReturnType<typeof createAdminClient>, umkmUserId: string, normalizedPhone: string) {
  const expectedEmail = umkmAuthEmailFromPhone(normalizedPhone);
  const { data: user, error: userError } = await admin.auth.admin.getUserById(umkmUserId);
  if (userError || !user.user) {
    throw new Error("Gagal memuat akun UMKM.");
  }

  if (user.user.email !== expectedEmail) {
    const { error } = await admin.auth.admin.updateUserById(umkmUserId, {
      email: expectedEmail,
      email_confirm: true,
    });
    if (error) {
      throw new Error("Gagal memperbarui identitas akun UMKM.");
    }
    await admin.from("profiles").update({ login_email: expectedEmail }).eq("id", umkmUserId);
  }
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const identity = String(formData.get("identity") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identity || !password) {
    return { error: "Nomor HP atau username dan password wajib diisi." };
  }
  if (identity.length > FORM_LIMITS.username || password.length > FORM_LIMITS.password) {
    return { error: "Data masuk melebihi batas karakter yang diizinkan." };
  }

  const supabase = await createClient();
  const isPhone = /^[+\d\s()-]+$/.test(identity);

  const { data, error } = isPhone
    ? await (async () => {
        const admin = createAdminClient();
        const normalizedPhone = normalizePhone(identity);
        const rawDigits = identity.replace(/\D/g, "");
        const query = `no_wa.eq.${normalizedPhone},no_wa.eq.${rawDigits}`;
        const { data: umkm } = await admin
          .from("umkm")
          .select("user_id")
          .or(query)
          .maybeSingle();

        if (!umkm?.user_id) {
          return { data: null, error: new Error("Akun tidak ditemukan.") };
        }

        await ensureUmkmEmailIdentity(admin, umkm.user_id, normalizedPhone);

        return supabase.auth.signInWithPassword({
          email: umkmAuthEmailFromPhone(normalizedPhone),
          password,
        });
      })()
    : await (async () => {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("login_email")
          .ilike("username", identity)
          .eq("role", "admin")
          .maybeSingle();

        if (!profile?.login_email) {
          return { data: null, error: new Error("Akun tidak ditemukan.") };
        }

        return supabase.auth.signInWithPassword({
          email: profile.login_email,
          password,
        });
      })();

  if (error || !data.user) {
    return { error: "Nomor HP/username atau password tidak sesuai." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role === "admin") redirect("/admin");

  const { data: umkm } = await admin
    .from("umkm")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!umkm) {
    await supabase.auth.signOut();
    return { error: "Profil UMKM untuk akun ini belum tersedia." };
  }

  redirect(`/admin/umkm/${umkm.id}`);
}
