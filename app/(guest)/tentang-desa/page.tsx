import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  House,
  MapPin,
  Package,
  Phone,
  Rocket,
  Sprout,
  Store,
  Target,
  UsersRound,
} from "lucide-react";

function ImagePlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-color4 text-center text-sm font-semibold text-color5/45 ${className}`}>
      {label}
    </div>
  );
}

const potentials = [
  { icon: Store, title: "UMKM Berkembang", text: "Beragam pelaku UMKM yang terus tumbuh dan inovatif." },
  { icon: Sprout, title: "Pertanian", text: "Tanah subur dan hasil pertanian berkualitas tinggi." },
  { icon: Package, title: "Budaya", text: "Beragam budaya dan tradisi lokal yang kaya dan beragam." },
  { icon: UsersRound, title: "Gotong Royong", text: "Masyarakat yang guyub, solid, dan saling mendukung." },
];

const stats = [
  { icon: UsersRound, value: "120+", label: "UMKM Aktif" },
  { icon: Package, value: "530+", label: "Produk Terdaftar" },
  { icon: House, value: "8", label: "Kategori" },
  { icon: UsersRound, value: "4", label: "Dusun" },
];

const gallery = ["Kantor Desa", "Gapura Desa", "Balai Desa", "Kegiatan UMKM", "Pemandangan Desa", "Kegiatan Masyarakat"];

export default function Page() {
  return (
    <main className="bg-color3 text-color5">
      <section className="relative overflow-hidden bg-color1">
        <ImagePlaceholder label="Placeholder Foto Hero Desa Masaran" className="absolute inset-0 h-full w-full opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-color1 via-color1/85 to-color1/30" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-xl text-color3">
            <h1 className="text-5xl font-bold leading-[1.04] sm:text-6xl">Tentang<br />Desa Masaran</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-color3/90">Mengenal lebih dekat Desa Masaran, desa yang berdaya, mandiri, dan penuh potensi.</p>
            <a href="#lokasi" className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-orange-600"><MapPin size={18} fill="currentColor" /> Lihat Lokasi Desa</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <ImagePlaceholder label="Placeholder Foto Kantor Desa" className="h-72 rounded-2xl border border-color4/70 shadow-sm sm:h-96" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-color1">Profil Desa</p>
            <h2 className="mt-2 text-3xl font-bold">Tentang Desa Masaran</h2>
            <p className="mt-5 leading-7 text-color5/75">Desa Masaran merupakan salah satu desa yang berada di Kecamatan Kebonagung, Kabupaten Demak, Provinsi Jawa Tengah. Desa ini memiliki potensi besar dalam bidang ekonomi melalui berbagai pelaku UMKM yang bergerak di sektor makanan, minuman, kerajinan, perdagangan, dan jasa.</p>
            <p className="mt-4 leading-7 text-color5/75">Website ini hadir sebagai media informasi dan promosi untuk memperkenalkan UMKM Desa Masaran kepada masyarakat luas serta mendukung pertumbuhan ekonomi desa berbasis potensi lokal.</p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-center text-2xl font-bold text-color1">Potensi Desa Masaran</h2>
          <div className="mt-5 grid rounded-2xl bg-color4/45 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {potentials.map(({ icon: Icon, title, text }, index) => <article key={title} className={`px-7 text-center ${index ? "lg:border-l lg:border-color1/35" : ""}`}><Icon className="mx-auto text-color1" size={34} /><h3 className="mt-3 text-sm font-bold text-color1">{title}</h3><p className="mt-2 text-xs leading-5 text-color5/75">{text}</p></article>)}
          </div>
        </section>

        <section className="mt-5 grid overflow-hidden rounded-2xl bg-color1 text-color3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }, index) => <div key={label} className={`flex items-center justify-center gap-4 px-6 py-6 ${index ? "lg:border-l lg:border-color3/35" : ""}`}><span className="grid h-12 w-12 place-items-center rounded-full border border-color3/70"><Icon size={23} /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-color3/75">{label}</p></div></div>)}
        </section>

        <section id="lokasi" className="mt-12">
          <h2 className="text-2xl font-bold text-color1">Lokasi Desa Masaran</h2>
          <div className="mt-5 grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
            <ImagePlaceholder label="Placeholder Peta Desa Masaran" className="h-64 rounded-2xl border border-color4/70" />
            <div className="space-y-5 text-sm text-color5/80">
              <p className="flex gap-4"><MapPin className="shrink-0 text-color1" size={24} /><span><strong className="block text-color1">Alamat</strong>Desa Masaran, Kecamatan Kebonagung,<br />Kabupaten Demak, Jawa Tengah</span></p>
              <p className="flex gap-4"><Clock3 className="shrink-0 text-color1" size={24} /><span><strong className="block text-color1">Jam Pelayanan Kantor Desa</strong>Senin - Jumat<br />08.00 - 15.00 WIB</span></p>
              <p className="flex gap-4"><Phone className="shrink-0 text-color1" size={24} /><span><strong className="block text-color1">Telepon Kantor</strong>(0291) 123456</span></p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-color4/35 p-6 sm:p-8">
          <h2 className="text-center text-2xl font-bold text-color1">Galeri Desa Masaran</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.map((label) => <figure key={label}><ImagePlaceholder label="Foto" className="h-28 rounded-xl border border-color4/75" /><figcaption className="mt-2 text-center text-xs font-semibold">{label}</figcaption></figure>)}
          </div>
        </section>

        <section className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl bg-color1 px-8 py-9 text-center text-color3 sm:flex-row sm:text-left">
          <div><h2 className="text-2xl font-bold">Mari Dukung UMKM Desa Masaran</h2><p className="mt-2 text-color3/80">Temukan berbagai pelaku usaha lokal<br className="hidden sm:block" /> dan dukung produk terbaik dari Desa Masaran.</p></div>
          <Link href="/umkm" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600">Jelajahi UMKM <ArrowRight size={19} strokeWidth={3} /></Link>
        </section>
      </div>
    </main>
  );
}
