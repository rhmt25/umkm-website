"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Select from "react-select";
import UmkmCard from "@/components/UmkmCard";
import { FORM_LIMITS } from "@/lib/form-limits";

export interface GuestUmkmItem {
  id: number;
  slug: string;
  name: string;
  owner: string;
  category: string;
  location: string;
  image?: string;
}

interface GuestUmkmDirectoryProps {
  initialUmkms: GuestUmkmItem[];
  categories: string[];
  dusuns: string[];
}

type SelectOption = { value: string; label: string };

const selectStyles = {
  control: (base: any) => ({
    ...base,
    height: 48,
    minHeight: 48,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    boxShadow: "none",
    ":hover": { borderColor: "#2d5d20" },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f2eac7" : "white",
    color: "#412712",
  }),
  menu: (base: any) => ({ ...base, zIndex: 20 }),
};

const PER_PAGE = 12;

export default function GuestUmkmDirectory({ initialUmkms, categories, dusuns }: GuestUmkmDirectoryProps) {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [dusun, setDusun] = useState("Semua");
  const [page, setPage] = useState(1);

  const categoryOptions: SelectOption[] = useMemo(
    () => [{ value: "Semua", label: "Semua Kategori" }, ...categories.map((c) => ({ value: c, label: c }))],
    [categories]
  );

  const dusunOptions: SelectOption[] = useMemo(
    () => [{ value: "Semua", label: "Semua Dusun" }, ...dusuns.map((d) => ({ value: d, label: d }))],
    [dusuns]
  );

  const filtered = useMemo(() => {
    return initialUmkms.filter((item) => {
      const matchNama = item.name.toLowerCase().includes(search.toLowerCase());
      const matchKategori = kategori === "Semua" || item.category === kategori;
      const matchDusun = dusun === "Semua" || item.location === dusun || item.location === `Dusun ${dusun}`;
      return matchNama && matchKategori && matchDusun;
    });
  }, [search, kategori, dusun, initialUmkms]);

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
              <FiSearch className="absolute left-4 top-4 text-gray-400 z-10" />
              <input
                value={search}
                maxLength={FORM_LIMITS.search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama UMKM..."
                className="w-full border rounded-lg h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-color1"
              />
            </div>

            <div className="lg:col-span-3">
              <Select<SelectOption>
                instanceId="umkm-kategori-select"
                value={categoryOptions.find((o) => o.value === kategori)}
                onChange={(option) => {
                  setKategori(option?.value ?? "Semua");
                  setPage(1);
                }}
                options={categoryOptions}
                placeholder="Pilih Kategori..."
                styles={selectStyles}
              />
            </div>

            <div className="lg:col-span-3">
              <Select<SelectOption>
                instanceId="umkm-dusun-select"
                value={dusunOptions.find((o) => o.value === dusun)}
                onChange={(option) => {
                  setDusun(option?.value ?? "Semua");
                  setPage(1);
                }}
                options={dusunOptions}
                placeholder="Pilih Dusun..."
                styles={selectStyles}
              />
            </div>

            <button className="lg:col-span-1 h-12 rounded-lg bg-color1 hover:opacity-90 text-white font-semibold">
              Cari
            </button>
          </div>
        </div>

        <div className="grid mt-8 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((item) => (
            <UmkmCard
              key={item.id}
              name={item.name}
              owner={item.owner}
              category={item.category}
              location={item.location}
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
