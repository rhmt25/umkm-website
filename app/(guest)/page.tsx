import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Store,
  Package,
  Award,
  HeartHandshake,
  Leaf,
  Briefcase,
  BadgeCheck,
  Heart,
  Users,
} from "lucide-react";
import UmkmCard from "@/components/UmkmCard";
import { createClient } from "@/lib/supabase/server";

function ImagePlaceholder({
  className = "",
  label = "Placeholder Gambar",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`flex items-center justify-center bg-color4 text-color5/40 text-xs sm:text-sm font-medium text-center px-2 ${className}`}>
      {label}
    </div>
  );
}

export default async function Page() {
  const supabase = await createClient();

  const [latestUmkmResult, productCountResult, categoryResult, umkmCountResult, desaResult] = await Promise.all([
    supabase
      .from("umkm")
      .select("id,slug,nama,pemilik,dusun")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("produk").select("id", { count: "exact", head: true }),
    supabase.from("kategori").select("id"),
    supabase.from("umkm").select("id", { count: "exact", head: true }),
    supabase.from("desa").select("sampul_beranda_path").eq("id", 1).maybeSingle(),
  ]);

  const coverPath = desaResult.data?.sampul_beranda_path;
  const coverImageUrl = coverPath
    ? supabase.storage.from("umkm-media").getPublicUrl(coverPath).data.publicUrl
    : "";

  const latestUmkms = latestUmkmResult.data ?? [];
  const umkmIds = latestUmkms.map((item) => item.id);

  const logoResult =
    umkmIds.length > 0
      ? await supabase
        .from("umkm_images")
        .select("umkm_id,storage_path")
        .in("umkm_id", umkmIds)
        .eq("slot", "logo")
      : { data: [] };

  const logoMap = new Map<number, string>();
  for (const image of logoResult.data ?? []) {
    const publicUrl = supabase.storage.from("umkm-media").getPublicUrl(image.storage_path).data.publicUrl;
    if (publicUrl) {
      logoMap.set(image.umkm_id, publicUrl);
    }
  }

  const stats = [
    { icon: Store, value: `${umkmCountResult.count ?? latestUmkms.length}`, label: "UMKM Terdaftar" },
    { icon: Package, value: `${productCountResult.count ?? 0}`, label: "Produk" },
    { icon: Award, value: `${categoryResult.data?.length ?? 0}`, label: "Kategori" },
    { icon: HeartHandshake, value: "100%", label: "Produk Lokal" },
  ];

  return (
    <main className="bg-color3 text-color5">
      <section className="relative overflow-hidden">
        {coverImageUrl ? (
          <div className="absolute inset-0">
            <Image src={coverImageUrl} alt="Pemandangan Desa Masaran" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <ImagePlaceholder label="Foto Pemandangan Desa Masaran" className="absolute inset-0 w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-color3 via-color3/85 to-color3/10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              <span className="text-color5">Katalog UMKM</span>
              <br />
              <span className="text-color1">Desa Masaran</span>
            </h1>

            <p className="mt-5 text-color5/70 max-w-md">
              Temukan berbagai produk unggulan dari UMKM Desa Masaran. Dukung produk lokal, wujudkan ekonomi desa yang mandiri.
            </p>

            <Link href="/umkm" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-color1 px-6 py-3 text-sm font-semibold text-color3 hover:opacity-90 transition-opacity">
              Jelajahi UMKM
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16">
        <div className="rounded-2xl bg-color3 shadow-lg border border-color4/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-y-0 divide-x-0 sm:divide-x-0 lg:divide-x divide-color4/60">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-5 sm:py-7">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-color4">
                <Icon size={20} className="text-color1" />
              </span>
              <div>
                <p className="text-2xl font-bold text-color5 leading-none">{value}</p>
                <p className="text-xs text-color5/55 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-color3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-color5">
                <Leaf size={22} className="text-color1" />
                UMKM Terbaru
              </h2>
              <p className="mt-1 text-sm text-color5/60">UMKM yang baru bergabung di Desa Masaran</p>
            </div>
            <Link href="/umkm" className="inline-flex items-center gap-1.5 rounded-lg border border-color1 px-5 py-2 text-sm font-semibold text-color1 hover:bg-color1 hover:text-color3 transition-colors">
              Lihat Semua UMKM
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestUmkms.map((umkm) => (
                <UmkmCard
                  key={umkm.id}
                  name={umkm.nama}
                  owner={umkm.pemilik}
                  category="UMKM"
                  location={umkm.dusun ? `Dusun ${umkm.dusun}` : "Desa Masaran"}
                  image={logoMap.get(umkm.id)}
                  href={`/umkm/${umkm.slug}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-color3 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-color1/[0.06] via-color1/[0.12] to-color1/[0.12] p-8 lg:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-color3 shadow-sm mb-4">
                <Briefcase size={20} className="text-color1" />
              </span>
              <p className="font-semibold text-sm text-color5">Mendukung Ekonomi Lokal</p>
              <p className="text-xs text-color5/55 mt-1.5 leading-relaxed">Setiap pembelian membantu pertumbuhan ekonomi masyarakat desa.</p>
            </div>
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-color3 shadow-sm mb-4">
                <BadgeCheck size={20} className="text-color1" />
              </span>
              <p className="font-semibold text-sm text-color5">Produk Berkualitas</p>
              <p className="text-xs text-color5/55 mt-1.5 leading-relaxed">UMKM Desa Masaran menyediakan produk berkualitas dan terpercaya.</p>
            </div>
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-color3 shadow-sm mb-4">
                <Heart size={20} className="text-color1" />
              </span>
              <p className="font-semibold text-sm text-color5">Dikelola dengan Hati</p>
              <p className="text-xs text-color5/55 mt-1.5 leading-relaxed">Dikerjakan oleh masyarakat lokal dengan dedikasi dan keterampilan terbaik.</p>
            </div>
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-color3 shadow-sm mb-4">
                <Users size={20} className="text-color1" />
              </span>
              <p className="font-semibold text-sm text-color5">Desa Maju, Kita Maju</p>
              <p className="text-xs text-color5/55 mt-1.5 leading-relaxed">Bersama membangun desa yang mandiri, sejahtera, dan berkelanjutan.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
