"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  umkmName: string;
  umkmSlug: string;
  category: string;
  dusun: string;
  price: string;
}

const productData: Product[] = [
  // Keripik Bu Sri (Makanan & Minuman - Jetis)
  { id: 1, name: "Keripik Singkong Original", description: "Keripik singkong renyah dengan rasa original.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 2, name: "Keripik Singkong Pedas", description: "Rasa pedas gurih, cocok untuk camilan.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 3, name: "Keripik Singkong Balado", description: "Perpaduan rasa pedas manis yang nikmat.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 4, name: "Keripik Singkong Keju", description: "Rasa keju yang gurih dan menggoda.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 5, name: "Keripik Singkong Barbeque", description: "Rasa asap manis yang kaya dan lezat.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 6, name: "Keripik Singkong Jagung Bakar", description: "Aroma jagung bakar yang khas.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 7, name: "Keripik Pisang Original", description: "Pisang pilihan yang renyah dan manis.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 8, name: "Keripik Pisang Cokelat", description: "Manis cokelat untuk teman bersantai.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 9, name: "Keripik Pisang Matcha", description: "Perpaduan pisang renyah dan matcha.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 10, name: "Keripik Talas Gurih", description: "Camilan talas dengan rasa gurih alami.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 11, name: "Keripik Talas Pedas", description: "Talas renyah untuk pencinta rasa pedas.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },
  { id: 12, name: "Keripik Ubi Ungu", description: "Renyah, manis, dan berwarna alami.", umkmName: "Keripik Bu Sri", umkmSlug: "keripik-bu-sri", category: "Makanan & Minuman", dusun: "Jetis", price: "Rp 10.000" },

  // Dapoer Mak Tun (Makanan & Minuman - Ngaran)
  { id: 13, name: "Nasi Bakar Ayam Suwir", description: "Nasi bakar wangi dengan isian ayam suwir kemangi yang gurih pedas.", umkmName: "Dapoer Mak Tun", umkmSlug: "dapoer-mak-tun", category: "Makanan & Minuman", dusun: "Ngaran", price: "Rp 10.000" },
  { id: 14, name: "Nasi Bakar Cumi Asin", description: "Nasi bakar dengan gurihnya cumi asin dan aroma daun pisang dibakar.", umkmName: "Dapoer Mak Tun", umkmSlug: "dapoer-mak-tun", category: "Makanan & Minuman", dusun: "Ngaran", price: "Rp 10.000" },
  { id: 15, name: "Rica-Rica Entok Masaran", description: "Olahan daging entok bumbu rica pedas khas pedesaan.", umkmName: "Dapoer Mak Tun", umkmSlug: "dapoer-mak-tun", category: "Makanan & Minuman", dusun: "Ngaran", price: "Rp 10.000" },
  { id: 16, name: "Tumpeng Mini Tradisional", description: "Nasi kuning lengkap lauk pauk porsi personal untuk berbagai acara.", umkmName: "Dapoer Mak Tun", umkmSlug: "dapoer-mak-tun", category: "Makanan & Minuman", dusun: "Ngaran", price: "Rp 10.000" },

  // Batik Masaran (Kerajinan - Pucung)
  { id: 17, name: "Kain Batik Tulis Motif Masaran", description: "Batik tulis buatan tangan dengan motif khas keindahan alam Desa Masaran.", umkmName: "Batik Masaran", umkmSlug: "batik-masaran", category: "Kerajinan", dusun: "Pucung", price: "Rp 10.000" },
  { id: 18, name: "Kemeja Batik Pria Lengan Panjang", description: "Kemeja batik katun premium halus, nyaman dipakai untuk acara formal.", umkmName: "Batik Masaran", umkmSlug: "batik-masaran", category: "Kerajinan", dusun: "Pucung", price: "Rp 10.000" },
  { id: 19, name: "Syal Sutra Batik Cap", description: "Syal dari bahan sutra lembut bermotif batik cap kombinasi warna alam.", umkmName: "Batik Masaran", umkmSlug: "batik-masaran", category: "Kerajinan", dusun: "Pucung", price: "Rp 10.000" },
  { id: 20, name: "Tas Totebag Kombinasi Batik", description: "Tas tote modis dengan kombinasi kain kanvas and aksen batik tulis.", umkmName: "Batik Masaran", umkmSlug: "batik-masaran", category: "Kerajinan", dusun: "Pucung", price: "Rp 10.000" },

  // Madu Masaran (Makanan & Minuman - Sumber)
  { id: 21, name: "Madu Murni Randu 250ml", description: "Madu nektar bunga randu asli tanpa campuran, kaya akan antioksidan.", umkmName: "Madu Masaran", umkmSlug: "madu-masaran", category: "Makanan & Minuman", dusun: "Sumber", price: "Rp 10.000" },
  { id: 22, name: "Madu Hutan Multiflora 500ml", description: "Madu hasil lebah liar hutan Masaran dengan aroma khas bunga liar.", umkmName: "Madu Masaran", umkmSlug: "madu-masaran", category: "Makanan & Minuman", dusun: "Sumber", price: "Rp 10.000" },
  { id: 23, name: "Madu Klanceng Trigona 150ml", description: "Madu klanceng dengan rasa asam manis yang khasiatnya sangat tinggi.", umkmName: "Madu Masaran", umkmSlug: "madu-masaran", category: "Makanan & Minuman", dusun: "Sumber", price: "Rp 10.000" },
];

const PER_PAGE = 12;

export default function Page() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [dusun, setDusun] = useState("Semua");
  const [page, setPage] = useState(1);

  const kategoriList = ["Semua", "Makanan & Minuman", "Kerajinan"];
  const dusunList = ["Semua", "Jetis", "Ngaran", "Pucung", "Sumber"];

  const filtered = useMemo(() => {
    return productData.filter((item) => {
      const matchNama = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchKategori = kategori === "Semua" || item.category === kategori;
      const matchDusun = dusun === "Semua" || item.dusun === dusun;
      return matchNama && matchKategori && matchDusun;
    });
  }, [search, kategori, dusun]);

  const totalPage = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="bg-color3 min-h-screen">
      <section className="max-w-7xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold text-color5">Daftar Produk UMKM</h1>

        <div className="text-gray-500 mt-2 flex gap-2">
          <span>Temukan produk-produk unggulan dari para pelaku UMKM Desa Masaran</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mt-8">
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama atau deskripsi produk..."
                className="w-full border rounded-lg h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-color1"
              />
            </div>

            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setPage(1);
              }}
              className="lg:col-span-3 h-12 border rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-color1 bg-white"
            >
              {kategoriList.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={dusun}
              onChange={(e) => {
                setDusun(e.target.value);
                setPage(1);
              }}
              className="lg:col-span-3 h-12 border rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-color1 bg-white"
            >
              {dusunList.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <button className="lg:col-span-1 h-12 rounded-lg bg-color1 hover:opacity-90 text-white font-semibold transition-opacity">
              Cari
            </button>
          </div>
        </div>

        <div className="grid mt-8 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              umkmName={item.umkmName}
              href={`/umkm/${item.umkmSlug}`}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-color5">Produk Tidak Ditemukan</h2>
            <p className="text-gray-500 mt-2">Coba gunakan kata kunci atau filter lain.</p>
          </div>
        )}

        {totalPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="w-10 h-10 rounded-lg border disabled:opacity-40 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPage }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`w-10 h-10 rounded-lg transition font-semibold ${page === index + 1 ? "bg-color1 text-white" : "bg-white border hover:bg-gray-50"}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              disabled={page === totalPage}
              onClick={() => setPage(page + 1)}
              className="w-10 h-10 rounded-lg border disabled:opacity-40 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
