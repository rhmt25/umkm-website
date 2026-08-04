"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FORM_LIMITS } from "@/lib/form-limits";

export type LoginState = { error?: string; redirectUrl?: string };

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

async function ensureUmkmEmailIdentity(
  admin: ReturnType<typeof createAdminClient>,
  umkmUserId: string,
  normalizedPhone: string,
) {
  const expectedEmail = umkmAuthEmailFromPhone(normalizedPhone);
  const { data: user, error: userError } =
    await admin.auth.admin.getUserById(umkmUserId);
  if (userError || !user.user) {
    throw new Error("Gagal Masuk\nPenyebab: Akun UMKM gagal dimuat.\nSolusi: Hubungi pihak admin desa.");
  }

  if (user.user.email !== expectedEmail) {
    const { error } = await admin.auth.admin.updateUserById(umkmUserId, {
      email: expectedEmail,
      email_confirm: true,
    });
    if (error) {
      throw new Error("Gagal Masuk\nPenyebab: Gagal memperbarui identitas akun UMKM.\nSolusi: Silakan coba lagi nanti.");
    }
    await admin.from("profiles").update({ login_email: expectedEmail }).eq("id", umkmUserId);
  }
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const identity = String(formData.get("identity") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!identity || !password) {
      return {
        error:
          "Gagal Masuk\nPenyebab: Identitas (Nomor HP/Username) atau Password belum diisi.\nSolusi: Mohon lengkapi seluruh kolom masukan yang wajib diisi.",
      };
    }
    if (
      identity.length > FORM_LIMITS.username ||
      password.length > FORM_LIMITS.password
    ) {
      return {
        error:
          "Gagal Masuk\nPenyebab: Isian karakter melebihi batas yang diizinkan.\nSolusi: Kurangi jumlah karakter masukan Anda.",
      };
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
            return {
              data: null,
              error: new Error(
                "Gagal Masuk\nPenyebab: Akun UMKM dengan nomor WhatsApp ini tidak terdaftar.\nSolusi: Periksa kembali nomor yang Anda masukkan atau hubungi Admin.",
              ),
            };
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
            return {
              data: null,
              error: new Error(
                "Gagal Masuk\nPenyebab: Akun admin tidak ditemukan.\nSolusi: Pastikan username admin Anda sudah benar.",
              ),
            };
          }

          return supabase.auth.signInWithPassword({
            email: profile.login_email,
            password,
          });
        })();

    if (error || !data.user) {
      return {
        error:
          "Gagal Masuk\nPenyebab: Nomor HP/Username atau Password tidak sesuai.\nSolusi: Periksa kembali ejaan username/nomor HP serta kata sandi Anda.",
      };
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role === "admin") return { redirectUrl: "/admin" };

    const { data: umkm } = await admin
      .from("umkm")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!umkm) {
      await supabase.auth.signOut();
      return {
        error:
          "Gagal Masuk\nPenyebab: Profil UMKM belum dikaitkan dengan akun ini.\nSolusi: Hubungi administrator untuk penautan akun.",
      };
    }

    return { redirectUrl: "/admin" };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal Masuk\nPenyebab: Gangguan koneksi atau masalah sistem pada server.\nSolusi: Silakan coba beberapa saat lagi.",
    };
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}

