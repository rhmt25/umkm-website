import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  House,
  MapPin,
  Package,
  Phone,
  Mail,
  Sprout,
  Store,
  UsersRound,
  Tag,
} from "lucide-react";
import CultureIcon from "@/components/CultureIcon";
import DesaGallery from "@/components/DesaGallery";
import { createClient } from "@/lib/supabase/server";

function ImagePlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-color4 text-center text-sm font-semibold text-color5/45 ${className}`}>
      {label}
    </div>
  );
}

const potentials = [
  { icon: Store, title: "UMKM Berkembang", text: "Beragam pelaku UMKM yang terus tumbuh dan inovatif." },
  { icon: Sprout, title: "Pertanian", text: "Tanah subur dan hasil pertanian berkualitas tinggi." },
  { icon: CultureIcon, title: "Budaya", text: "Beragam budaya dan tradisi lokal yang kaya dan beragam." },
  { icon: UsersRound, title: "Gotong Royong", text: "Masyarakat yang guyub, solid, dan saling mendukung." },
];

type DesaData = {
  alamat?: string | null;
  no_telepon?: string | null;
  email?: string | null;
  tentang?: string | null;
  google_maps?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  balai_desa_path?: string | null;
  sampul_tentang_path?: string | null;
};

type DesaImage = {
  urutan: number;
  storage_path: string;
  deskripsi?: string | null;
};

const defaultGalleryLabels = [
  "Kantor Desa",
  "Gapura Desa",
  "Balai Desa",
  "Kegiatan UMKM",
  "Pemandangan Desa",
  "Kegiatan Masyarakat",
];

export default async function Page() {
  const supabase = await createClient();

  const [desaResult, galleryResult] = await Promise.all([
    supabase
      .from("desa")
      .select("alamat,no_telepon,email,tentang,google_maps,facebook,instagram,tiktok,youtube,balai_desa_path,sampul_tentang_path")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("desa_images")
      .select("urutan,storage_path,deskripsi")
      .eq("desa_id", 1)
      .order("urutan", { ascending: true }),
  ]);

  const desa = desaResult.data as DesaData | null;
  const heroImageUrl = desa?.sampul_tentang_path
    ? supabase.storage.from("umkm-media").getPublicUrl(desa.sampul_tentang_path).data.publicUrl
    : "";

  const galleryImages = defaultGalleryLabels.map((label, index) => {
    const item = (galleryResult.data ?? []).find(
      (entry: DesaImage) => entry.urutan === index + 1,
    );
    const url = item?.storage_path
      ? supabase.storage.from("umkm-media").getPublicUrl(item.storage_path).data.publicUrl
      : "";

    return {
      id: `gambar-${index + 1}`,
      label,
      url,
      description: item?.deskripsi ?? "",
    };
  });

  const address = desa?.alamat ?? "Desa Masaran, Kecamatan Bawang, Kabupaten Banjarnegara, Jawa Tengah";
  const phone = desa?.no_telepon ?? "0823-2466-6582";
  const email = desa?.email ?? "desa.masaran@gmail.com";
  const description = desa?.tentang ?? "Desa Masaran merupakan salah satu desa yang berdaya, mandiri, dan penuh potensi. Website ini hadir sebagai media informasi dan promosi untuk memperkenalkan UMKM Desa Masaran kepada masyarakat luas serta mendukung pertumbuhan ekonomi desa berbasis potensi lokal.";
  const mapsUrl = desa?.google_maps ?? "";

  const contactItems = [
    { icon: MapPin, label: address },
    { icon: Phone, label: phone },
    { icon: Mail, label: email },
  ];

  return (
    <main className="bg-color3 text-color5">
      <section className="relative overflow-hidden bg-color1">
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <Image src={heroImageUrl} alt="Pemandangan Desa Masaran" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/25" />
          </div>
        ) : (
          <ImagePlaceholder label="Placeholder Foto Hero Desa Masaran" className="absolute inset-0 h-full w-full opacity-35" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-color1 via-color1/85 to-color1/30" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-xl text-color3">
            <h1 className="text-5xl font-bold leading-[1.04] sm:text-6xl">Tentang Desa Masaran</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-color3/90">Mengenal lebih dekat Desa Masaran, desa yang berdaya, mandiri, dan penuh potensi.</p>
            <a href="#lokasi" className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-orange-600"><MapPin size={18} fill="currentColor" /> Lihat Lokasi Desa</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <DesaGallery galleryImages={galleryImages} heroImageUrl={heroImageUrl} description={description} />

        <section className="mt-12">
          <h2 className="text-center text-2xl font-bold text-color1">Potensi Desa Masaran</h2>
          <div className="mt-5 grid rounded-2xl bg-color4/45 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {potentials.map(({ icon: Icon, title, text }, index) => <article key={title} className={`px-7 text-center ${index ? "lg:border-l lg:border-color1/35" : ""}`}><Icon className="mx-auto text-color1" size={34} /><h3 className="mt-3 text-sm font-bold text-color1">{title}</h3><p className="mt-2 text-xs leading-5 text-color5/75">{text}</p></article>)}
          </div>
        </section>


        <section id="lokasi" className="mt-12">
          <h2 className="text-center text-2xl font-bold text-color1">Lokasi Desa Masaran</h2>
          <div className="mt-5 grid items-center">
            <div className="overflow-hidden rounded-2xl border border-color4/70 shadow-sm">
              <iframe
                src={mapsUrl || "https://maps.google.com/maps?q=Desa+Masaran+Kecamatan+Bawang+Kabupaten+Banjarnegara+Jawa+Tengah&output=embed"}
                title="Peta Desa Masaran"
                className="h-80 w-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-3 flex justify-center">
              <a
                href={`https://www.google.com/maps/search/Desa+Masaran+Kecamatan+Bawang+Kabupaten+Banjarnegara+Jawa+Tengah`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-color1 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <MapPin size={16} />
                Buka di Google Maps
              </a>
            </div>
          </div>
        </section>


        <section className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl bg-color1 px-8 py-9 text-center text-color3 sm:flex-row sm:text-left">
          <div><h2 className="text-2xl font-bold">Mari Dukung UMKM Desa Masaran</h2><p className="mt-2 text-color3/80">Temukan berbagai pelaku usaha lokal<br className="hidden sm:block" /> dan dukung produk terbaik dari Desa Masaran.</p></div>
          <Link href="/umkm" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600">Jelajahi UMKM <ArrowRight size={19} strokeWidth={3} /></Link>
        </section>
      </div>
    </main>
  );
}
