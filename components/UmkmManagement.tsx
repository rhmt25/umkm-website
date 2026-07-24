"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import Select from "react-select";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImagePlus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type UmkmForm = Record<(typeof formFields)[number][0], string>;
type Product = { id: number; name: string; description: string; price: string };
type UploadedImage = { name: string; url: string };

const formFields = [
  ["nama", "Nama UMKM", "text"],
  ["pemilik", "Nama Pemilik", "text"],
  ["rt", "RT", "text"],
  ["rw", "RW", "text"],
  ["dukuh", "Dukuh", "text"],
  ["dusun", "Dusun", "text"],
  ["alamat_lengkap", "Alamat Lengkap", "text"],
  ["no_wa", "Nomor WhatsApp", "tel"],
  ["instagram", "Instagram", "text"],
  ["tiktok", "TikTok", "text"],
  ["facebook", "Facebook", "text"],
  ["shopee", "Shopee", "url"],
  ["tokopedia", "Tokopedia", "url"],
  ["google_maps", "Google Maps", "url"],
  ["keunggulan1", "Keunggulan Produk 1", "text"],
  ["keunggulan2", "Keunggulan Produk 2", "text"],
  ["keunggulan3", "Keunggulan Produk 3", "text"],
  ["keunggulan4", "Keunggulan Produk 4", "text"],
  ["password", "Password", "password"],
] as const;

const defaultForm: UmkmForm = {
  nama: "Keripik Bu Sri",
  pemilik: "Sri Rahayu",
  rt: "02",
  rw: "04",
  dukuh: "Jetis",
  dusun: "Masaran",
  alamat_lengkap:
    "Dusun Jetis, Desa Masaran, Kecamatan Muntilan, Kabupaten Magelang",
  no_wa: "0812-3456-7890",
  instagram: "@keripik_busri",
  tiktok: "@keripik_busri",
  facebook: "Keripik Bu Sri",
  shopee: "https://shopee.co.id/keripikbusri",
  tokopedia: "https://tokopedia.com/keripikbusri",
  google_maps: "https://maps.google.com",
  keunggulan1: "Bahan pilihan berkualitas",
  keunggulan2: "Tanpa bahan pengawet",
  keunggulan3: "Renyah dan gurih",
  keunggulan4: "Diproduksi secara higienis",
  password: "keripik123",
};

const imageSlots = [
  "Logo UMKM",
  "Gambar UMKM 1",
  "Gambar UMKM 2",
  "Gambar UMKM 3",
  "Gambar UMKM 4",
  "Gambar UMKM 5",
];
const PRODUCTS_PER_PAGE = 9;
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Keripik Singkong Original",
    description: "Keripik singkong renyah dengan rasa original.",
    price: "15000",
  },
  {
    id: 2,
    name: "Keripik Singkong Pedas",
    description: "Rasa pedas gurih, cocok untuk camilan.",
    price: "16000",
  },
  {
    id: 3,
    name: "Keripik Singkong Balado",
    description: "Perpaduan rasa pedas manis yang nikmat.",
    price: "16000",
  },
  ...Array.from({ length: 7 }, (_, index) => ({
    id: index + 4,
    name: `Keripik Singkong Varian ${index + 4}`,
    description: "Varian keripik singkong pilihan dengan rasa yang istimewa.",
    price: "17000",
  })),
];

type CategoryOption = { value: string; label: string };

const categoryOptions: CategoryOption[] = [
  "Makanan & Minuman",
  "Kerajinan",
  "Fashion",
  "Pertanian",
  "Jasa",
  "Peternakan",
  "Kecantikan",
].map((category) => ({ value: category, label: category }));

