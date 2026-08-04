"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Select from "react-select";
import ProductCard from "@/components/ProductCard";
import { FORM_LIMITS } from "@/lib/form-limits";

export interface GuestProductItem {
  id: number;
  name: string;
  description: string;
  umkmName: string;
  umkmSlug: string;
  category: string;
  dusun: string;
  price: string;
}

interface GuestProductDirectoryProps {
  initialProducts: GuestProductItem[];
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

export default function GuestProductDirectory({ initialProducts, categories, dusuns }: GuestProductDirectoryProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [dusun, setDusun] = useState("Semua");
  const [page, setPage] = useState(1);

  // Debounce search effect (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const categoryOptions: SelectOption[] = useMemo(
    () => [{ value: "Semua", label: "Semua Kategori" }, ...categories.map((c) => ({ value: c, label: c }))],
    [categories]
  );

  const dusunOptions: SelectOption[] = useMemo(
    () => [{ value: "Semua", label: "Semua Dusun" }, ...dusuns.map((d) => ({ value: d, label: d }))],
    [dusuns]
  );

  const filtered = useMemo(() => {
    return initialProducts.filter((item) => {
      const matchNama = item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.umkmName.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchKategori = kategori === "Semua" || item.category === kategori;
      const matchDusun = dusun === "Semua" || item.dusun === dusun;
      return matchNama && matchKategori && matchDusun;
    });
  }, [debouncedSearch, kategori, dusun, initialProducts]);

  const totalPage = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="bg-color3 min-h-screen">
      <section className="max-w-7xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold text-color5">Daftar Produk UMKM</h1>
        <div className="text-gray-500 mt-2 flex gap-2">
          <span>Temukan produk-produk unggulan dari para pelaku UMKM Desa Masaran</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mt-8 border border-color4/60">
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400 z-10" />
              <input
                value={search}
                maxLength={FORM_LIMITS.search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, deskripsi produk, atau toko..."
                className="w-full border rounded-lg h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-color1 border-gray-200"
              />
            </div>

            <div className="lg:col-span-3">
              <Select<SelectOption>
                instanceId="produk-kategori-select"
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
                instanceId="produk-dusun-select"
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
