"use client";
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ExternalLink, ImagePlus, Save, Upload, X } from "lucide-react";
import {
  deleteBalaiDesaImage,
  deleteDesaGalleryImage,
  deleteSampulBerandaImage,
  deleteSampulTentangImage,
  updateDesaGalleryDescription,
  updateDesaProfile,
  uploadBalaiDesaImage,
  uploadDesaGalleryImage,
  uploadSampulBerandaImage,
  uploadSampulTentangImage,
} from "@/app/admin/desa/actions";
import { FORM_LIMITS, characterHint } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";

export type VillageForm = {
  address: string;
  phone: string;
  email: string;
  description: string;
  googleMaps: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  username: string;
  password?: string;
};

export type GalleryItem = {
  id: string;
  label: string;
  image: string;
  description: string;
};

function cloneGallery(items: GalleryItem[]) {
  return items.map((item) => ({ ...item }));
}

const COVER_IDS = new Set(["sampul-beranda", "sampul-tentang", "balai"]);

function galleryUrutan(id: string) {
  if (COVER_IDS.has(id)) return null;
  const match = id.match(/^gambar-(\d+)$/);
  return match ? Number(match[1]) : null;
}

export default function DesaManagement({
  initialForm,
  initialGallery,
}: {
  initialForm: VillageForm;
  initialGallery: GalleryItem[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [savedForm, setSavedForm] = useState(initialForm);
  const [draftForm, setDraftForm] = useState(initialForm);
  const [savedGallery, setSavedGallery] = useState(initialGallery);
  const [draftGallery, setDraftGallery] = useState(initialGallery);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [gallerySuccess, setGallerySuccess] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);

  useEffect(() => {
    setSavedForm(initialForm);
    setDraftForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    setSavedGallery(initialGallery);
    setDraftGallery(initialGallery);
    setPendingFiles({});
  }, [initialGallery]);

  const formChanged = JSON.stringify(savedForm) !== JSON.stringify(draftForm);
  const descriptionsChanged = draftGallery.some((item) => {
    const saved = savedGallery.find((entry) => entry.id === item.id);
    return saved && saved.description !== item.description;
  });
  const galleryChanged =
    Object.keys(pendingFiles).length > 0 || descriptionsChanged;

  function updateForm(key: keyof VillageForm, value: string) {
    if (key === "phone") value = value.replace(/[^\d+\s()-]/g, "");
    setDraftForm((current) => ({ ...current, [key]: value }));
    setFormSuccess("");
  }

  function updateGallery(id: string, update: Partial<GalleryItem>) {
    setDraftGallery((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item)),
    );
    setGallerySuccess("");
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>, id: string) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setGalleryError("Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.");
      showToast("Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.", "error");
      event.target.value = "";
      return;
    }

    setGalleryError("");
    setPendingFiles((current) => ({ ...current, [id]: file }));
    updateGallery(id, { image: URL.createObjectURL(file) });
  }

  async function saveForm() {
    setSavingForm(true);
    setFormError("");
    setFormSuccess("");

    try {
      const result = await updateDesaProfile(draftForm);
      setSavingForm(false);

      if (result.error) {
        showToast(result.error, "error");
        setFormError(result.error);
        return;
      }

      const nextSavedForm = { ...draftForm, password: "" };
      setSavedForm(nextSavedForm);
      setDraftForm(nextSavedForm);
      setFormSuccess("Data desa berhasil disimpan.");
      showToast("Data desa berhasil disimpan.", "success");
      router.refresh();
    } catch (err) {
      setSavingForm(false);
      showToast("Gagal menyimpan data desa karena gangguan sistem. Silakan coba beberapa saat lagi.", "error");
      setFormError("Terjadi kesalahan sistem saat menyimpan data desa.");
      console.error("saveForm error:", err);
    }
  }

  async function saveGallery() {
    setSavingGallery(true);
    setGalleryError("");
    setGallerySuccess("");

    try {
      const coverUploadActions: Record<string, (fd: FormData) => Promise<{ error: string | null }>> = {
        "sampul-beranda": uploadSampulBerandaImage,
        "sampul-tentang": uploadSampulTentangImage,
        "balai": uploadBalaiDesaImage,
      };

      for (const [id, file] of Object.entries(pendingFiles)) {
        const formData = new FormData();
        formData.set("file", file);

        const coverAction = coverUploadActions[id];
        if (coverAction) {
          const result = await coverAction(formData);
          if (result.error) {
            showToast(result.error, "error");
            setGalleryError(result.error);
            setSavingGallery(false);
            return;
          }
          continue;
        }

        const urutan = galleryUrutan(id);
        if (!urutan) continue;

        const result = await uploadDesaGalleryImage(urutan, formData);
        if (result.error) {
          showToast(result.error, "error");
          setGalleryError(result.error);
          setSavingGallery(false);
          return;
        }
      }

      for (const item of draftGallery) {
        const urutan = galleryUrutan(item.id);
        if (!urutan) continue;

        const saved = savedGallery.find((entry) => entry.id === item.id);
        if (!saved || saved.description === item.description) continue;

        const result = await updateDesaGalleryDescription(
          urutan,
          item.description,
        );
        if (result.error) {
          showToast(result.error, "error");
          setGalleryError(result.error);
          setSavingGallery(false);
          return;
        }
      }

      setSavingGallery(false);
      setPendingFiles({});
      setGallerySuccess("Galeri desa berhasil disimpan.");
      showToast("Galeri desa berhasil disimpan.", "success");
      router.refresh();
    } catch (err) {
      setSavingGallery(false);
      showToast("Gagal menyimpan galeri desa karena gangguan sistem. Silakan coba beberapa saat lagi.", "error");
      setGalleryError("Terjadi kesalahan sistem saat menyimpan galeri desa.");
      console.error("saveGallery error:", err);
    }
  }

  function cancelGallery() {
    for (const item of draftGallery) {
      if (pendingFiles[item.id] && item.image.startsWith("blob:")) {
        URL.revokeObjectURL(item.image);
      }
    }

    setDraftGallery(cloneGallery(savedGallery));
    setPendingFiles({});
    setGalleryError("");
    setGallerySuccess("");
  }

  async function removeImage(id: string) {
    const item = draftGallery.find((entry) => entry.id === id);
    if (!item?.image) return;
    if (!window.confirm(`Hapus ${item.label}?`)) return;

    setSavingGallery(true);
    setGalleryError("");
    setGallerySuccess("");

    try {
      const coverDeleteActions: Record<string, () => Promise<{ error: string | null }>> = {
        "sampul-beranda": deleteSampulBerandaImage,
        "sampul-tentang": deleteSampulTentangImage,
        "balai": deleteBalaiDesaImage,
      };

      const coverDeleteAction = coverDeleteActions[id];
      const result = coverDeleteAction
        ? await coverDeleteAction()
        : await deleteDesaGalleryImage(galleryUrutan(id)!);

      setSavingGallery(false);

      if (result.error) {
        showToast(result.error, "error");
        setGalleryError(result.error);
        return;
      }

      setGallerySuccess("Gambar berhasil dihapus.");
      showToast("Gambar berhasil dihapus.", "success");
      router.refresh();
    } catch (err) {
      setSavingGallery(false);
      showToast("Gagal menghapus gambar karena gangguan sistem. Silakan coba beberapa saat lagi.", "error");
      setGalleryError("Terjadi kesalahan sistem saat menghapus gambar.");
      console.error("removeImage error:", err);
    }
  }

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-color1">
          Manajemen Data
        </p>
        <h1 className="mt-1 text-3xl font-bold">Data Desa</h1>
        <p className="mt-2 text-color5/65">
          Kelola informasi, media sosial, dan galeri Desa Masaran.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold">Informasi Desa</h2>
        {formError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}
        {formSuccess && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {formSuccess}
          </p>
        )}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Alamat</span>
            <input
              value={draftForm.address}
              maxLength={FORM_LIMITS.address}
              onChange={(event) => updateForm("address", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.address)}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">No Telepon</span>
            <input
              value={draftForm.phone}
              maxLength={FORM_LIMITS.phone}
              inputMode="tel"
              onChange={(event) => updateForm("phone", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.phone, "Hanya angka, +, spasi, atau tanda -")}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input
              type="email"
              value={draftForm.email}
              maxLength={FORM_LIMITS.email}
              onChange={(event) => updateForm("email", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.email)}</span>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Tentang Desa Masaran
            </span>
            <textarea
              value={draftForm.description}
              maxLength={FORM_LIMITS.villageDescription}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              rows={5}
              className="w-full rounded-xl border border-color4 px-4 py-3 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.villageDescription)}</span>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Link Google Maps
            </span>
            <input
              type="url"
              value={draftForm.googleMaps}
              maxLength={FORM_LIMITS.url}
              onChange={(event) => updateForm("googleMaps", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.url, "URL")}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link Facebook
            </span>
            <input
              type="url"
              value={draftForm.facebook}
              maxLength={FORM_LIMITS.url}
              onChange={(event) => updateForm("facebook", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.url, "URL")}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link Instagram
            </span>
            <input
              type="url"
              value={draftForm.instagram}
              maxLength={FORM_LIMITS.url}
              onChange={(event) => updateForm("instagram", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.url, "URL")}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link TikTok
            </span>
            <input
              type="url"
              value={draftForm.tiktok}
              maxLength={FORM_LIMITS.url}
              onChange={(event) => updateForm("tiktok", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.url, "URL")}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link YouTube
            </span>
            <input
              type="url"
              value={draftForm.youtube}
              maxLength={FORM_LIMITS.url}
              onChange={(event) => updateForm("youtube", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.url, "URL")}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Username Admin</span>
            <input
              type="text"
              value={draftForm.username}
              maxLength={FORM_LIMITS.username}
              onChange={(event) => updateForm("username", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
            <span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.username)}</span>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Password Admin</span>
            <span className="mb-2 block text-xs text-color5/55">
              Kosongkan jika tidak ingin mengubah password. Maksimal {FORM_LIMITS.password} karakter.
            </span>
            <input
              type="password"
              value={draftForm.password ?? ""}
              maxLength={FORM_LIMITS.password}
              onChange={(event) => updateForm("password", event.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!formChanged || savingForm}
            onClick={() => {
              setDraftForm(savedForm);
              setFormError("");
              setFormSuccess("");
            }}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!formChanged || savingForm}
            onClick={() => void saveForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} />{" "}
            {savingForm ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <ImagePlus className="text-color1" size={22} />
          <h2 className="text-xl font-bold">Galeri Desa</h2>
        </div>
        <p className="mt-2 text-sm text-color5/60">
          Klik gambar untuk membukanya dalam ukuran besar. Upload gambar baru
          untuk menambah atau mengganti gambar tersimpan.
        </p>
        {galleryError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {galleryError}
          </p>
        )}
        {gallerySuccess && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {gallerySuccess}
          </p>
        )}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {draftGallery.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-color4/80 p-4"
            >
              <p className="font-bold">{item.label}</p>
              <button
                type="button"
                disabled={!item.image}
                onClick={() => setPreviewImage(item.image)}
                className="mt-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-color4/65 text-sm font-semibold text-color5/50 disabled:cursor-default"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.label}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    <Camera size={19} /> Gambar
                  </span>
                )}
              </button>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-color4 px-3 py-2 text-sm font-bold text-color1 transition hover:bg-color4/45">
                <span className="flex items-center gap-2">
                  <Upload size={16} /> Upload
                </span>
                <span className="mt-1 text-[11px] font-medium text-color5/55">
                  Maks. 2 MB • JPEG/JPG/PNG
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={savingGallery}
                  onChange={(event) => uploadImage(event, item.id)}
                  className="sr-only"
                />
              </label>
              {item.image && (
                <button
                  type="button"
                  disabled={savingGallery}
                  onClick={() => void removeImage(item.id)}
                  className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Hapus Gambar
                </button>
              )}
              {!COVER_IDS.has(item.id) && (
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-sm font-semibold">
                    Deskripsi Gambar
                  </span>
                  <input
                    value={item.description}
                    maxLength={FORM_LIMITS.imageDescription}
                    onChange={(event) =>
                      updateGallery(item.id, {
                        description: event.target.value,
                      })
                    }
                    placeholder={`Deskripsi ${item.label.toLowerCase()}`}
                    className="h-10 w-full rounded-lg border border-color4 px-3 text-sm outline-none focus:border-color1"
                  />
                  <span className="mt-1 block text-xs text-color5/55">{characterHint(FORM_LIMITS.imageDescription)}</span>
                </label>
              )}
            </article>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!galleryChanged || savingGallery}
            onClick={cancelGallery}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!galleryChanged || savingGallery}
            onClick={() => void saveGallery()}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} />{" "}
            {savingGallery ? "Menyimpan..." : "Simpan Gambar"}
          </button>
        </div>
      </section>

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preview gambar"
          className="fixed inset-0 z-50 flex items-center justify-center bg-color5/75 p-5"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview gambar desa"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-color3 text-color5 shadow-lg"
              aria-label="Tutup preview"
            >
              <X size={20} />
            </button>
            <a
              href={previewImage}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-color3 px-4 py-2 text-sm font-bold text-color1"
            >
              <ExternalLink size={16} /> Buka gambar
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