function CategorySelector() {
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState([
    "Makanan & Minuman",
  ]);
  const canAdd = Boolean(
    category && !selectedCategories.includes(category.value),
  );

  function addCategory() {
    if (!category || selectedCategories.includes(category.value)) return;
    setSelectedCategories((current) => [...current, category.value]);
    setCategory(null);
  }

  return (
    <section className="mt-7 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold">Kategori UMKM</h2>
      <p className="mt-2 text-sm text-color5/60">
        Pilih satu atau beberapa kategori yang sesuai dengan UMKM ini.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Select<CategoryOption>
            instanceId="umkm-category-selector"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Cari dan pilih kategori..."
            noOptionsMessage={() => "Kategori tidak ditemukan"}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 48,
                borderColor: "#f2eac7",
                borderRadius: 12,
                boxShadow: "none",
                ":hover": { borderColor: "#2d5d20" },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#f2eac7" : "white",
                color: "#412712",
              }),
              menu: (base) => ({ ...base, zIndex: 20 }),
            }}
          />
        </div>
        <button
          type="button"
          disabled={!canAdd}
          onClick={addCategory}
          className="h-12 rounded-xl bg-color1 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tambah
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {selectedCategories.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-color4 px-3 py-2 text-sm font-semibold text-color5"
          >
            {item}
            <button
              type="button"
              onClick={() =>
                setSelectedCategories((current) =>
                  current.filter((value) => value !== item),
                )
              }
              aria-label={`Hapus kategori ${item}`}
              className="grid h-5 w-5 place-items-center rounded-full text-color5/60 hover:bg-color5/10 hover:text-color5"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}

