"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import UmkmCard from "@/components/UmkmCard";
import ConfirmModal from "@/components/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import { FORM_LIMITS } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";
import { deleteUmkm } from "@/app/admin/umkm/[id]/actions";

type UmkmItem = { id: number; name: string; owner: string; category: string; village: string; image?: string };

type RawUmkmRow = {
  id: number;
  nama: string;
  pemilik: string;
  dusun: string | null;
  umkm_kategori?: Array<{ kategori?: { nama?: string } }>;
  umkm_images?: Array<{ slot: string; storage_path: string }>;
};

const PER_PAGE = 12;

export default function AdminUmkmList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [umkmData, setUmkmData] = useState<UmkmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UmkmItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  // Debounce search effect (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("umkm")
        .select("id,nama,pemilik,dusun,umkm_kategori(kategori(nama)),umkm_images(slot,storage_path)")
        .order("nama");

      if (error) {
        showToast(
          "Penyebab: Gagal mengambil data daftar UMKM dari database server.\nSolusi: Silakan muat ulang halaman ini.",
          "error"
        );
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as RawUmkmRow[];
      setUmkmData(
        rows.map((item) => {
          const logo = item.umkm_images?.find((image) => image.slot === "logo");
          return {
            id: item.id,
            name: item.nama,
            owner: item.pemilik,
            village: item.dusun ?? "-",
            category:
              item.umkm_kategori?.map((row) => row.kategori?.nama).filter(Boolean).join(", ") ||
              "Belum ada kategori",
            image: logo
              ? supabase.storage.from("umkm-media").getPublicUrl(logo.storage_path).data.publicUrl
              : undefined,
          };
        })
      );
      setLoading(false);
    } catch (err) {
      showToast(
        "Penyebab: Terjadi gangguan jaringan saat memuat data UMKM.\nSolusi: Periksa koneksi internet Anda dan coba lagi.",
        "error"
      );
      setLoading(false);
      console.error("fetch umkm list error:", err);
    }
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await deleteUmkm(deleteTarget.id);
      setIsDeleting(false);

      if (res.error) {
        showToast(res.error, "error");
        return;
      }

      // Instant real-time UI update without reload
      setUmkmData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast(`UMKM "${deleteTarget.name}" berhasil dihapus beserta seluruh datanya.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      setIsDeleting(false);
      showToast(
        "Gagal Menghapus UMKM\nPenyebab: Gagal menghapus UMKM karena gangguan jaringan atau server.\nSolusi: Silakan coba lagi beberapa saat lagi.",
        "error"
      );
      console.error("delete umkm error:", err);
    }
  };

  const filtered = useMemo(
    () =>
      umkmData.filter(
        (item) =>
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.owner.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.village.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [debouncedSearch, umkmData]
  );

  const totalPage = Math.ceil(filtered.length / PER_PAGE);
  const visibleItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-color1">Manajemen Data</p>
          <h1 className="mt-1 text-3xl font-bold">Daftar UMKM</h1>
          <p className="mt-2 text-color5/65">Kelola seluruh data usaha di Desa Masaran.</p>
        </div>
        <Link
          href="/admin/umkm/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-color1/90"
        >
          <Plus size={19} /> Tambah UMKM
        </Link>
      </div>

      <div className="relative mt-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={19} />
        <input
          value={search}
          maxLength={FORM_LIMITS.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama UMKM, pemilik, kategori, atau dusun..."
          className="h-12 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15"
        />
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <UmkmCard
            key={item.id}
            name={item.name}
            owner={item.owner}
            category={item.category}
            location={`Dusun ${item.village}`}
            image={item.image}
            href={`/admin/umkm/${item.id}`}
            onDelete={() => setDeleteTarget(item)}
            isDeleting={isDeleting && deleteTarget?.id === item.id}
          />
        ))}
      </div>

      {!visibleItems.length && (
        <p className="py-20 text-center text-color5/60">
          {loading ? "Memuat data UMKM..." : "UMKM tidak ditemukan."}
        </p>
      )}

      {totalPage > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:opacity-40"
          >
            <ChevronLeft size={19} />
          </button>
          {Array.from({ length: totalPage }, (_, index) => index + 1).map((number) => (
            <button
              type="button"
              key={number}
              onClick={() => setPage(number)}
              className={`h-10 w-10 rounded-lg font-bold ${
                page === number ? "bg-color1 text-white" : "border border-color4 bg-color3"
              }`}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPage}
            onClick={() => setPage((value) => value + 1)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:opacity-40"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      )}

      {/* Custom Confirm Modal for Delete UMKM */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus UMKM ini?"
        message={`Apakah Anda yakin ingin menghapus data UMKM "${deleteTarget?.name}"? Seluruh foto, kategori, dan produk yang terkait akan dihapus secara permanen.`}
        confirmLabel="Hapus UMKM"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={() => void handleDeleteConfirm()}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}
