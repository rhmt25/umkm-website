"use client";
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useState } from "react";
import { Camera, ExternalLink, ImagePlus, Save, Upload, X } from "lucide-react";

type VillageForm = {
  address: string;
  phone: string;
  email: string;
  description: string;
  googleMaps: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
};

type GalleryItem = {
  id: string;
  label: string;
  image: string;
  description: string;
};

const initialForm: VillageForm = {
  address: "Desa Masaran, Kecamatan Kebonagung, Kabupaten Demak, Jawa Tengah",
  phone: "(0291) 123456",
  email: "desamasaran@gmail.com",
  description:
    "Desa Masaran merupakan desa yang berdaya, mandiri, dan penuh potensi. Berbagai pelaku UMKM lokal terus tumbuh dengan dukungan masyarakat serta sumber daya desa.",
  googleMaps: "https://maps.google.com",
  facebook: "https://facebook.com/desamasaran",
  instagram: "https://instagram.com/desamasaran",
  tiktok: "https://tiktok.com/@desamasaran",
  youtube: "https://youtube.com/@desamasaran",
};

const initialGallery: GalleryItem[] = [
  { id: "balai", label: "Gambar Balai Desa", image: "", description: "" },
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `gambar-${index + 1}`,
    label: `Gambar ${index + 1}`,
    image: "",
    description: "",
  })),
];

function cloneGallery(items: GalleryItem[]) {
  return items.map((item) => ({ ...item }));
}

export default function Page() {
  const [savedForm, setSavedForm] = useState(initialForm);
  const [draftForm, setDraftForm] = useState(initialForm);
  const [savedGallery, setSavedGallery] = useState(initialGallery);
  const [draftGallery, setDraftGallery] = useState(initialGallery);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formChanged = JSON.stringify(savedForm) !== JSON.stringify(draftForm);
  const galleryChanged =
    JSON.stringify(savedGallery) !== JSON.stringify(draftGallery);

  function updateForm(key: keyof VillageForm, value: string) {
    setDraftForm((current) => ({ ...current, [key]: value }));
  }

  function updateGallery(id: string, update: Partial<GalleryItem>) {
    setDraftGallery((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item)),
    );
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>, id: string) {
    const image = event.target.files?.[0];
    if (!image) return;
    updateGallery(id, { image: URL.createObjectURL(image) });
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
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Alamat</span>
            <input
              value={draftForm.address}
              onChange={(event) => updateForm("address", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">No Telepon</span>
            <input
              value={draftForm.phone}
              onChange={(event) => updateForm("phone", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input
              type="email"
              value={draftForm.email}
              onChange={(event) => updateForm("email", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Tentang Desa Masaran
            </span>
            <textarea
              value={draftForm.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              rows={5}
              className="w-full rounded-xl border border-color4 px-4 py-3 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Link Google Maps
            </span>
            <input
              type="url"
              value={draftForm.googleMaps}
              onChange={(event) => updateForm("googleMaps", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link Facebook
            </span>
            <input
              type="url"
              value={draftForm.facebook}
              onChange={(event) => updateForm("facebook", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link Instagram
            </span>
            <input
              type="url"
              value={draftForm.instagram}
              onChange={(event) => updateForm("instagram", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link TikTok
            </span>
            <input
              type="url"
              value={draftForm.tiktok}
              onChange={(event) => updateForm("tiktok", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Link YouTube
            </span>
            <input
              type="url"
              value={draftForm.youtube}
              onChange={(event) => updateForm("youtube", event.target.value)}
              className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!formChanged}
            onClick={() => setDraftForm(savedForm)}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!formChanged}
            onClick={() => setSavedForm(draftForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} /> Simpan Perubahan
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
                <span className="flex items-center gap-2"><Upload size={16} /> Upload</span>
                <span className="mt-1 text-[11px] font-medium text-color5/55">Maks. 2 MB • JPEG/JPG/PNG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => uploadImage(event, item.id)}
                  className="sr-only"
                />
              </label>
              {item.id !== "balai" && (
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-sm font-semibold">
                    Deskripsi Gambar
                  </span>
                  <input
                    value={item.description}
                    onChange={(event) =>
                      updateGallery(item.id, {
                        description: event.target.value,
                      })
                    }
                    placeholder={`Deskripsi ${item.label.toLowerCase()}`}
                    className="h-10 w-full rounded-lg border border-color4 px-3 text-sm outline-none focus:border-color1"
                  />
                </label>
              )}
            </article>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!galleryChanged}
            onClick={() => setDraftGallery(cloneGallery(savedGallery))}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!galleryChanged}
            onClick={() => setSavedGallery(cloneGallery(draftGallery))}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} /> Simpan Gambar
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