function ProductEditor({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (id: number) => void;
}) {
  const [saved, setSaved] = useState(product);
  const [draft, setDraft] = useState(product);
  const changed = JSON.stringify(saved) !== JSON.stringify(draft);
  const update = (key: keyof Product, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <article className="rounded-2xl border border-color4/80 bg-color3 p-4 shadow-sm">
      <h3 className="font-bold text-color1">Produk</h3>
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            Nama Produk
          </span>
          <input
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            className="h-10 w-full rounded-lg border border-color4 px-3 outline-none focus:border-color1"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Deskripsi</span>
          <textarea
            value={draft.description}
            onChange={(event) => update("description", event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-color4 px-3 py-2 text-sm outline-none focus:border-color1"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Harga</span>
          <input
            value={draft.price}
            onChange={(event) =>
              update("price", event.target.value.replace(/\D/g, ""))
            }
            inputMode="numeric"
            placeholder="Contoh: 15000"
            className="h-10 w-full rounded-lg border border-color4 px-3 outline-none focus:border-color1"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!changed}
          onClick={() => setDraft(saved)}
          className="rounded-lg border border-color4 px-3 py-1.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={!changed}
          onClick={() => setSaved(draft)}
          className="rounded-lg bg-color1 px-3 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => onDelete(product.id)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} /> Hapus
        </button>
      </div>
    </article>
  );
}

export default function UmkmManagement({ umkmId }: { umkmId: string }) {
  const [savedForm, setSavedForm] = useState(defaultForm);
  const [draftForm, setDraftForm] = useState(defaultForm);
  const [savedFiles, setSavedFiles] = useState<Record<string, UploadedImage>>({});
  const [files, setFiles] = useState<Record<string, UploadedImage>>({});
  const [uploadError, setUploadError] = useState("");
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const formChanged = JSON.stringify(savedForm) !== JSON.stringify(draftForm);
  const imagesChanged = JSON.stringify(savedFiles) !== JSON.stringify(files);
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );
  const totalProductPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE,
  );
  const visibleProducts = filteredProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE,
  );

  function updateForm(key: keyof UmkmForm, value: string) {
    setDraftForm((current) => ({ ...current, [key]: value }));
  }
  function saveForm() {
    setSavedForm(draftForm);
  }
  function handleUpload(event: ChangeEvent<HTMLInputElement>, slot: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setUploadError("Gambar harus berformat JPEG/JPG/PNG dan maksimal 2 MB.");
      event.target.value = "";
      return;
    }
    setUploadError("");
    setFiles((current) => ({
      ...current,
      [slot]: { name: file.name, url: URL.createObjectURL(file) },
    }));
  }

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <Link
        href="/admin/umkm"
        className="inline-flex items-center gap-2 text-sm font-bold text-color1 hover:underline"
      >
        <ArrowLeft size={17} /> Kembali ke Daftar UMKM
      </Link>
      <div className="mt-5">
        <p className="text-sm font-bold uppercase tracking-wide text-color1">
          Manajemen UMKM #{umkmId}
        </p>
        <h1 className="mt-1 text-3xl font-bold">Manajemen UMKM</h1>
        <p className="mt-2 text-color5/65">
          Perbarui profil usaha, gambar, dan produk yang dijual.
        </p>
      </div>
      <section className="mt-8 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold">Data UMKM</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {formFields.map(([key, label, type]) => (
            <label
              key={key}
              className={key === "alamat_lengkap" ? "md:col-span-2" : ""}
            >
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              {key === "alamat_lengkap" ? (
                <textarea
                  value={draftForm[key]}
                  onChange={(event) => updateForm(key, event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-color4 px-4 py-3 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
                />
              ) : (
                <input
                  type={type}
                  value={draftForm[key]}
                  onChange={(event) => updateForm(key, event.target.value)}
                  className="h-12 w-full rounded-xl border border-color4 px-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
                />
              )}
            </label>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!formChanged}
            onClick={() => setDraftForm(savedForm)}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!formChanged}
            onClick={saveForm}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} /> Simpan Perubahan
          </button>
        </div>
      </section>
      <CategorySelector />
      <section className="mt-7 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <ImagePlus className="text-color1" size={22} />
          <h2 className="text-xl font-bold">Logo dan Gambar UMKM</h2>
        </div>
        <p className="mt-2 text-sm text-color5/60">
          Unggah atau ganti logo serta gambar usaha. Maksimal 2 MB, format
          JPEG/JPG/PNG.
        </p>
        {uploadError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {uploadError}
          </p>
        )}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {imageSlots.map((slot) => (
            <article key={slot} className="rounded-2xl border border-color4/80 p-4">
              <p className="font-bold">{slot}</p>
              <button type="button" disabled={!files[slot]} onClick={() => setPreviewImage(files[slot] ?? null)} className="mt-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-color4/65 text-sm font-semibold text-color5/50 disabled:cursor-default">
                {files[slot] ? <img src={files[slot].url} alt={slot} className="h-full w-full object-cover transition hover:scale-105" /> : <span className="flex items-center gap-2"><Camera size={19} /> Gambar</span>}
              </button>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-color4 px-3 py-2 text-sm font-bold text-color1 transition hover:bg-color4/45">
                <span className="flex items-center gap-2"><Upload size={16} /> {files[slot] ? "Ganti Gambar" : "Upload Gambar"}</span>
                <span className="mt-1 text-[11px] font-medium text-color5/55">Maks. 2 MB • JPEG/JPG/PNG</span>
                <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(event) => handleUpload(event, slot)} />
              </label>
            </article>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button type="button" disabled={!imagesChanged} onClick={() => setFiles({ ...savedFiles })} className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40">Batal</button>
          <button type="button" disabled={!imagesChanged} onClick={() => setSavedFiles({ ...files })} className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Save size={18} /> Simpan Gambar</button>
        </div>
      </section>
      {previewImage && <div role="dialog" aria-modal="true" aria-label="Preview gambar UMKM" className="fixed inset-0 z-50 flex items-center justify-center bg-color5/75 p-5" onClick={() => setPreviewImage(null)}><div className="relative max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}><img src={previewImage.url} alt={previewImage.name} className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" /><button type="button" onClick={() => setPreviewImage(null)} className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-color3 text-color5 shadow-lg" aria-label="Tutup preview"><X size={20} /></button><a href={previewImage.url} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-color3 px-4 py-2 text-sm font-bold text-color1"><ExternalLink size={16} /> Buka gambar</a></div></div>}
      <section className="mt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Produk UMKM</h2>
            <p className="mt-1 text-sm text-color5/60">
              Kelola daftar produk yang ditampilkan pada usaha ini.
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45"
              size={18}
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setProductPage(1);
              }}
              placeholder="Cari produk..."
              className="h-11 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none focus:border-color1 focus:ring-2 focus:ring-color1/15"
            />
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductEditor
              key={product.id}
              product={product}
              onDelete={(id) => {
                setProducts((current) =>
                  current.filter((item) => item.id !== id),
                );
                setProductPage(1);
              }}
            />
          ))}
        </div>
        {!visibleProducts.length && (
          <p className="mt-5 rounded-2xl border border-color4 bg-color3 py-12 text-center text-sm text-color5/60">
            Produk tidak ditemukan.
          </p>
        )}
        {totalProductPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Halaman produk sebelumnya"
              disabled={productPage === 1}
              onClick={() => setProductPage((value) => value - 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={19} />
            </button>
            {Array.from(
              { length: totalProductPages },
              (_, index) => index + 1,
            ).map((number) => (
              <button
                type="button"
                key={number}
                onClick={() => setProductPage(number)}
                className={`h-10 w-10 rounded-lg font-bold ${productPage === number ? "bg-color1 text-white" : "border border-color4 bg-color3 hover:bg-color2"}`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              aria-label="Halaman produk berikutnya"
              disabled={productPage === totalProductPages}
              onClick={() => setProductPage((value) => value + 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-color4 bg-color3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
