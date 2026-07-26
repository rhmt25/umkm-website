import { TreePine, MapPin, Phone, Mail, LogIn } from "lucide-react";
import Link from "next/link";
import { FaYoutube as Youtube, FaFacebook as Facebook, FaInstagram as Instagram } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/server";

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

export default async function GuestLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: desa } = await supabase
    .from("desa")
    .select("alamat,no_telepon,email,facebook,instagram,youtube")
    .eq("id", 1)
    .maybeSingle();

  const address = desa?.alamat ?? "Desa Masaran, Kecamatan Bawang, Kabupaten Banjarnegara, Jawa Tengah, 53471";
  const contactPhone = desa?.no_telepon ?? "082324666582";
  const contactEmail = desa?.email ?? "desa.masaran@gmail.com";
  const socialLinks = [
    { Icon: Facebook, href: desa?.facebook ?? "https://facebook.com", label: "Facebook" },
    { Icon: Instagram, href: desa?.instagram ?? "https://www.instagram.com/desamasaran/", label: "Instagram" },
    { Icon: Youtube, href: desa?.youtube ?? "https://youtube.com", label: "YouTube" },
  ];

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

          <nav className="hidden lg:flex items-center  gap-10">
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
          <Link href="/masuk" className="inline-flex items-center gap-2 rounded-lg bg-color1 px-6 py-3 text-sm font-semibold text-color3 hover:opacity-90 transition-opacity">
            Masuk
            <LogIn size={16} />
          </Link>
        </div>
      </header>

      {children}

      <footer className="bg-color1 text-color3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-4 gap-10">
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
              {socialLinks.map(({ Icon, href, label }) => (
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
                {address}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                {contactPhone}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="shrink-0" />
                {contactEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-color3/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-center">
            <p className="text-xs text-color3/60">© 2026 UNNES GIAT 16 Desa Masaran. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
