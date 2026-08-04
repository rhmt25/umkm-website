import Image from "next/image";
import Link from "next/link";
import { MapPin, Trash2 } from "lucide-react";

export interface UmkmCardProps {
  name: string;
  owner: string;
  category: string;
  location: string;
  image?: string;
  href?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  isDeleting?: boolean;
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
  onDelete,
  deleteLabel = "Hapus",
  isDeleting = false,
}: UmkmCardProps) {
  const cardBody = (
    <div className="group rounded-2xl border border-color4/70 bg-color3 overflow-hidden hover:shadow-md transition-all flex flex-col h-full text-center">
      <div className="relative h-40 w-full overflow-hidden shrink-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <ImagePlaceholder label="UMKM Desa Masaran" className="w-full h-40" />
        )}
      </div>

      <div className="p-5 flex flex-col items-center flex-1 justify-between">
        <div className="flex flex-col items-center w-full">
          <p className="font-semibold text-color5 line-clamp-1 group-hover:text-color1 transition-colors">
            {name}
          </p>
          <p className="text-xs text-color5/50 mt-0.5 line-clamp-1">{owner}</p>

          <span className="mt-2 rounded-full bg-color4 px-3 py-1 text-[11px] font-medium text-color5/80 max-w-full truncate">
            {category}
          </span>
        </div>

        <div className="mt-3 flex w-full items-center justify-center text-xs text-color5/60 pt-2 border-t border-color4/40">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0 text-color1" />
            {location}
          </span>
        </div>

        {onDelete && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Hapus ${name}`}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 text-xs font-bold transition disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? "Menghapus..." : deleteLabel}</span>
          </button>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-color1 focus-visible:ring-offset-2"
    >
      {cardBody}
    </Link>
  ) : (
    cardBody
  );
}

