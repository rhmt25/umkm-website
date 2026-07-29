import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

export interface UmkmCardProps {
  name: string;
  owner: string;
  category: string;
  location: string;
  image?: string;
  href?: string;
}

function ImagePlaceholder({
  className = "",
  label = "Placeholder Gambar",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-color4 text-color5/40 text-xs sm:text-sm font-medium text-center px-2 ${className}`}
    >
      {label}
    </div>
  );
}

export default function UmkmCard({
  name,
  owner,
  category,
  location,
  image,
  href,
}: UmkmCardProps) {
  const card = (
    <div className="rounded-2xl border border-color4/70 bg-color3 overflow-hidden hover:shadow-md transition-shadow flex flex-col items-center text-center">
      <div className="relative h-40 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <ImagePlaceholder label="UMKM Desa Masaran" className="w-full h-40" />
        )}
      </div>
      <div className="p-5 flex flex-col items-center">
        <p className="font-semibold text-color5">{name}</p>
        <p className="text-xs text-color5/50 mt-0.5">{owner}</p>

        <span className="mt-2 rounded-full bg-color4 px-3 py-1 text-[11px] font-medium text-color5/80">
          {category}
        </span>

        <div className="mt-2 flex w-full items-center justify-center text-xs text-color5/60">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" />
            {location}
          </span>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-color1 focus-visible:ring-offset-2">
      {card}
    </Link>
  ) : (
    card
  );
}
