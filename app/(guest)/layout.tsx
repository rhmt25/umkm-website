import { TreePine, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { FaYoutube as Youtube, FaFacebook as Facebook, FaInstagram as Instagram } from "react-icons/fa6";

const navLinks = [
  { label: "BERANDA", href: "/" },
  { label: "DAFTAR UMKM", href: "/umkm" },
  { label: "PRODUK", href: "/produk" },
  { label: "TENTANG DESA", href: "/tentang-desa" },
];

const footerMenu = [
  { label: "Beranda", href: "/" },
  { label: "Daftar UMKM", href: "/umkm" },
  { label: "Produk", href: "/produk" },
  { label: "Tentang Desa", href: "/tentang-desa" },
];

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-color3 text-color5 min-h-screen">
      <header className="sticky top-0 z-50 bg-color3/95 backdrop-blur border-b border-color4/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-color1">
              <TreePine size={20} className="text-color1" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-color5">UMKM Desa Masaran</span>
              <span className="text-[11px] text-color5/55">Kecamatan Bawang, Kabupaten Banjarnegara</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-color5/75 transition-colors hover:text-color1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {children}

      <footer className="bg-color1 text-color3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-color3/70">
                <TreePine size={16} className="text-color3" />
              </span>
              <span className="text-lg font-bold text-color3">UMKM Desa Masaran</span>
            </div>

            <p className="mt-4 text-sm text-color3/70 max-w-xs leading-relaxed">
              Website katalog UMKM Desa Masaran. Dukung dan bangga produk lokal desa kita.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { Icon: Instagram, href: "https://www.instagram.com/desamasaran/", label: "Instagram" },
                { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-color3/10 hover:bg-color3/20 transition-colors text-color3"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-color4 uppercase mb-4">Menu</p>
            <ul className="space-y-2.5">
              {footerMenu.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-color3/70 hover:text-color3">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-color4 uppercase mb-4">Kontak</p>
            <div className="space-y-2.5 text-sm text-color3/70">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                Desa Masaran, Kecamatan Bawang, Kabupaten Banjarnegara, Jawa Tengah, 53471
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                082324666582
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="shrink-0" />
                desa.masaran@gmail.com
              </p>
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-1">
            <p className="text-xs font-semibold tracking-wide text-color4 uppercase mb-4">Temukan Kami</p>
            <div className="relative h-32 w-full max-w-xs rounded-xl overflow-hidden bg-color3/10">
              <div className="flex h-full w-full items-center justify-center bg-color3/10 text-color3/40 text-sm">
                Peta Lokasi
              </div>
              <MapPin size={22} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 fill-red-500/20" />
            </div>
          </div>
        </div>

        <div className="border-t border-color3/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-center">
            <p className="text-xs text-color3/60">© 2024 Desa Masaran. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
