import Link from "next/link";
import { ArrowRight, Building2, LayoutGrid, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";
  const { data: ownedUmkm } = !isAdmin && user
    ? await supabase.from("umkm").select("id").eq("user_id", user.id).single()
    : { data: null };
  const [{ count: umkmCount }, { count: categoryCount }, { count: productCount }] = await Promise.all([
    supabase.from("umkm").select("id", { count: "exact", head: true }),
    supabase.from("kategori").select("id", { count: "exact", head: true }),
    isAdmin
      ? supabase.from("produk").select("id", { count: "exact", head: true })
      : supabase
          .from("produk")
          .select("id", { count: "exact", head: true })
          .eq("id_umkm", ownedUmkm?.id ?? -1),
  ]);
  const overview = [
    ...(isAdmin ? [{ label: "Total UMKM", value: String(umkmCount ?? 0), icon: Building2 }] : []),
    { label: "Kategori", value: String(categoryCount ?? 0), icon: LayoutGrid },
    { label: "Produk Terdaftar", value: String(productCount ?? 0), icon: Package },
  ];

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <p className="text-sm font-bold uppercase tracking-wide text-color1">Panel Admin</p>
      <h1 className="mt-1 text-3xl font-bold">Selamat datang, {isAdmin ? "Admin" : "Pemilik UMKM"}</h1>
      <p className="mt-2 text-color5/65">{isAdmin ? "Kelola data UMKM Desa Masaran dari satu tempat." : "Kelola informasi dan produk usaha Anda."}</p>
      <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {overview.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-color4/80 bg-color3 p-6 shadow-sm"><Icon className="text-color1" size={25} /><p className="mt-5 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-color5/65">{label}</p></article>)}
      </div>
      <section className="mt-8 rounded-2xl bg-color1 p-7 text-color3 sm:flex sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">{isAdmin ? "Mulai kelola UMKM" : "Kelola UMKM Anda"}</h2><p className="mt-1 text-sm text-color3/75">{isAdmin ? "Tambahkan atau perbarui data usaha lokal." : "Perbarui profil, gambar, dan produk usaha Anda."}</p></div><Link href={isAdmin ? "/admin/umkm" : "/admin/umkm/me"} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-color3 px-5 py-3 font-bold text-color1 sm:mt-0">Kelola UMKM <ArrowRight size={18} /></Link></section>
    </main>
  );
}
