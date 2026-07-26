"use client";

import Link from "next/link";
import { ImagePlus, LockKeyhole, Save, Upload } from "lucide-react";
import { createUmkm } from "./actions";

const fields = [
  ["nama", "Nama UMKM", "text"], ["pemilik", "Nama Pemilik", "text"], ["rt", "RT", "text"], ["rw", "RW", "text"],
  ["dukuh", "Dukuh", "text"], ["dusun", "Dusun", "text"], ["alamat_lengkap", "Alamat Lengkap", "text"], ["no_wa", "Nomor WhatsApp", "tel"],
  ["instagram", "Instagram", "text"], ["tiktok", "TikTok", "text"], ["facebook", "Facebook", "text"],
  ["shopee", "Shopee", "url"], ["tokopedia", "Tokopedia", "url"], ["google_maps", "Google Maps", "url"], ["keunggulan1", "Keunggulan Produk 1", "text"],
  ["keunggulan2", "Keunggulan Produk 2", "text"], ["keunggulan3", "Keunggulan Produk 3", "text"], ["keunggulan4", "Keunggulan Produk 4", "text"],
] as const;

const uploads = ["Logo UMKM", "Gambar UMKM 1", "Gambar UMKM 2", "Gambar UMKM 3"];

export default function Page() {
  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div><p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p><h1 className="mt-1 text-3xl font-bold">Tambah UMKM</h1><p className="mt-2 text-color5/65">Lengkapi informasi usaha sebelum menyimpannya.</p></div>
      <form className="mt-8 space-y-7" action={createUmkm}>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Informasi UMKM</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{fields.slice(0, 14).map(([name, label, type]) => <label key={name} className={name === "alamat_lengkap" ? "md:col-span-2" : ""}><span className="mb-2 block text-sm font-semibold">{label}</span>{name === "alamat_lengkap" ? <textarea name={name} rows={3} placeholder={`Masukkan ${label.toLowerCase()}`} className="w-full rounded-xl border border-color4 bg-color3 px-4 py-3 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" /> : <input name={name} type={type} placeholder={`Masukkan ${label.toLowerCase()}`} className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" />}</label>)}</div></section>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Keunggulan Produk</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{fields.slice(14).map(([name, label]) => <label key={name}><span className="mb-2 block text-sm font-semibold">{label}</span><input name={name} placeholder={`Masukkan ${label.toLowerCase()}`} className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" /></label>)}</div></section>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7"><div className="flex items-center gap-2"><ImagePlus className="text-color1" size={22} /><h2 className="text-xl font-bold">Foto UMKM</h2></div><p className="mt-2 text-sm text-color5/60">Unggah satu logo dan maksimal tiga gambar usaha.</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{uploads.map((label) => <label key={label} className="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-color4 bg-color2/35 p-5 text-center transition hover:border-color1 hover:bg-color4/40"><Upload className="text-color1" size={25} /><span className="mt-3 text-sm font-bold">Upload {label}</span><span className="mt-1 text-xs text-color5/55">Maks. 2 MB • JPEG/JPG/PNG</span><input type="file" name={label.toLowerCase().replaceAll(" ", "_")} accept="image/png,image/jpeg" className="sr-only" /></label>)}</div></section>
        <section className="rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7"><div className="flex items-center gap-2"><LockKeyhole className="text-color1" size={21} /><h2 className="text-xl font-bold">Keamanan Akun</h2></div><label className="mt-6 block max-w-xl"><span className="mb-2 block text-sm font-semibold">Password</span><input name="password" type="password" placeholder="Masukkan password" className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15" /></label></section>
        <div className="flex flex-col-reverse gap-3 border-t border-color4 pt-7 sm:flex-row sm:justify-end"><Link href="/admin/umkm" className="rounded-xl border border-color4 bg-color3 px-6 py-3 text-center font-bold transition hover:bg-color2">Batal</Link><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-color1 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-color1/90"><Save size={18} /> Simpan UMKM</button></div>
      </form>
    </main>
  );
}
