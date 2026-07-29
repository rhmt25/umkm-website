"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Tag, Trash2 } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/kategori/actions";
import { FORM_LIMITS, characterHint } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";

type Category = { id: number; name: string };
const PER_PAGE = 10;

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const filtered = useMemo(() => categories.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [categories, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function reset() { setName(""); setEditingId(null); setMessage(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const result = await saveCategory({ id: editingId ?? undefined, name });
      setSaving(false);
      if (result.error) { showToast(result.error, "error"); return setMessage(result.error); }
      showToast(editingId ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.", "success");
      reset(); setPage(1); router.refresh();
    } catch (err) {
      setSaving(false);
      showToast("Gagal memproses data karena gangguan sistem. Silakan coba beberapa saat lagi.", "error");
      console.error("submit error:", err);
    }
  }
  async function remove(id: number) {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      const result = await deleteCategory(id);
      if (result.error) { showToast(result.error, "error"); return setMessage(result.error); }
      showToast("Kategori berhasil dihapus.", "success");
      setCategories((items) => items.filter((item) => item.id !== id));
      if (editingId === id) reset();
      router.refresh();
    } catch (err) {
      showToast("Gagal menghapus kategori karena gangguan sistem. Silakan coba beberapa saat lagi.", "error");
      console.error("remove error:", err);
    }
  }
  return <main className="p-5 sm:p-8 lg:p-10">
    <div><p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p><h1 className="mt-1 text-3xl font-bold">Kategori UMKM</h1><p className="mt-2 text-color5/65">Tambahkan dan kelola kategori usaha yang tersedia.</p></div>
    <section className="mt-8 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-color4 text-color1"><Tag size={20}/></span><div><h2 className="text-xl font-bold">{editingId ? "Edit Kategori" : "Tambah Kategori"}</h2><p className="text-sm text-color5/60">Masukkan nama kategori usaha.</p></div></div><form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row"><div className="flex-1"><input value={name} maxLength={FORM_LIMITS.categoryName} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Makanan & Minuman" className="h-12 w-full rounded-xl border border-color4 bg-color3 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"/><span className="mt-2 block text-xs text-color5/55">{characterHint(FORM_LIMITS.categoryName)}</span></div><div className="flex gap-3"><button type="button" onClick={reset} className="h-12 rounded-xl border border-color4 px-5 font-bold">Batal</button><button disabled={saving || !name.trim()} className="inline-flex h-12 items-center gap-2 rounded-xl bg-color1 px-5 font-bold text-white disabled:opacity-50">{editingId ? <Edit3 size={18}/> : <Plus size={18}/>}{saving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}</button></div></form>{message && <p className="mt-4 text-sm font-medium text-red-600">{message}</p>}</section>
    <section className="mt-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Daftar Kategori</h2><p className="mt-1 text-sm text-color5/60">{categories.length} kategori tersedia</p></div><div className="relative w-full sm:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={18}/><input value={search} maxLength={FORM_LIMITS.search} onChange={(event)=>{setSearch(event.target.value);setPage(1)}} placeholder="Cari kategori..." className="h-11 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none focus:border-color1"/></div></div><div className="mt-5 overflow-hidden rounded-2xl border border-color4/80 bg-color3 shadow-sm"><div className="divide-y divide-color4/70">{visible.map((item)=><div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-color4 text-color1"><Tag size={17}/></span><p className="truncate font-semibold">{item.name}</p></div><div className="flex gap-2"><button onClick={()=>{setEditingId(item.id);setName(item.name);setMessage("")}} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-color4 px-3 text-sm font-bold text-color1"><Edit3 size={15}/> Edit</button><button onClick={()=>remove(item.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600" aria-label={`Hapus ${item.name}`}><Trash2 size={16}/></button></div></div>)}</div>{!visible.length && <p className="py-12 text-center text-sm text-color5/60">Kategori tidak ditemukan.</p>}</div>{totalPages > 1 && <div className="mt-7 flex justify-center gap-2"><button disabled={page===1} onClick={()=>setPage(page-1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 disabled:opacity-40"><ChevronLeft size={19}/></button>{Array.from({length:totalPages},(_,i)=>i+1).map((number)=><button key={number} onClick={()=>setPage(number)} className={`h-10 w-10 rounded-lg font-bold ${page===number?"bg-color1 text-white":"border border-color4 bg-color3"}`}>{number}</button>)}<button disabled={page===totalPages} onClick={()=>setPage(page+1)} className="grid h-10 w-10 place-items-center rounded-lg border border-color4 disabled:opacity-40"><ChevronRight size={19}/></button></div>}</section>
  </main>;
}
