"use client";

import Link from "next/link";
import { Building2, ChevronLeft, Home, LayoutGrid, MapPinned, TreePine } from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Beranda", href: "/admin", icon: Home },
  { label: "UMKM", href: "/admin/umkm", icon: Building2 },
  { label: "Kategori", href: "/admin/kategori", icon: LayoutGrid },
  { label: "Desa", href: "/admin/desa", icon: MapPinned },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col bg-color1 text-color3 md:sticky md:top-0 md:h-screen md:w-72">
      <div className="flex items-center gap-3 border-b border-color3/15 px-6 py-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-color3 text-color1"><TreePine size={23} /></span>
        <span><span className="block text-lg font-bold">UMKM Masaran</span><span className="text-xs text-color3/65">Panel Administrasi</span></span>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-5 md:block md:space-y-2 md:overflow-visible">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = href !== "#" && (href === "/admin" ? pathname === href : pathname.startsWith(href));
          return (
            <Link key={label} href={href} className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-color3 text-color1 shadow-sm" : "text-color3/70 hover:bg-color3/10 hover:text-color3"}`}>
              <Icon size={19} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-color3/15 p-5 md:block">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-color3/75 hover:bg-color3/10 hover:text-color3"><ChevronLeft size={19} /> Kembali ke Website</Link>
      </div>
    </aside>
  );
}
