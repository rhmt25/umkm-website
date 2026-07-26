"use client";

import { FaWhatsapp as WhatsApp, FaFacebook as Facebook, FaInstagram as Instagram, FaTiktok as Tiktok } from "react-icons/fa6";
import { SiGooglemaps as GoogleMaps, SiShopee as Shopee } from "react-icons/si";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
  Phone,
  Star,
  UtensilsCrossed,
} from "lucide-react";

// Custom Tokopedia SVG Icon since it's not exported in this project's react-icons version
function Tokopedia({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 192 192" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M96 28c-9.504 0-17.78 5.307-22.008 13.127C82.736 42.123 88.89 44 96 47.332c7.11-3.332 13.264-5.209 22.008-6.205C113.781 33.31 105.506 28 96 28Zm0-12c-15.973 0-29.568 10.117-34.754 24.28C52.932 40 42.462 40 28.53 40H28a6 6 0 0 0-6 6v124a6 6 0 0 0 6 6h92c27.614 0 50-22.386 50-50V46a6 6 0 0 0-6-6h-.531c-13.931 0-24.401 0-32.715.28C125.566 26.113 111.97 16 96 16ZM34 52.001V164h86c20.987 0 38-17.013 38-38V52.001c-18.502.009-29.622.098-37.872.966-8.692.915-13.999 2.677-21.445 6.4a6 6 0 0 1-5.366 0c-7.446-3.723-12.753-5.485-21.445-6.4-8.25-.868-19.37-.957-37.872-.966ZM50 96c0-9.941 8.059-18 18-18s18 8.059 18 18-8.059 18-18 18-18-8.059-18-18Zm18-30c-16.569 0-30 13.431-30 30 0 16.569 13.431 30 30 30 1.126 0 2.238-.062 3.332-.183l20.425 20.426a6 6 0 0 0 8.486 0l20.425-20.426c1.094.121 2.206.183 3.332.183 16.569 0 30-13.431 30-30 0-16.569-13.431-30-30-30-12.764 0-23.666 7.971-28 19.207C91.666 73.971 80.764 66 68 66Zm40.082 55.433A30.1 30.1 0 0 1 96 106.793a30.101 30.101 0 0 1-12.082 14.64L96 133.515l12.082-12.082ZM124 78c-9.941 0-18 8.059-18 18s8.059 18 18 18 18-8.059 18-18-8.059-18-18-18ZM76 96a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm48 8a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" clipRule="evenodd" />
    </svg>
  );
}

const PRODUCTS_PER_PAGE = 12;

const products = [
  ["Keripik Singkong Original", "Keripik singkong renyah dengan rasa original.", "Rp 15.000"],
  ["Keripik Singkong Pedas", "Rasa pedas gurih, cocok untuk camilan.", "Rp 16.000"],
  ["Keripik Singkong Balado", "Perpaduan rasa pedas manis yang nikmat.", "Rp 16.000"],
  ["Keripik Singkong Keju", "Rasa keju yang gurih dan menggoda.", "Rp 17.000"],
  ["Keripik Singkong Barbeque", "Rasa asap manis yang kaya dan lezat.", "Rp 17.000"],
  ["Keripik Singkong Jagung Bakar", "Aroma jagung bakar yang khas.", "Rp 17.000"],
  ["Keripik Pisang Original", "Pisang pilihan yang renyah dan manis.", "Rp 15.000"],
  ["Keripik Pisang Cokelat", "Manis cokelat untuk teman bersantai.", "Rp 17.000"],
  ["Keripik Pisang Matcha", "Perpaduan pisang renyah dan matcha.", "Rp 18.000"],
  ["Keripik Talas Gurih", "Camilan talas dengan rasa gurih alami.", "Rp 16.000"],
  ["Keripik Talas Pedas", "Talas renyah untuk pencinta rasa pedas.", "Rp 17.000"],
  ["Keripik Ubi Ungu", "Renyah, manis, dan berwarna alami.", "Rp 16.000"],
  ["Paket Hemat Original", "Isi tiga keripik singkong original.", "Rp 42.000"],
  ["Paket Rasa Nusantara", "Pilihan aneka rasa favorit keluarga.", "Rp 48.000"],
] as const;

