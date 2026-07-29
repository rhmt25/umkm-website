"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { firstLimitError, FORM_LIMITS } from "@/lib/form-limits";

type ActionResult = { error: string | null };

const ALLOWED_MIME = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const DESA_ID = 1;

function extFromMime(mime: string) {
  return mime === "image/png" ? "png" : "jpg";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

async function requireAdmin() {
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
  if (profile?.role !== "admin") throw new Error("Akses ditolak.");

  return supabase;
}

function validateImage(file: unknown): file is File {
  return (
    file instanceof File &&
    file.size > 0 &&
    ALLOWED_MIME.includes(file.type) &&
    file.size <= MAX_FILE_SIZE
  );
}

async function removeStoragePath(path: string | null | undefined) {
  if (!path) return;
  const admin = createAdminClient();
  await admin.storage.from("umkm-media").remove([path]);
}

function revalidateDesa() {
  revalidatePath("/admin/desa");
  revalidatePath("/tentang-desa");
  revalidatePath("/");
}

type CoverSlot = "sampul_beranda_path" | "sampul_tentang_path";

async function uploadCoverImage(
  column: CoverSlot,
  prefix: string,
  label: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const file = formData.get("file");
    if (!validateImage(file)) {
      return {
        error: "Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.",
      };
    }

    const { data: desa } = await supabase
      .from("desa")
      .select(column)
      .eq("id", DESA_ID)
      .single();

    const ext = extFromMime(file.type);
    const storagePath = `desa/${prefix}-${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();

    const { error: uploadError } = await admin.storage
      .from("umkm-media")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return { error: `Gambar ${label} gagal diunggah.` };

    const { error: dbError } = await supabase
      .from("desa")
      .update({ [column]: storagePath })
      .eq("id", DESA_ID);

    if (dbError) {
      await admin.storage.from("umkm-media").remove([storagePath]);
      return { error: `Referensi gambar ${label} gagal disimpan.` };
    }

    const oldPath = (desa as Record<string, string | null> | null)?.[column];
    if (oldPath && oldPath !== storagePath) {
      await removeStoragePath(oldPath);
    }

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `Gambar ${label} gagal diunggah.`,
    };
  }
}

async function deleteCoverImage(
  column: CoverSlot,
  label: string,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const { data: desa } = await supabase
      .from("desa")
      .select(column)
      .eq("id", DESA_ID)
      .single();

    const oldPath = (desa as Record<string, string | null> | null)?.[column];
    if (!oldPath) return { error: null };

    const { error } = await supabase
      .from("desa")
      .update({ [column]: null })
      .eq("id", DESA_ID);

    if (error) return { error: `Gambar ${label} gagal dihapus.` };

    await removeStoragePath(oldPath);

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `Gambar ${label} gagal dihapus.`,
    };
  }
}

export async function uploadSampulBerandaImage(
  formData: FormData,
): Promise<ActionResult> {
  return uploadCoverImage("sampul_beranda_path", "sampul-beranda", "sampul beranda", formData);
}

export async function deleteSampulBerandaImage(): Promise<ActionResult> {
  return deleteCoverImage("sampul_beranda_path", "sampul beranda");
}

export async function uploadSampulTentangImage(
  formData: FormData,
): Promise<ActionResult> {
  return uploadCoverImage("sampul_tentang_path", "sampul-tentang", "sampul tentang desa", formData);
}

export async function deleteSampulTentangImage(): Promise<ActionResult> {
  return deleteCoverImage("sampul_tentang_path", "sampul tentang desa");
}

export async function updateDesaProfile(data: {
  address: string;
  phone: string;
  email: string;
  description: string;
  googleMaps: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  username?: string;
  password?: string;
}): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const username = data.username?.trim();
    const password = data.password?.trim();

    if (username !== undefined && !username) {
      return { error: "Username admin wajib diisi." };
    }
    if (data.phone && !/^[+\d\s()-]+$/.test(data.phone)) {
      return { error: "No telepon hanya boleh berisi angka atau tanda telepon." };
    }

    if (password && password.length < 6) {
      return { error: "Password minimal 6 karakter." };
    }
    const limitError = firstLimitError([
      { label: "Alamat", value: data.address, max: FORM_LIMITS.address }, { label: "No telepon", value: data.phone, max: FORM_LIMITS.phone }, { label: "Email", value: data.email, max: FORM_LIMITS.email }, { label: "Tentang desa", value: data.description, max: FORM_LIMITS.villageDescription }, { label: "Link Google Maps", value: data.googleMaps, max: FORM_LIMITS.url }, { label: "Link Facebook", value: data.facebook, max: FORM_LIMITS.url }, { label: "Link Instagram", value: data.instagram, max: FORM_LIMITS.url }, { label: "Link TikTok", value: data.tiktok, max: FORM_LIMITS.url }, { label: "Link YouTube", value: data.youtube, max: FORM_LIMITS.url }, { label: "Username admin", value: username, max: FORM_LIMITS.username }, { label: "Password", value: password, max: FORM_LIMITS.password },
    ]);
    if (limitError) return { error: limitError };

    const { error } = await supabase
      .from("desa")
      .update({
        alamat: optional(data.address),
        no_telepon: optional(data.phone),
        email: optional(data.email),
        tentang: optional(data.description),
        google_maps: optional(data.googleMaps),
        facebook: optional(data.facebook),
        instagram: optional(data.instagram),
        tiktok: optional(data.tiktok),
        youtube: optional(data.youtube),
      })
      .eq("id", DESA_ID);

    if (error) return { error: "Data desa gagal disimpan." };

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();

      if (username) {
        const { data: existing } = await admin
          .from("profiles")
          .select("id")
          .ilike("username", username)
          .neq("id", user.id)
          .maybeSingle();

        if (existing) {
          return { error: "Username sudah digunakan oleh akun lain." };
        }

        const { error: profileError } = await admin
          .from("profiles")
          .update({ username })
          .eq("id", user.id);

        if (profileError) return { error: "Username admin gagal diperbarui." };
      }

      if (password) {
        const { error: passwordError } = await admin.auth.admin.updateUserById(
          user.id,
          { password },
        );
        if (passwordError) return { error: "Password admin gagal diperbarui." };
      }
    }

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Data desa gagal disimpan.",
    };
  }
}

export async function uploadBalaiDesaImage(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const file = formData.get("file");
    if (!validateImage(file)) {
      return {
        error: "Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.",
      };
    }

    const { data: desa } = await supabase
      .from("desa")
      .select("balai_desa_path")
      .eq("id", DESA_ID)
      .single();

    const ext = extFromMime(file.type);
    const storagePath = `desa/balai-${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();

    const { error: uploadError } = await admin.storage
      .from("umkm-media")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return { error: "Gambar balai desa gagal diunggah." };

    const { error: dbError } = await supabase
      .from("desa")
      .update({ balai_desa_path: storagePath })
      .eq("id", DESA_ID);

    if (dbError) {
      await admin.storage.from("umkm-media").remove([storagePath]);
      return { error: "Referensi gambar balai desa gagal disimpan." };
    }

    if (desa?.balai_desa_path && desa.balai_desa_path !== storagePath) {
      await removeStoragePath(desa.balai_desa_path);
    }

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gambar balai desa gagal diunggah.",
    };
  }
}

