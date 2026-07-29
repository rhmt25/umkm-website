"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, Home, LayoutGrid, MapPinned, TreePine, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const adminNavigation = [
  { label: "Beranda", href: "/admin", icon: Home },
  { label: "UMKM", href: "/admin/umkm", icon: Building2 },
  { label: "Kategori", href: "/admin/kategori", icon: LayoutGrid },
  { label: "Desa", href: "/admin/desa", icon: MapPinned },
];

type AdminSidebarProps = {
  role: "admin" | "umkm";
  umkmId?: number;
};

export default function AdminSidebar({ role, umkmId }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = role === "admin"
    ? adminNavigation
    : [
        { label: "Beranda", href: "/admin", icon: Home },
        { label: "UMKM", href: "/admin/umkm/me", icon: Building2 },
      ];

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-color3/15 px-6 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-color3 text-color1"><TreePine size={23} /></span>
          <span>
            <span className="block text-lg font-bold text-color3">UMKM Masaran</span>
            <span className="text-xs text-color3/65">{role === "admin" ? "Panel Administrasi" : "Panel UMKM"}</span>
          </span>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-color3/20 text-color3 hover:bg-color3/10 md:hidden"
          aria-label="Tutup sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5 md:overflow-y-auto">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = href !== "#" && (href === "/admin" ? pathname === href : pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-color3 text-color1 shadow-sm" : "text-color3/70 hover:bg-color3/10 hover:text-color3"
              }`}
            >
              <Icon size={19} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-color3/15 p-5 shrink-0">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-color3/75 hover:bg-color3/10 hover:text-color3"
        >
          <ChevronLeft size={19} /> Kembali ke Website
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="flex h-16 w-full items-center justify-between bg-color1 px-6 text-color3 border-b border-color3/15 fixed top-0 left-0 z-40 md:hidden shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-color3 text-color1"><TreePine size={18} /></span>
          <span className="text-base font-bold">UMKM Masaran</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-color3/20 text-color3 hover:bg-color3/10"
          aria-label="Buka sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-color1 text-color3 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
