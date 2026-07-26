"use client";

import {
  ArrowRight,
  Store,
  Package,
  Award,
  HeartHandshake,
  Leaf,
  ChevronRight,
  Briefcase,
  BadgeCheck,
  Heart,
  Users,
} from "lucide-react";
import UmkmCard from "@/components/UmkmCard";

const stats = [
  { icon: Store, value: "120+", label: "UMKM Terdaftar" },
  { icon: Package, value: "530+", label: "Produk" },
  { icon: Award, value: "15+", label: "Kategori" },
  { icon: HeartHandshake, value: "100%", label: "Produk Lokal" },
];

const umkmList = [
  {
    name: "Keripik Bu Sri",
    owner: "Sri Rahayu",
    category: "Makanan & Minuman",
    location: "Dusun Jetis, Masaran",
  },
  {
    name: "Dapoer Mak Tun",
    owner: "Sutini",
    category: "Makanan & Minuman",
    location: "Dusun Ngaran, Masaran",
  },
  {
    name: "Batik Masaran",
    owner: "Agus Setiawan",
    category: "Kerajinan",
    location: "Dusun Pucung, Masaran",
  },
  {
    name: "Madu Masaran",
    owner: "Budi Santoso",
    category: "Makanan & Minuman",
    location: "Dusun Sumber, Masaran",
  },
];

const highlights = [
  {
    icon: Briefcase,
    title: "Mendukung Ekonomi Lokal",
    desc: "Setiap pembelian membantu pertumbuhan ekonomi masyarakat desa.",
  },
  {
    icon: BadgeCheck,
    title: "Produk Berkualitas",
    desc: "UMKM Desa Masaran menyediakan produk berkualitas dan terpercaya.",
  },
  {
    icon: Heart,
    title: "Dikelola dengan Hati",
    desc: "Dikerjakan oleh masyarakat lokal dengan dedikasi dan keterampilan terbaik.",
  },
  {
    icon: Users,
    title: "Desa Maju, Kita Maju",
    desc: "Bersama membangun desa yang mandiri, sejahtera, dan berkelanjutan.",
  },
];

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

export default function Page() {
  return (
    <main className="bg-color3 text-color5">
      <section className="relative overflow-hidden">
        <ImagePlaceholder label="Foto Pemandangan Desa Masaran" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-color3 via-color3/85 to-color3/10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              <span className="text-color5">Katalog UMKM</span>
              <br />
              <span className="text-color1">Desa Masaran</span>
            </h1>

            <p className="mt-5 text-color5/70 max-w-md">
              Temukan berbagai produk unggulan dari UMKM Desa Masaran. Dukung produk lokal, wujudkan ekonomi desa yang mandiri.
            </p>

            <a href="#" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-color1 px-6 py-3 text-sm font-semibold text-color3 hover:opacity-90 transition-opacity">
              Jelajahi UMKM
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16">
        <div className="rounded-2xl bg-color3 shadow-lg border border-color4/50 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-color4/60">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-6 sm:py-8">
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
            <a href="#" className="inline-flex items-center gap-1.5 rounded-lg border border-color1 px-5 py-2 text-sm font-semibold text-color1 hover:bg-color1 hover:text-color3 transition-colors">
              Lihat Semua UMKM
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {umkmList.map((u) => (
                <UmkmCard key={u.name} name={u.name} owner={u.owner} category={u.category} location={u.location} />
              ))}
            </div>

          </div>
        </div>
      </section>

      <section className="bg-color3 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-color1/[0.06] via-color1/[0.12] to-color1/[0.12] p-8 lg:p-10 grid lg:grid-cols-[320px_1fr] gap-10 items-center">
            <ImagePlaceholder label="Ilustrasi Lapak Pasar" className="aspect-[4/3] w-full rounded-2xl" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map(({ icon: Icon, title, desc }) => (
                <div key={title}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-color3 shadow-sm mb-4">
                    <Icon size={20} className="text-color1" />
                  </span>
                  <p className="font-semibold text-sm text-color5">{title}</p>
                  <p className="text-xs text-color5/55 mt-1.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
