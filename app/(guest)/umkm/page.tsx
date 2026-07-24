"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import UmkmCard from "@/components/UmkmCard";

interface Umkm {
  id: number;
  slug: string;
  nama: string;
  pemilik: string;
  kategori: string;
  dusun: string;
  rating: number;
  image: string;
}

const umkmData: Umkm[] = Array.from({ length: 36 }, (_, i) => ({
  id: i + 1,
  slug: i % 4 === 0 ? "keripik-bu-sri" : i % 4 === 1 ? "dapoer-mak-tun" : i % 4 === 2 ? "batik-masaran" : "madu-masaran",
  nama:
    i % 4 === 0
      ? "Keripik Bu Sri"
      : i % 4 === 1
      ? "Dapoer Mak Tun"
      : i % 4 === 2
      ? "Batik Masaran"
      : "Madu Masaran",
  pemilik:
    i % 4 === 0
      ? "Sri Rahayu"
      : i % 4 === 1
      ? "Sutini"
      : i % 4 === 2
      ? "Agus Setiawan"
      : "Budi Santoso",
  kategori: i % 4 === 2 ? "Kerajinan" : "Makanan & Minuman",
  dusun:
    i % 4 === 0
      ? "Jetis"
      : i % 4 === 1
      ? "Ngaran"
      : i % 4 === 2
      ? "Pucung"
      : "Sumber",
  rating:
    i % 4 === 0
      ? 4.8
      : i % 4 === 1
      ? 4.6
      : i % 4 === 2
      ? 4.9
      : 4.7,
  image: "https://placehold.co/500x500?text=LOGO",
}));

const PER_PAGE = 12;

export default function Page() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [dusun, setDusun] = useState("Semua");
  const [page, setPage] = useState(1);

  const kategoriList = ["Semua", "Makanan & Minuman", "Kerajinan"];
  const dusunList = ["Semua", "Jetis", "Ngaran", "Pucung", "Sumber"];

  const filtered = useMemo(() => {
    return umkmData.filter((item) => {
      const matchNama = item.nama.toLowerCase().includes(search.toLowerCase());
      const matchKategori = kategori === "Semua" || item.kategori === kategori;
      const matchDusun = dusun === "Semua" || item.dusun === dusun;
      return matchNama && matchKategori && matchDusun;
    });
  }, [search, kategori, dusun]);

  const totalPage = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="bg-color3 min-h-screen">
      <section className="max-w-7xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold text-color5">Daftar UMKM</h1>

        <div className="text-gray-500 mt-2 flex gap-2">
          <span>Daftar UMKM di Desa Masaran</span>
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
                placeholder="Cari nama UMKM..."
                className="w-full border rounded-lg h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-color1"
              />
            </div>

            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setPage(1);
              }}
              className="lg:col-span-3 h-12 border rounded-lg px-4"
            >
              {kategoriList.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={dusun}
              onChange={(e) => {
                setDusun(e.target.value);
                setPage(1);
              }}
              className="lg:col-span-3 h-12 border rounded-lg px-4"
            >
              {dusunList.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <button className="lg:col-span-1 h-12 rounded-lg bg-color1 hover:opacity-90 text-white font-semibold">
              Cari
            </button>
          </div>
        </div>

        <div className="grid mt-8 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((item) => (
            <UmkmCard
              key={item.id}
              name={item.nama}
              owner={item.pemilik}
              category={item.kategori}
              location={`Dusun ${item.dusun}`}
              image={item.image}
              href={`/umkm/${item.slug}`}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-color5">UMKM Tidak Ditemukan</h2>
            <p className="text-gray-500 mt-2">Coba gunakan kata kunci lain.</p>
          </div>
        )}

        {totalPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="w-10 h-10 rounded-lg border disabled:opacity-40 flex items-center justify-center"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPage }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`w-10 h-10 rounded-lg transition ${page === index + 1 ? "bg-color1 text-white" : "bg-white border"}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              disabled={page === totalPage}
              onClick={() => setPage(page + 1)}
              className="w-10 h-10 rounded-lg border disabled:opacity-40 flex items-center justify-center"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
