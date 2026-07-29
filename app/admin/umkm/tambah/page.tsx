"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LockKeyhole, Save, Upload } from "lucide-react";
import { createUmkm, type CreateUmkmState } from "./actions";
import { FORM_LIMITS, characterHint } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";

const fields = [
  ["nama", "Nama UMKM", "text", FORM_LIMITS.umkmName],
  ["pemilik", "Nama Pemilik", "text", FORM_LIMITS.personName],
  ["rt", "RT", "text", FORM_LIMITS.rtRw, "Hanya angka"],
  ["rw", "RW", "text", FORM_LIMITS.rtRw, "Hanya angka"],
  ["dukuh", "Dukuh", "text", FORM_LIMITS.villageName],
  ["dusun", "Dusun", "text", FORM_LIMITS.villageName],
  ["alamat_lengkap", "Alamat Lengkap", "text", FORM_LIMITS.address],
  ["no_wa", "Nomor WhatsApp", "tel", FORM_LIMITS.phone, "Hanya angka, +, spasi, atau tanda -"],
  ["instagram", "Instagram", "text", FORM_LIMITS.socialHandle],
  ["tiktok", "TikTok", "text", FORM_LIMITS.socialHandle],
  ["facebook", "Facebook", "text", FORM_LIMITS.socialHandle],
  ["shopee", "Shopee", "url", FORM_LIMITS.url, "URL"],
  ["tokopedia", "Tokopedia", "url", FORM_LIMITS.url, "URL"],
  ["google_maps", "Google Maps", "url", FORM_LIMITS.url, "URL"],
  ["keunggulan1", "Keunggulan Produk 1", "text", FORM_LIMITS.advantage],
  ["keunggulan2", "Keunggulan Produk 2", "text", FORM_LIMITS.advantage],
  ["keunggulan3", "Keunggulan Produk 3", "text", FORM_LIMITS.advantage],
  ["keunggulan4", "Keunggulan Produk 4", "text", FORM_LIMITS.advantage],
] as const;

const uploads = ["Logo UMKM", "Gambar UMKM 1", "Gambar UMKM 2", "Gambar UMKM 3"];

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(createUmkm, {} as CreateUmkmState);

  useEffect(() => {
    if (state.error) showToast(state.error, "error");
    if (state.umkmId) {
      showToast("UMKM berhasil ditambahkan.", "success");
      router.push(`/admin/umkm/${state.umkmId}`);
    }
  }, [router, showToast, state.error, state.umkmId]);

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p>
        <h1 className="mt-1 text-3xl font-bold">Tambah UMKM</h1>
        <p className="mt-2 text-color5/65">Lengkapi informasi usaha sebelum menyimpannya.</p>
      </div>
      <form className="mt-8 space-y-7" action={formAction}>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Informasi UMKM</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fields.slice(0, 14).map(([name, label, type, maxLength, format]) => (
              <label key={name} className={name === "alamat_lengkap" ? "md:col-span-2" : ""}>
                <span className="mb-2 block text-sm font-semibold">{label}</span>
                <span className="mb-2 block text-xs text-color5/55">{characterHint(maxLength, format)}</span>
                {name === "alamat_lengkap" ? (
                  <textarea name={name} rows={3} maxLength={maxLength} placeholder={`Masukkan ${label.toLowerCase()}`} className="w-full rounded-xl border border-color4 bg-color3 px-4 py-3 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" />
                ) : (
                  <input name={name} type={type} maxLength={maxLength} inputMode={name === "rt" || name === "rw" || name === "no_wa" ? "numeric" : undefined} pattern={name === "rt" || name === "rw" ? "[0-9]*" : undefined} onInput={name === "rt" || name === "rw" ? (event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, ""); } : name === "no_wa" ? (event) => { event.currentTarget.value = event.currentTarget.value.replace(/[^\d+\s()-]/g, ""); } : undefined} placeholder={`Masukkan ${label.toLowerCase()}`} className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" />
                )}
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Keunggulan Produk</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fields.slice(14).map(([name, label, , maxLength]) => (
              <label key={name}>
                <span className="mb-2 block text-sm font-semibold">{label}</span>
                <span className="mb-2 block text-xs text-color5/55">{characterHint(maxLength)}</span>
                <input name={name} maxLength={maxLength} placeholder={`Masukkan ${label.toLowerCase()}`} className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" />
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2"><ImagePlus className="text-color1" size={22} /><h2 className="text-xl font-bold">Foto UMKM</h2></div>
          <p className="mt-2 text-sm text-color5/60">Unggah satu logo dan maksimal tiga gambar usaha.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {uploads.map((label) => <label key={label} className="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-color4 bg-color2/35 p-5 text-center transition hover:border-color1 hover:bg-color4/40"><Upload className="text-color1" size={25} /><span className="mt-3 text-sm font-bold">Upload {label}</span><span className="mt-1 text-xs text-color5/55">Maks. 2 MB • JPEG/JPG/PNG</span><input type="file" name={label.toLowerCase().replaceAll(" ", "_")} accept="image/png,image/jpeg" className="sr-only" /></label>)}
          </div>
        </section>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2"><LockKeyhole className="text-color1" size={21} /><h2 className="text-xl font-bold">Keamanan Akun</h2></div>
          <label className="mt-6 block max-w-xl"><span className="mb-2 block text-sm font-semibold">Password</span><span className="mb-2 block text-xs text-color5/55">Minimal 6 karakter • Maksimal {FORM_LIMITS.password} karakter</span><input name="password" type="password" minLength={6} maxLength={FORM_LIMITS.password} required placeholder="Masukkan password" className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" /></label>
        </section>
        <div className="flex flex-col-reverse gap-3 border-t border-color4 pt-7 sm:flex-row sm:justify-end"><Link href="/admin/umkm" className="rounded-xl border border-color4 bg-color3 px-6 py-3 text-center font-bold transition hover:bg-color2">Batal</Link><button type="submit" disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-color1 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-60"><Save size={18} /> {isPending ? "Menyimpan..." : "Simpan UMKM"}</button></div>
      </form>
    </main>
  );
}
