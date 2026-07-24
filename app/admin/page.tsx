import Link from "next/link";
import { ArrowRight, Building2, LayoutGrid, Package } from "lucide-react";

const overview = [
  { label: "Total UMKM", value: "120", icon: Building2 },
  { label: "Kategori", value: "8", icon: LayoutGrid },
  { label: "Produk Terdaftar", value: "530", icon: Package },
];

export default function Page() {
  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <p className="text-sm font-bold uppercase tracking-wide text-color1">Panel Admin</p>
      <h1 className="mt-1 text-3xl font-bold">Selamat datang, Admin</h1>
      <p className="mt-2 text-color5/65">Kelola data UMKM Desa Masaran dari satu tempat.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {overview.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-color4/80 bg-color3 p-6 shadow-sm"><Icon className="text-color1" size={25} /><p className="mt-5 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-color5/65">{label}</p></article>)}
      </div>
      <section className="mt-8 rounded-2xl bg-color1 p-7 text-color3 sm:flex sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Mulai kelola UMKM</h2><p className="mt-1 text-sm text-color3/75">Tambahkan atau perbarui data usaha lokal.</p></div><Link href="/admin/umkm" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-color3 px-5 py-3 font-bold text-color1 sm:mt-0">Kelola UMKM <ArrowRight size={18} /></Link></section>
    </main>
  );
}
