"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TreePine, LogIn, Menu, X } from "lucide-react";

const navLinks = [
  { label: "BERANDA", href: "/" },
  { label: "DAFTAR UMKM", href: "/umkm" },
  { label: "PRODUK", href: "/produk" },
  { label: "TENTANG DESA", href: "/tentang-desa" },
];

export default function GuestHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-color3/95 backdrop-blur border-b border-color4/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setIsOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-color1">
            <TreePine size={20} className="text-color1" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base sm:text-lg font-bold text-color5">UMKM Desa Masaran</span>
            <span className="text-[10px] sm:text-[11px] text-color5/55">Kecamatan Bawang, Banjarnegara</span>
          </span>
        </Link>

        {/* Desktop Navbar */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-color1 ${
                  active ? "text-color1" : "text-color5/75"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/masuk" className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-2.5 text-sm font-semibold text-color3 hover:opacity-90 transition-opacity">
            Masuk
            <LogIn size={16} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-color4/80 text-color5 hover:bg-color4/40 lg:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile Drawer Menu overlay */}
      <div
        className={`fixed inset-x-0 top-20 z-40 bg-color3 border-b border-color4 shadow-xl transition-all duration-300 ease-in-out lg:hidden origin-top ${
          isOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-95 invisible"
        }`}
      >
        <nav className="flex flex-col gap-1.5 px-6 py-6 border-t border-color4/40">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  active ? "bg-color1/10 text-color1" : "text-color5/75 hover:bg-color4/30"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="h-px bg-color4/55 my-3" />
          <Link
            href="/masuk"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-color1 py-3 text-sm font-bold text-color3 hover:opacity-95 transition"
          >
            <LogIn size={17} />
            Masuk Pengelola
          </Link>
        </nav>
      </div>
    </header>
  );
}
