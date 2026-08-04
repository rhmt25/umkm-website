"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Upload } from "lucide-react";
import { createUmkm, type CreateUmkmState } from "./actions";
import { FORM_LIMITS, characterHint } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";
import PasswordInput from "@/components/PasswordInput";

const REQUIRED_FIELDS = [
  "nama",
  "pemilik",
  "rt",
  "rw",
  "dukuh",
  "dusun",
  "alamat_lengkap",
  "no_wa",
];

const fields = [
  ["nama", "Nama UMKM", "text", FORM_LIMITS.umkmName, undefined, true],
  ["pemilik", "Nama Pemilik", "text", FORM_LIMITS.personName, undefined, true],
  ["rt", "RT", "text", FORM_LIMITS.rtRw, "Hanya angka", true],
  ["rw", "RW", "text", FORM_LIMITS.rtRw, "Hanya angka", true],
  ["dukuh", "Dukuh", "text", FORM_LIMITS.villageName, undefined, true],
  ["dusun", "Dusun", "text", FORM_LIMITS.villageName, undefined, true],
  ["alamat_lengkap", "Alamat Lengkap", "text", FORM_LIMITS.address, undefined, true],
  ["no_wa", "Nomor WhatsApp", "tel", FORM_LIMITS.phone, "Hanya angka, +, spasi, atau tanda -", true],
  ["instagram", "Instagram", "text", FORM_LIMITS.socialHandle, undefined, false],
  ["tiktok", "TikTok", "text", FORM_LIMITS.socialHandle, undefined, false],
  ["facebook", "Facebook", "text", FORM_LIMITS.socialHandle, undefined, false],
  ["shopee", "Shopee", "url", FORM_LIMITS.url, "URL", false],
  ["tokopedia", "Tokopedia", "url", FORM_LIMITS.url, "URL", false],
  ["google_maps", "Google Maps", "url", FORM_LIMITS.url, "URL", false],
  ["keunggulan1", "Keunggulan Produk 1", "text", FORM_LIMITS.advantage, undefined, false],
  ["keunggulan2", "Keunggulan Produk 2", "text", FORM_LIMITS.advantage, undefined, false],
  ["keunggulan3", "Keunggulan Produk 3", "text", FORM_LIMITS.advantage, undefined, false],
  ["keunggulan4", "Keunggulan Produk 4", "text", FORM_LIMITS.advantage, undefined, false],
] as const;

