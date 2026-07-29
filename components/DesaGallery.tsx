"use client";

import Image from "next/image";
import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

interface GalleryImage {
  id: string;
  label: string;
  url: string;
  description: string;
}

interface DesaGalleryProps {
  galleryImages: GalleryImage[];
  heroImageUrl: string;
  description: string;
}

function ImagePlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-color4 text-center text-sm font-semibold text-color5/45 ${className}`}>
      {label}
    </div>
  );
}

export default function DesaGallery({ galleryImages, heroImageUrl, description }: DesaGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      {/* Profil Desa — gambar besar clickable */}
      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {heroImageUrl ? (
          <button
            type="button"
            onClick={() => setLightboxSrc(heroImageUrl)}
            className="group relative h-72 rounded-2xl border border-color4/70 shadow-sm overflow-hidden sm:h-96 w-full cursor-zoom-in"
          >
            <Image src={heroImageUrl} alt="Kantor Desa Masaran" fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
          </button>
        ) : (
          <ImagePlaceholder label="Placeholder Foto Kantor Desa" className="h-72 rounded-2xl border border-color4/70 shadow-sm sm:h-96" />
        )}
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-color1">Profil Desa</p>
          <h2 className="mt-2 text-3xl font-bold">Tentang Desa Masaran</h2>
          <p className="mt-5 leading-7 text-color5/75 text-justify">{description}</p>
        </div>
      </section>

      {/* Galeri Desa */}
      <section className="mt-12 rounded-2xl bg-color4/35 p-6 sm:p-8">
        <h2 className="text-center text-2xl font-bold text-color1">Galeri Desa Masaran</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {galleryImages.map((image, index) => (
            <figure key={image.id} className="overflow-hidden rounded-2xl border border-color4/75">
              {image.url ? (
                <button
                  type="button"
                  onClick={() => setLightboxSrc(image.url)}
                  className="group relative h-28 w-full cursor-zoom-in overflow-hidden"
                >
                  <Image src={image.url} alt={image.label} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                </button>
              ) : (
                <ImagePlaceholder label="Foto" className="h-28 rounded-xl" />
              )}
              <figcaption className="mt-2 text-center text-xs font-semibold text-color5/80 px-2 pb-2">{image.description.trim() || `Gambar ${index + 1}`}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
