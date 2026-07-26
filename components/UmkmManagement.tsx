"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImagePlus,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  createProduct,
  deleteProduct,
  deleteUmkmImage,
  updateProduct,
  updateUmkmCategories,
  updateUmkmProfile,
  uploadUmkmImage,
} from "@/app/admin/umkm/[id]/actions";

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

const defaultForm = Object.fromEntries(
  formFields.map(([key]) => [key, ""]),
) as UmkmForm;

const imageSlots = [
  "Logo UMKM",
  "Gambar UMKM 1",
  "Gambar UMKM 2",
  "Gambar UMKM 3",
] as const;

const slotKeys: Record<(typeof imageSlots)[number], "logo" | "gambar_1" | "gambar_2" | "gambar_3"> = {
  "Logo UMKM": "logo",
  "Gambar UMKM 1": "gambar_1",
  "Gambar UMKM 2": "gambar_2",
  "Gambar UMKM 3": "gambar_3",
};

const PRODUCTS_PER_PAGE = 9;

type CategoryOption = { value: string; label: string };

function CategorySelector({
  options,
  selectedIds,
  umkmId,
}: {
  options: CategoryOption[];
  selectedIds: string[];
  umkmId: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState(selectedIds);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canAdd = Boolean(category && !selectedCategories.includes(category.value));

  useEffect(() => {
    setSelectedCategories(selectedIds);
  }, [selectedIds]);

  async function persistCategories(next: string[]) {
    setLoading(true);
    setError("");
    const result = await updateUmkmCategories(
      Number(umkmId),
      next.map(Number),
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  function addCategory() {
    if (!category || selectedCategories.includes(category.value)) return;
    const next = [...selectedCategories, category.value];
    setSelectedCategories(next);
    setCategory(null);
    void persistCategories(next);
  }

  function removeCategory(item: string) {
    const next = selectedCategories.filter((value) => value !== item);
    setSelectedCategories(next);
    void persistCategories(next);
  }

  return (
    <section className="mt-7 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold">Kategori UMKM</h2>
      <p className="mt-2 text-sm text-color5/60">
        Pilih satu atau beberapa kategori yang sesuai dengan UMKM ini.
      </p>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Select<CategoryOption>
            instanceId="umkm-category-selector"
            value={category}
            onChange={setCategory}
            options={options}
            isDisabled={loading}
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
          disabled={!canAdd || loading}
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
            {options.find((option) => option.value === item)?.label}
            <button
              type="button"
              aria-label="Hapus kategori"
              disabled={loading}
              onClick={() => removeCategory(item)}
              className="grid h-5 w-5 place-items-center rounded-full text-color5/60 hover:bg-color5/10 hover:text-color5 disabled:opacity-40"
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
  umkmId,
  product,
  onDeleted,
  onSaved,
}: {
  umkmId: string;
  product: Product;
  onDeleted: () => void;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState(product);
  const [draft, setDraft] = useState(product);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const changed = JSON.stringify(saved) !== JSON.stringify(draft);

  useEffect(() => {
    setSaved(product);
    setDraft(product);
  }, [product]);

  const update = (key: keyof Product, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    setSaving(true);
    setError("");
    const result = await updateProduct(Number(umkmId), product.id, {
      name: draft.name,
      description: draft.description,
      price: draft.price,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(draft);
    onSaved();
  }

  async function remove() {
    if (!window.confirm("Hapus produk ini?")) return;
    setDeleting(true);
    setError("");
    const result = await deleteProduct(Number(umkmId), product.id);
    setDeleting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onDeleted();
  }

  return (
    <article className="rounded-2xl border border-color4/80 bg-color3 p-4 shadow-sm">
      <h3 className="font-bold text-color1">Produk</h3>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Nama Produk</span>
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
          disabled={!changed || saving || deleting}
          onClick={() => setDraft(saved)}
          className="rounded-lg border border-color4 px-3 py-1.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={!changed || saving || deleting}
          onClick={() => void save()}
          className="rounded-lg bg-color1 px-3 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          disabled={saving || deleting}
          onClick={() => void remove()}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 size={15} /> {deleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </article>
  );
}

export default function UmkmManagement({
  umkmId,
  initialForm,
  initialProducts,
  initialImages,
  categoryOptions,
  initialCategoryIds,
  showBackLink = true,
}: {
  umkmId: string;
  initialForm: Partial<UmkmForm>;
  initialProducts: Product[];
  initialImages: Record<string, UploadedImage>;
  categoryOptions: CategoryOption[];
  initialCategoryIds: string[];
  showBackLink?: boolean;
}) {
  const router = useRouter();
  const form = { ...defaultForm, ...initialForm, password: "" };
  const [savedForm, setSavedForm] = useState(form);
  const [draftForm, setDraftForm] = useState(form);
  const [savedImages, setSavedImages] =
    useState<Record<string, UploadedImage>>(initialImages);
  const [displayImages, setDisplayImages] =
    useState<Record<string, UploadedImage>>(initialImages);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [imageSuccess, setImageSuccess] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    const nextForm = { ...defaultForm, ...initialForm, password: "" };
    setSavedForm(nextForm);
    setDraftForm(nextForm);
  }, [initialForm]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setSavedImages(initialImages);
    setDisplayImages(initialImages);
    setPendingFiles({});
  }, [initialImages]);

  const formChanged = JSON.stringify(savedForm) !== JSON.stringify(draftForm);
  const imagesChanged = Object.keys(pendingFiles).length > 0;

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
    setFormSuccess("");
  }

  async function saveForm() {
    setSavingForm(true);
    setFormError("");
    setFormSuccess("");
    const result = await updateUmkmProfile(Number(umkmId), draftForm);
    setSavingForm(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    const nextForm = { ...draftForm, password: "" };
    setSavedForm(nextForm);
    setDraftForm(nextForm);
    setFormSuccess("Profil UMKM berhasil disimpan.");
    router.refresh();
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
    setImageSuccess("");
    setPendingFiles((current) => ({ ...current, [slot]: file }));
    setDisplayImages((current) => ({
      ...current,
      [slot]: { name: file.name, url: URL.createObjectURL(file) },
    }));
  }

  async function saveImages() {
    const entries = Object.entries(pendingFiles) as [string, File][];
    if (!entries.length) return;

    setSavingImages(true);
    setUploadError("");
    setImageSuccess("");

    for (const [slotLabel, file] of entries) {
      const slot = slotKeys[slotLabel as (typeof imageSlots)[number]];
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadUmkmImage(Number(umkmId), slot, formData);
      if (result.error) {
        setUploadError(result.error);
        setSavingImages(false);
        return;
      }
    }

    setSavingImages(false);
    setPendingFiles({});
    setImageSuccess("Gambar berhasil disimpan.");
    router.refresh();
  }

  function cancelImages() {
    for (const [slot, image] of Object.entries(displayImages)) {
      if (pendingFiles[slot] && image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }
    }
    setDisplayImages({ ...savedImages });
    setPendingFiles({});
    setUploadError("");
    setImageSuccess("");
  }

  async function removeImage(slotLabel: string) {
    const slot = slotKeys[slotLabel as (typeof imageSlots)[number]];
    if (!window.confirm(`Hapus ${slotLabel}?`)) return;

    setSavingImages(true);
    setUploadError("");
    setImageSuccess("");

    const result = await deleteUmkmImage(Number(umkmId), slot);
    setSavingImages(false);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    setImageSuccess("Gambar berhasil dihapus.");
    router.refresh();
  }

  async function handleAddProduct() {
    setAddingProduct(true);
    setProductError("");
    const result = await createProduct(Number(umkmId), {
      name: "Produk Baru",
      description: "",
      price: "0",
    });
    setAddingProduct(false);
    if (result.error) {
      setProductError(result.error);
      return;
    }
    setProductPage(1);
    router.refresh();
  }

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      {showBackLink ? (
        <Link
          href="/admin/umkm"
          className="inline-flex items-center gap-2 text-sm font-bold text-color1 hover:underline"
        >
          <ArrowLeft size={17} /> Kembali ke Daftar UMKM
        </Link>
      ) : null}
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
        {formError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}
        {formSuccess && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {formSuccess}
          </p>
        )}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {formFields.map(([key, label, type]) => (
            <label
              key={key}
              className={key === "alamat_lengkap" ? "md:col-span-2" : ""}
            >
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              {key === "password" && (
                <span className="mb-2 block text-xs text-color5/55">
                  Kosongkan jika tidak ingin mengubah password.
                </span>
              )}
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
                  required={
                    key === "nama" || key === "pemilik" || key === "no_wa"
                  }
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
            disabled={!formChanged || savingForm}
            onClick={() => {
              setDraftForm(savedForm);
              setFormError("");
              setFormSuccess("");
            }}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!formChanged || savingForm}
            onClick={() => void saveForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} />{" "}
            {savingForm ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </section>
      <CategorySelector
        options={categoryOptions}
        selectedIds={initialCategoryIds}
        umkmId={umkmId}
      />
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
        {imageSuccess && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {imageSuccess}
          </p>
        )}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {imageSlots.map((slot) => (
            <article key={slot} className="rounded-2xl border border-color4/80 p-4">
              <p className="font-bold">{slot}</p>
              <button
                type="button"
                disabled={!displayImages[slot]}
                onClick={() =>
                  setPreviewImage(displayImages[slot] ?? null)
                }
                className="mt-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-color4/65 text-sm font-semibold text-color5/50 disabled:cursor-default"
              >
                {displayImages[slot] ? (
                  <img
                    src={displayImages[slot].url}
                    alt={slot}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    <Camera size={19} /> Gambar
                  </span>
                )}
              </button>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-color4 px-3 py-2 text-sm font-bold text-color1 transition hover:bg-color4/45">
                <span className="flex items-center gap-2">
                  <Upload size={16} />{" "}
                  {displayImages[slot] ? "Ganti Gambar" : "Upload Gambar"}
                </span>
                <span className="mt-1 text-[11px] font-medium text-color5/55">
                  Maks. 2 MB • JPEG/JPG/PNG
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  disabled={savingImages}
                  onChange={(event) => handleUpload(event, slot)}
                />
              </label>
              {displayImages[slot] && (
                <button
                  type="button"
                  disabled={savingImages}
                  onClick={() => void removeImage(slot)}
                  className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Hapus Gambar
                </button>
              )}
            </article>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!imagesChanged || savingImages}
            onClick={cancelImages}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!imagesChanged || savingImages}
            onClick={() => void saveImages()}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} />{" "}
            {savingImages ? "Menyimpan..." : "Simpan Gambar"}
          </button>
        </div>
      </section>
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preview gambar UMKM"
          className="fixed inset-0 z-50 flex items-center justify-center bg-color5/75 p-5"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-color3 text-color5 shadow-lg"
              aria-label="Tutup preview"
            >
              <X size={20} />
            </button>
            <a
              href={previewImage.url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-color3 px-4 py-2 text-sm font-bold text-color1"
            >
              <ExternalLink size={16} /> Buka gambar
            </a>
          </div>
        </div>
      )}
      <section className="mt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Produk UMKM</h2>
            <p className="mt-1 text-sm text-color5/60">
              Kelola daftar produk yang ditampilkan pada usaha ini.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={addingProduct}
              onClick={() => void handleAddProduct()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-color1 px-4 font-bold text-white disabled:opacity-40"
            >
              <Plus size={18} />{" "}
              {addingProduct ? "Menambahkan..." : "Tambah Produk"}
            </button>
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
        </div>
        {productError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {productError}
          </p>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductEditor
              key={product.id}
              umkmId={umkmId}
              product={product}
              onDeleted={() => {
                setProductPage(1);
                router.refresh();
              }}
              onSaved={() => router.refresh()}
            />
          ))}
        </div>
        {!visibleProducts.length && (
          <p className="mt-5 rounded-2xl border border-color4 bg-color3 py-12 text-center text-sm text-color5/60">
            {products.length
              ? "Produk tidak ditemukan."
              : "Belum ada produk. Klik Tambah Produk untuk memulai."}
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
