"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import UmkmCard from "@/components/UmkmCard";

const umkmData = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  name: ["Keripik Bu Sri", "Dapoer Mak Tun", "Batik Masaran", "Madu Masaran"][index % 4],
  owner: ["Sri Rahayu", "Sutini", "Agus Setiawan", "Budi Santoso"][index % 4],
  category: index % 4 === 2 ? "Kerajinan" : "Makanan & Minuman",
  village: ["Jetis", "Ngaran", "Pucung", "Sumber"][index % 4],
}));

const PER_PAGE = 12;

export default function Page() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => umkmData.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.owner.toLowerCase().includes(search.toLowerCase())), [search]);
  const totalPage = Math.ceil(filtered.length / PER_PAGE);
  const visibleItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p><h1 className="mt-1 text-3xl font-bold">Daftar UMKM</h1><p className="mt-2 text-color5/65">Kelola seluruh data usaha di Desa Masaran.</p></div><Link href="/admin/umkm/tambah" className="inline-flex items-center justify-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-color1/90"><Plus size={19} /> Tambah UMKM</Link></div>
      <div className="relative mt-8 max-w-xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={19} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari nama UMKM atau pemilik..." className="h-12 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15" /></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => <UmkmCard key={item.id} name={item.name} owner={item.owner} category={item.category} location={`Dusun ${item.village}`} href={`/admin/umkm/${item.id}`} />)}
      </div>
      {!visibleItems.length && <p className="py-20 text-center text-color5/60">UMKM tidak ditemukan.</p>}
      {totalPage > 1 && <div className="mt-10 flex items-center justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:opacity-40"><ChevronLeft size={19} /></button>{Array.from({ length: totalPage }, (_, index) => index + 1).map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`h-10 w-10 rounded-lg font-bold ${page === number ? "bg-color1 text-white" : "border border-color4 bg-color3"}`}>{number}</button>)}<button type="button" disabled={page === totalPage} onClick={() => setPage((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:opacity-40"><ChevronRight size={19} /></button></div>}
    </main>
  );
}
