"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt = "Preview gambar", onClose }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!src) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [src, handleKeyDown]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Preview gambar"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_150ms_ease-out]"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white"
        aria-label="Tutup preview"
      >
        <X size={20} />
      </button>

      <div
        className="relative max-h-[90vh] max-w-[90vw] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}