const uploads = ["Logo UMKM", "Gambar UMKM 1", "Gambar UMKM 2", "Gambar UMKM 3"];

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Reset invalid state when user types in the field
  function updateField(name: string, value: string) {
    if (name === "rt" || name === "rw") value = value.replace(/\D/g, "");
    if (name === "no_wa") value = value.replace(/[^\d+\s()-]/g, "");
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) {
      setInvalidFields((prev) => ({ ...prev, [name]: false }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Client-side validation for required fields
    const missing: Record<string, boolean> = {};
    for (const key of REQUIRED_FIELDS) {
      if (!(formValues[key] ?? "").trim()) missing[key] = true;
    }
    if (!password || password.length < 6) missing["password"] = true;

    if (Object.keys(missing).length > 0) {
      setInvalidFields(missing);
      showToast(
        "Penyebab: Kolom wajib (* Nama UMKM, Pemilik, RT, RW, Dukuh, Dusun, Alamat Lengkap, No. WA, Password) belum terisi lengkap.\nSolusi: Lengkapi seluruh kolom bertanda bintang merah sebelum menyimpan.",
        "error",
        "Gagal Menyimpan UMKM"
      );
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData(event.currentTarget);
      const result = await createUmkm({} as CreateUmkmState, fd);

      setSaving(false);

      if (result.error) {
        showToast(result.error, "error");
        return;
      }

      if (result.umkmId) {
        showToast("UMKM berhasil ditambahkan! Mengarahkan ke halaman kelola...", "success", "Berhasil Menyimpan UMKM");
        router.push(`/admin/umkm/${result.umkmId}`);
      }
    } catch (err) {
      setSaving(false);
      showToast(
        "Penyebab: Terjadi gangguan jaringan atau sistem saat menghubungi server.\nSolusi: Periksa koneksi internet dan coba lagi.",
        "error",
        "Gagal Menyimpan UMKM"
      );
      console.error("createUmkm error:", err);
    }
  }

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p>
        <h1 className="mt-1 text-3xl font-bold">Tambah UMKM</h1>
        <p className="mt-2 text-color5/65">
          Lengkapi informasi usaha sebelum menyimpannya.
          Kolom bertanda (<span className="text-red-500 font-bold">*</span>) wajib diisi.
        </p>
      </div>

      <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
        {/* Informasi UMKM */}
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Informasi UMKM</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fields.slice(0, 14).map(([name, label, type, maxLength, format, isRequired]) => {
              const isError = Boolean(invalidFields[name]);

              return (
                <label key={name} className={`block ${name === "alamat_lengkap" ? "md:col-span-2" : ""}`}>
                  <span className="mb-2 block text-sm font-semibold text-color5">
                    {label} {isRequired && <span className="text-red-500">*</span>}
                  </span>
                  {name === "alamat_lengkap" ? (
                    <textarea
                      name={name}
                      value={formValues[name] ?? ""}
                      onChange={(e) => updateField(name, e.target.value)}
                      rows={3}
                      maxLength={maxLength}
                      placeholder={`Masukkan ${label.toLowerCase()}`}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                        isError
                          ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-500/15"
                          : "border-color4 bg-color3 focus:border-color1 focus:ring-2 focus:ring-color1/15"
                      }`}
                    />
                  ) : (
                    <input
                      name={name}
                      value={formValues[name] ?? ""}
                      onChange={(e) => updateField(name, e.target.value)}
                      type={type}
                      maxLength={maxLength}
                      inputMode={name === "rt" || name === "rw" || name === "no_wa" ? "numeric" : undefined}
                      placeholder={`Masukkan ${label.toLowerCase()}`}
                      className={`h-12 w-full rounded-xl border px-4 outline-none transition ${
                        isError
                          ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-500/15"
                          : "border-color4 bg-color3 focus:border-color1 focus:ring-2 focus:ring-color1/15"
                      }`}
                    />
                  )}
                  {isError ? (
                    <span className="mt-1 block text-xs font-semibold text-red-600">
                      {label} wajib diisi.
                    </span>
                  ) : (
                    <span className="mt-2 block text-xs text-color5/55">
                      {characterHint(maxLength, format)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </section>

        {/* Keunggulan Produk */}
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Keunggulan Produk</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fields.slice(14).map(([name, label, , maxLength]) => (
              <label key={name} className="block">
                <span className="mb-2 block text-sm font-semibold text-color5">{label}</span>
                <input
                  name={name}
                  value={formValues[name] ?? ""}
                  onChange={(e) => updateField(name, e.target.value)}
                  maxLength={maxLength}
                  placeholder={`Masukkan ${label.toLowerCase()}`}
                  className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15"
                />
                <span className="mt-2 block text-xs text-color5/55">{characterHint(maxLength)}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Foto UMKM */}
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2">
            <ImagePlus className="text-color1" size={22} />
            <h2 className="text-xl font-bold">Foto UMKM</h2>
          </div>
          <p className="mt-2 text-sm text-color5/60">Unggah satu logo dan maksimal tiga gambar usaha.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {uploads.map((label) => (
              <label
                key={label}
                className="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-color4 bg-color2/35 p-5 text-center transition hover:border-color1 hover:bg-color4/40"
              >
                <Upload className="text-color1" size={25} />
                <span className="mt-3 text-sm font-bold">Upload {label}</span>
                <span className="mt-1 text-xs text-color5/55">Maks. 2 MB • JPEG/JPG/PNG</span>
                <input
                  type="file"
                  name={label.toLowerCase().replaceAll(" ", "_")}
                  accept="image/png,image/jpeg"
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Keamanan Akun */}
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Keamanan Akun</h2>
          <div className="mt-6 max-w-xl">
            <PasswordInput
              label="Password"
              isRequired
              name="password"
              value={password}
              maxLength={FORM_LIMITS.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length >= 6) {
                  setInvalidFields((prev) => ({ ...prev, password: false }));
                }
              }}
              placeholder="Minimal 6 karakter"
              error={Boolean(invalidFields["password"])}
              errorMessage="Password wajib diisi (minimal 6 karakter)."
              hint={`Minimal 6 karakter • Maksimal ${FORM_LIMITS.password} karakter.`}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-color4 pt-7 sm:flex-row sm:justify-end">
          <Link
            href="/admin/umkm"
            className="rounded-xl border border-color4 bg-color3 px-6 py-3 text-center font-bold transition hover:bg-color2"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-color1 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} /> {saving ? "Menyimpan..." : "Simpan UMKM"}
          </button>
        </div>
      </form>
    </main>
  );
}
