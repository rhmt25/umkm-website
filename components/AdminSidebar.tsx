"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Home,
  LayoutGrid,
  MapPinned,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { logout } from "@/app/(guest)/masuk/actions";

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

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation =
    role === "admin"
      ? adminNavigation
      : [
          { label: "Beranda", href: "/admin", icon: Home },
          { label: "UMKM", href: "/admin/umkm/me", icon: Building2 },
        ];

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-color3/15 px-6 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="Logo UMKM Masaran"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            unoptimized
          />
          <span>
            <span className="block text-lg font-bold text-color3">UMKM Masaran</span>
            <span className="text-xs text-color3/65">
              {role === "admin" ? "Panel Administrasi" : "Panel UMKM"}
            </span>
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
          const active =
            href !== "#" &&
            (href === "/admin" ? pathname === href : pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-color3 text-color1 shadow-sm"
                  : "text-color3/70 hover:bg-color3/10 hover:text-color3"
              }`}
            >
              <Icon size={19} /> {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout button replacing Kembali ke Website */}
      <div className="border-t border-color3/15 p-5 shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setShowLogoutConfirm(true);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20 hover:text-white transition"
        >
          <LogOut size={19} /> Keluar Akun
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="flex h-16 w-full items-center justify-between bg-color1 px-6 text-color3 border-b border-color3/15 fixed top-0 left-0 z-40 md:hidden shadow-sm">
        <div className="flex items-center gap-2.5">
          <Image
            src="/favicon.ico"
            alt="Logo UMKM Masaran"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            unoptimized
          />
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

      {/* Custom Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Keluar Sesi Akun?"
        message="Apakah Anda yakin ingin keluar dari panel pengelola? Anda harus masuk kembali untuk mengelola data usaha atau desa."
        confirmLabel="Keluar Akun"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={() => void handleLogout()}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