const benefits = [
  { label: "Bahan pilihan\nberkualitas" },
  { label: "Tanpa bahan\npengawet" },
  { label: "Renyah dan\ngurih" },
  { label: "Diproduksi\nsecara higienis" },
];

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-color4 text-center text-sm font-medium text-color5/45 ${className}`}>
      {label}
    </div>
  );
}

export default function UmkmDetail({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const visibleProducts = useMemo(
    () => products.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE),
    [page],
  );

  const profile = useMemo(() => {
    const db: Record<string, {
      name: string;
      owner: string;
      category: string[];
      address: string;
      phone: string;
      whatsapp: string;
      links: {
        google_maps?: string;
        instagram?: string;
        facebook?: string;
        tiktok?: string;
        shopee?: string;
        tokopedia?: string;
      };
    }> = {
      "keripik-bu-sri": {
        name: "Keripik Bu Sri",
        owner: "Sri Rahayu",
        category: ["Makanan", "Minuman", "Jajanan"],
        address: "Dusun Jetis, Desa Masaran, Kec. Muntilan, Kab. Magelang",
        phone: "0812-3456-7890",
        whatsapp: "https://wa.me/6281234567890",
        links: {
          google_maps: "https://maps.google.com",
          instagram: "https://instagram.com",
          facebook: "https://facebook.com",
          tiktok: "https://tiktok.com",
          shopee: "https://shopee.co.id",
          tokopedia: "https://tokopedia.com",
        }
      },
      "dapoer-mak-tun": {
        name: "Dapoer Mak Tun",
        owner: "Sutini",
        category: ["Makanan", "Minuman", "Jajanan", "Jasa"],
        address: "Dusun Ngaran, Desa Masaran, Kec. Muntilan, Kab. Magelang",
        phone: "0812-3456-7891",
        whatsapp: "https://wa.me/6281234567891",
        links: {
          google_maps: "https://maps.google.com",
          instagram: "https://instagram.com",
          facebook: "https://facebook.com",
          tiktok: "https://tiktok.com",
          shopee: "https://shopee.co.id",
          tokopedia: "https://tokopedia.com",
        }
      },
      "batik-masaran": {
        name: "Batik Masaran",
        owner: "Agus Setiawan",
        category: ["Kerajinan", "Makanan & Minuman", "Jajanan"],
        address: "Dusun Pucung, Desa Masaran, Kec. Muntilan, Kab. Magelang",
        phone: "0812-3456-7892",
        whatsapp: "https://wa.me/6281234567892",
        links: {
          google_maps: "https://maps.google.com",
          instagram: "https://instagram.com",
          facebook: "https://facebook.com",
          tiktok: "https://tiktok.com",
          shopee: "https://shopee.co.id",
          tokopedia: "https://tokopedia.com",
        }
      },
      "madu-masaran": {
        name: "Madu Masaran",
        owner: "Budi Santoso",
        category: ["Makanan & Minuman", "Kerajinan", "Jajanan"],
        address: "Dusun Sumber, Desa Masaran, Kec. Muntilan, Kab. Magelang",
        phone: "0812-3456-7893",
        whatsapp: "https://wa.me/6281234567893",
        links: {
          google_maps: "https://maps.google.com",
          instagram: "https://instagram.com",
          facebook: "https://facebook.com",
          tiktok: "https://tiktok.com",
          shopee: "https://shopee.co.id",
          tokopedia: "https://tokopedia.com",
        }
      }
    };

    return db[slug] || {
      name: slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
      owner: "Pemilik UMKM",
      category: ["Makanan & Minuman", "Kerajinan", "Jajanan"],
      address: "Desa Masaran, Kec. Muntilan, Kab. Magelang",
      phone: "0812-3456-7890",
      hours: "08.00 - 17.00 WIB",
      whatsapp: "https://wa.me/6281234567890",
      links: {
        google_maps: "https://maps.google.com",
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        tiktok: "https://tiktok.com",
        shopee: "https://shopee.co.id",
        tokopedia: "https://tokopedia.com",
      }
    };
  }, [slug]);

  return (
    <main className="min-h-screen bg-color3 text-color5">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profil UMKM</h1>

        <div className="mt-8 border-t border-color4/75 pt-10 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-14">
          <aside className="border-b border-color4/75 pb-9 lg:border-b-0 lg:border-r lg:pr-12 lg:pb-0">
            <Placeholder label="Logo UMKM" className="mx-auto h-40 w-40 rounded-full border-4 border-color4 shadow-sm" />
            <div className="mt-6 text-center">
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <p className="mt-1 text-lg text-color5/70">{profile.owner}</p>
              <div className="mt-5 flex flex-wrap gap-2 items-center justify-center">
                {profile.category.map((category) => (
                  <span key={category} className="mt-1 inline-flex rounded-md bg-color4 px-3 py-1.5 text-sm font-medium">{category}</span>
                ))}
              </div>
            </div>

            <div className="mt-7 space-y-4 text-color5/70">
              <p className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-color1" size={21} /><span>{profile.address}</span></p>
              <p className="flex items-center gap-3"><Phone className="shrink-0 text-color1" size={20} />{profile.phone}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {[
                { Icon: GoogleMaps, href: profile.links.google_maps, label: "Google Maps" },
                { Icon: Instagram, href: profile.links.instagram, label: "Instagram" },
                { Icon: Facebook, href: profile.links.facebook, label: "Facebook" },
                { Icon: Tiktok, href: profile.links.tiktok, label: "TikTok" },
                { Icon: Shopee, href: profile.links.shopee, label: "Shopee" },
                { Icon: Tokopedia, href: profile.links.tokopedia, label: "Tokopedia" },
              ].map(({ Icon, href, label }) => href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-color1/10 hover:bg-color1/20 transition-colors text-color1"
                >
                  <Icon size={18} />
                </a>
              ) : null)}
            </div>

            <a href={profile.whatsapp} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-color1 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-color1/90">
              <WhatsApp size={19} /> Chat WhatsApp
            </a>
          </aside>

          <section className="pt-9 lg:pt-0">
            <div className="flex items-center gap-3">
              <Images className="text-color1" size={24} />
              <h2 className="text-xl font-bold">Galeri UMKM</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[2fr_1fr]">
              <Placeholder label="Foto UMKM 1" className="h-60 rounded-2xl border border-color4/70 sm:h-80" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                {[2, 3].map((number) => (
                  <Placeholder key={number} label={`Foto UMKM ${number}`} className="h-28 rounded-xl border border-color4/70 sm:h-[154px]" />
                ))}
              </div>
            </div>

            <h2 className="mt-10 text-xl font-bold">Keunggulan Produk</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {benefits.map(({ label }) => (
                <div key={label} className="min-h-40 rounded-2xl border border-color4/75 bg-color3 px-4 py-6 text-center shadow-sm">
                  <Star className="mx-auto text-color1" size={34} strokeWidth={2} />
                  <p className="mt-4 whitespace-pre-line text-sm font-medium leading-6 text-color5/75">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12 border-t border-color4/75 pt-9">
          <div className="flex items-center gap-3"><UtensilsCrossed className="text-color1" size={25} /><h2 className="text-2xl font-bold">Produk yang Dijual</h2></div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map(([name, description, price]) => (
              <ProductCard key={name} name={name} description={description} price={price} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination produk">
              <button type="button" aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={19} /></button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={`h-10 w-10 rounded-lg font-semibold ${page === pageNumber ? "bg-color1 text-white" : "border border-color4 bg-color3 hover:bg-color2"}`}>{pageNumber}</button>)}
              <button type="button" aria-label="Halaman berikutnya" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={19} /></button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