export async function deleteBalaiDesaImage(): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const { data: desa } = await supabase
      .from("desa")
      .select("balai_desa_path")
      .eq("id", DESA_ID)
      .single();

    if (!desa?.balai_desa_path) return { error: null };

    const { error } = await supabase
      .from("desa")
      .update({ balai_desa_path: null })
      .eq("id", DESA_ID);

    if (error) return { error: "Gambar balai desa gagal dihapus." };

    await removeStoragePath(desa.balai_desa_path);

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gambar balai desa gagal dihapus.",
    };
  }
}

export async function uploadDesaGalleryImage(
  urutan: number,
  formData: FormData,
): Promise<ActionResult> {
  try {
    if (urutan < 1 || urutan > 6) {
      return { error: "Urutan galeri tidak valid." };
    }

    const supabase = await requireAdmin();
    const file = formData.get("file");
    if (!validateImage(file)) {
      return {
        error: "Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.",
      };
    }

    const { data: existing } = await supabase
      .from("desa_images")
      .select("storage_path")
      .eq("desa_id", DESA_ID)
      .eq("urutan", urutan)
      .maybeSingle();

    const ext = extFromMime(file.type);
    const storagePath = `desa/gallery-${urutan}-${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();

    const { error: uploadError } = await admin.storage
      .from("umkm-media")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return { error: "Gambar galeri gagal diunggah." };

    const { error: dbError } = await supabase.from("desa_images").upsert(
      {
        desa_id: DESA_ID,
        urutan,
        storage_path: storagePath,
      },
      { onConflict: "desa_id,urutan" },
    );

    if (dbError) {
      await admin.storage.from("umkm-media").remove([storagePath]);
      return { error: "Referensi gambar galeri gagal disimpan." };
    }

    if (existing?.storage_path && existing.storage_path !== storagePath) {
      await removeStoragePath(existing.storage_path);
    }

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gambar galeri gagal diunggah.",
    };
  }
}

export async function updateDesaGalleryDescription(
  urutan: number,
  description: string,
): Promise<ActionResult> {
  try {
    if (urutan < 1 || urutan > 6) {
      return { error: "Urutan galeri tidak valid." };
    }
    const limitError = firstLimitError([{ label: "Deskripsi gambar", value: description, max: FORM_LIMITS.imageDescription }]);
    if (limitError) return { error: limitError };

    const supabase = await requireAdmin();

    const { data: existing } = await supabase
      .from("desa_images")
      .select("storage_path")
      .eq("desa_id", DESA_ID)
      .eq("urutan", urutan)
      .maybeSingle();

    if (!existing) {
      return { error: "Unggah gambar terlebih dahulu sebelum menyimpan deskripsi." };
    }

    const { error } = await supabase
      .from("desa_images")
      .update({ deskripsi: optional(description) })
      .eq("desa_id", DESA_ID)
      .eq("urutan", urutan);

    if (error) return { error: "Deskripsi gambar gagal disimpan." };

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Deskripsi gambar gagal disimpan.",
    };
  }
}

export async function deleteDesaGalleryImage(
  urutan: number,
): Promise<ActionResult> {
  try {
    if (urutan < 1 || urutan > 6) {
      return { error: "Urutan galeri tidak valid." };
    }

    const supabase = await requireAdmin();

    const { data: existing } = await supabase
      .from("desa_images")
      .select("storage_path")
      .eq("desa_id", DESA_ID)
      .eq("urutan", urutan)
      .maybeSingle();

    if (!existing) return { error: null };

    const { error } = await supabase
      .from("desa_images")
      .delete()
      .eq("desa_id", DESA_ID)
      .eq("urutan", urutan);

    if (error) return { error: "Gambar galeri gagal dihapus." };

    await removeStoragePath(existing.storage_path);

    revalidateDesa();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gambar galeri gagal dihapus.",
    };
  }
}
