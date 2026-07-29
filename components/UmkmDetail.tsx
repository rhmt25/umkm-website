"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FaWhatsapp as WhatsApp, FaFacebook as Facebook, FaInstagram as Instagram, FaTiktok as Tiktok } from "react-icons/fa6";
import { SiGooglemaps as GoogleMaps, SiShopee as Shopee } from "react-icons/si";
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
import ImageLightbox from "@/components/ImageLightbox";

const PRODUCTS_PER_PAGE = 12;

type GalleryImage = {
  id: string;
  label: string;
  url: string;
  alt: string;
};

interface UmkmDetailProps {
  name: string;
  owner: string;
  categories: string[];
  address: string;
  phone: string;
  whatsappUrl: string;
  links: {
    google_maps?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    shopee?: string;
    tokopedia?: string;
  };
  logoUrl?: string;
  galleryImages: GalleryImage[];
  features: string[];
  products: Array<{ id: number; name: string; description: string; price: string }>;
}

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-color4 text-center text-sm font-medium text-color5/45 ${className}`}>
      {label}
    </div>
  );
}

function Tokopedia({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 192 192" fill="none">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M96 28c-9.504 0-17.78 5.307-22.008 13.127C82.736 42.123 88.89 44 96 47.332c7.11-3.332 13.264-5.209 22.008-6.205C113.781 33.31 105.506 28 96 28Zm0-12c-15.973 0-29.568 10.117-34.754 24.28C52.932 40 42.462 40 28.53 40H28a6 6 0 0 0-6 6v124a6 6 0 0 0 6 6h92c27.614 0 50-22.386 50-50V46a6 6 0 0 0-6-6h-.531c-13.931 0-24.401 0-32.715.28C125.566 26.113 111.97 16 96 16ZM34 52.001V164h86c20.987 0 38-17.013 38-38V52.001c-18.502.009-29.622.098-37.872.966-8.692.915-13.999 2.677-21.445 6.4a6 6 0 0 1-5.366 0c-7.446-3.723-12.753-5.485-21.445-6.4-8.25-.868-19.37-.957-37.872-.966ZM50 96c0-9.941 8.059-18 18-18s18 8.059 18 18-8.059 18-18 18-18-8.059-18-18Zm18-30c-16.569 0-30 13.431-30 30 0 16.569 13.431 30 30 30 1.126 0 2.238-.062 3.332-.183l20.425 20.426a6 6 0 0 0 8.486 0l20.425-20.426c1.094.121 2.206.183 3.332.183 16.569 0 30-13.431 30-30 0-16.569-13.431-30-30-30-12.764 0-23.666 7.971-28 19.207C91.666 73.971 80.764 66 68 66Zm40.082 55.433A30.1 30.1 0 0 1 96 106.793a30.101 30.101 0 0 1-12.082 14.64L96 133.515l12.082-12.082ZM124 78c-9.941 0-18 8.059-18 18s8.059 18 18 18 18-8.059 18-18-8.059-18-18-18ZM76 96a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm48 8a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function UmkmDetail({
  name,
  owner,
  categories,
  address,
  phone,
  whatsappUrl,
  links,
  logoUrl,
  galleryImages,
  features,
  products,
}: UmkmDetailProps) {
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const visibleProducts = useMemo(
    () => products.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE),
    [page, products],
  );

  const displayGallery = galleryImages.length > 0 ? galleryImages : [
    { id: "placeholder-1", label: "Foto UMKM 1", url: "", alt: "Placeholder" },
    { id: "placeholder-2", label: "Foto UMKM 2", url: "", alt: "Placeholder" },
    { id: "placeholder-3", label: "Foto UMKM 3", url: "", alt: "Placeholder" },
  ];

  return (
    <main className="min-h-screen bg-color3 text-color5">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profil UMKM</h1>

        <div className="mt-8 border-t border-color4/75 pt-10 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-14">
          <aside className="border-b border-color4/75 pb-9 lg:border-b-0 lg:border-r lg:pr-12 lg:pb-0">
            <button type="button" disabled={!logoUrl} onClick={() => logoUrl && setSelectedImage(logoUrl)} className="relative mx-auto block h-40 w-40 overflow-hidden rounded-full border-4 border-color4 shadow-sm disabled:cursor-default">
              {logoUrl ? (
                <Image src={logoUrl} alt={`${name} logo`} fill sizes="160px" className="object-cover" unoptimized />
              ) : (
                <Placeholder label="Logo UMKM" className="h-full w-full" />
              )}
            </button>

            <div className="mt-6 text-center">
              <h2 className="text-3xl font-bold">{name}</h2>
              <p className="mt-1 text-lg text-color5/70">{owner}</p>
              <div className="mt-5 flex flex-wrap gap-2 items-center justify-center">
                {categories.map((category) => (
                  <span key={category} className="mt-1 inline-flex rounded-md bg-color4 px-3 py-1.5 text-sm font-medium">
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 space-y-4 text-color5/70">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-color1" size={21} />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="shrink-0 text-color1" size={20} />
                {phone}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {[
                { Icon: GoogleMaps, href: links.google_maps, label: "Google Maps" },
                { Icon: Instagram, href: links.instagram, label: "Instagram" },
                { Icon: Facebook, href: links.facebook, label: "Facebook" },
                { Icon: Tiktok, href: links.tiktok, label: "TikTok" },
                { Icon: Shopee, href: links.shopee, label: "Shopee" },
                { Icon: Tokopedia, href: links.tokopedia, label: "Tokopedia" },
              ].map(({ Icon, href, label }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-color1/10 hover:bg-color1/20 transition-colors text-color1"
                  >
                    {Icon ? <Icon size={18} /> : <span className="text-sm font-bold">T</span>}
                  </a>
                ) : null,
              )}
            </div>

            <a
              href={whatsappUrl || "#"}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-color1 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-color1/90"
              target={whatsappUrl ? "_blank" : undefined}
              rel={whatsappUrl ? "noopener noreferrer" : undefined}
            >
              <WhatsApp size={19} /> Chat WhatsApp
            </a>
          </aside>

          <section className="pt-9 lg:pt-0">
            <div className="flex items-center gap-3">
              <Images className="text-color1" size={24} />
              <h2 className="text-xl font-bold">Galeri UMKM</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[2fr_1fr]">
              <button
                type="button"
                onClick={() => displayGallery[0]?.url && setSelectedImage(displayGallery[0].url)}
                className="group relative overflow-hidden rounded-2xl border border-color4/70 bg-color3 shadow-sm h-60 sm:h-80"
              >
                {displayGallery[0]?.url ? (
                  <>
                    <Image
                      src={displayGallery[0].url}
                      alt={displayGallery[0].alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </>
                ) : (
                  <Placeholder label={displayGallery[0].label} className="h-full w-full" />
                )}
              </button>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                {displayGallery.slice(1, 3).map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => image.url && setSelectedImage(image.url)}
                    className="group relative overflow-hidden rounded-xl border border-color4/70 bg-color3 shadow-sm h-28 sm:h-[154px]"
                  >
                    {image.url ? (
                      <>
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </>
                    ) : (
                      <Placeholder label={image.label} className="h-full w-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="mt-10 text-xl font-bold">Keunggulan Produk</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {features.map((feature) => (
                <div key={feature} className="min-h-40 rounded-2xl border border-color4/75 bg-color3 px-4 py-6 text-center shadow-sm">
                  <Star className="mx-auto text-color1" size={34} strokeWidth={2} />
                  <p className="mt-4 text-sm font-medium leading-6 text-color5/75">{feature}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12 border-t border-color4/75 pt-9">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="text-color1" size={25} />
            <h2 className="text-2xl font-bold">Produk yang Dijual</h2>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination produk">
              <button
                type="button"
                aria-label="Halaman sebelumnya"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-color4 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={19} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-10 w-10 rounded-lg font-semibold ${page === pageNumber ? "bg-color1 text-white" : "border border-color4 bg-color3 hover:bg-color2"}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                aria-label="Halaman berikutnya"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-color4 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </section>
      </div>

      <ImageLightbox src={selectedImage} alt="Gambar UMKM" onClose={() => setSelectedImage(null)} />
    </main>
  );
}
