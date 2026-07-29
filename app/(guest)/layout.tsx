import { TreePine, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { FaYoutube as Youtube, FaFacebook as Facebook, FaInstagram as Instagram, FaTiktok as Tiktok } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/server";
import GuestHeader from "@/components/GuestHeader";

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
    .select("alamat,no_telepon,email,facebook,instagram,tiktok,youtube")
    .eq("id", 1)
    .maybeSingle();

  const address = desa?.alamat?.trim();
  const contactPhone = desa?.no_telepon?.trim();
  const contactEmail = desa?.email?.trim();

  const rawSocialLinks = [
    { Icon: Facebook, href: desa?.facebook?.trim(), label: "Facebook" },
    { Icon: Instagram, href: desa?.instagram?.trim(), label: "Instagram" },
    { Icon: Tiktok, href: desa?.tiktok?.trim(), label: "TikTok" },
    { Icon: Youtube, href: desa?.youtube?.trim(), label: "YouTube" },
  ];

  const socialLinks = rawSocialLinks.filter((item): item is { Icon: any; href: string; label: string } => Boolean(item.href));
  const hasContacts = Boolean(address || contactPhone || contactEmail);

  return (
    <div className="bg-color3 text-color5 min-h-screen flex flex-col justify-between">
      <div>
        <GuestHeader />
        {children}
      </div>


      <footer className="bg-color1 text-color3 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-color3/70">
                <TreePine size={16} className="text-color3" />
              </span>
              <span className="text-lg font-bold text-color3">UMKM Desa Masaran</span>
            </div>

            <p className="mt-4 text-sm text-color3/70 max-w-xs leading-relaxed">
              Website katalog UMKM Desa Masaran. Dukung dan bangga produk lokal desa kita.
            </p>

            {socialLinks.length > 0 && (
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
            )}
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

          {hasContacts && (
            <div>
              <p className="text-xs font-semibold tracking-wide text-color4 uppercase mb-4">Kontak</p>
              <div className="space-y-2.5 text-sm text-color3/70">
                {address && (
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    {address}
                  </p>
                )}
                {contactPhone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0" />
                    {contactPhone}
                  </p>
                )}
                {contactEmail && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0" />
                    {contactEmail}
                  </p>
                )}
              </div>
            </div>
          )}
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
