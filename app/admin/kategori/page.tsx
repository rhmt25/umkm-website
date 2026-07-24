"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Tag, Trash2 } from "lucide-react";

type Category = { id: number; name: string };

const initialCategories: Category[] = [
  { id: 1, name: "Makanan & Minuman" },
  { id: 2, name: "Kerajinan" },
  { id: 3, name: "Fashion" },
  { id: 4, name: "Pertanian" },
  { id: 5, name: "Jasa" },
  { id: 6, name: "Peternakan" },
  { id: 7, name: "Kecantikan" },
  { id: 8, name: "Perikanan" },
  { id: 9, name: "Otomotif" },
  { id: 10, name: "Teknologi" },
  { id: 11, name: "Pendidikan" },
  { id: 12, name: "Rumah Tangga" },
];

const PER_PAGE = 10;

export default function Page() {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const isEditing = editingId !== null;

  const filteredCategories = useMemo(() => categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())), [categories, search]);
  const totalPage = Math.ceil(filteredCategories.length / PER_PAGE);
  const visibleCategories = filteredCategories.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetForm() {
    setName("");
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (editingId !== null) {
      setCategories((current) => current.map((category) => category.id === editingId ? { ...category, name: trimmedName } : category));
    } else {
      setCategories((current) => [...current, { id: Date.now(), name: trimmedName }]);
    }
    setPage(1);
    resetForm();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
  }

  function removeCategory(id: number) {
    setCategories((current) => current.filter((category) => category.id !== id));
    setPage(1);
    if (editingId === id) resetForm();
  }

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div><p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p><h1 className="mt-1 text-3xl font-bold">Kategori UMKM</h1><p className="mt-2 text-color5/65">Tambahkan dan kelola kategori usaha yang tersedia.</p></div>

      <section className="mt-8 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-color4 text-color1"><Tag size={20} /></span><div><h2 className="text-xl font-bold">{isEditing ? "Edit Kategori" : "Tambah Kategori"}</h2><p className="text-sm text-color5/60">{isEditing ? "Perbarui nama kategori yang dipilih." : "Masukkan nama kategori baru."}</p></div></div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Makanan & Minuman" className="h-12 flex-1 rounded-xl border border-color4 bg-color3 px-4 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15" />
          <div className="flex gap-3"><button type="button" onClick={resetForm} className="h-12 rounded-xl border border-color4 px-5 font-bold transition hover:bg-color2">Batal</button><button type="submit" disabled={!name.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-color1 px-5 font-bold text-white transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-45">{isEditing ? <Edit3 size={18} /> : <Plus size={18} />}{isEditing ? "Perbarui" : "Simpan"}</button></div>
        </form>
      </section>

      <section className="mt-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Daftar Kategori</h2><p className="mt-1 text-sm text-color5/60">{categories.length} kategori tersedia</p></div><div className="relative w-full sm:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={18} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari kategori..." className="h-11 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15" /></div></div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-color4/80 bg-color3 shadow-sm"><div className="divide-y divide-color4/70">{visibleCategories.map((category) => <div key={category.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-color4 text-color1"><Tag size={17} /></span><p className="truncate font-semibold">{category.name}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => startEdit(category)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-color4 px-3 text-sm font-bold text-color1 transition hover:bg-color4/50"><Edit3 size={15} /> Edit</button><button type="button" onClick={() => removeCategory(category.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50" aria-label={`Hapus ${category.name}`}><Trash2 size={16} /></button></div></div>)}</div>{filteredCategories.length === 0 && <p className="py-12 text-center text-sm text-color5/60">Kategori tidak ditemukan.</p>}</div>
        {totalPage > 1 && <div className="mt-7 flex items-center justify-center gap-2"><button type="button" aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={19} /></button>{Array.from({ length: totalPage }, (_, index) => index + 1).map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`h-10 w-10 rounded-lg font-bold ${page === number ? "bg-color1 text-white" : "border border-color4 bg-color3 hover:bg-color2"}`}>{number}</button>)}<button type="button" aria-label="Halaman berikutnya" disabled={page === totalPage} onClick={() => setPage((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={19} /></button></div>}
      </section>
    </main>
  );
}
