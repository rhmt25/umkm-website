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
import { FORM_LIMITS, characterHint } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";
import ConfirmModal from "@/components/ConfirmModal";
import PasswordInput from "@/components/PasswordInput";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  priceMax?: string;
  isRange?: boolean;
};
type UploadedImage = { name: string; url: string };

const formFields = [
  ["nama", "Nama UMKM", "text", FORM_LIMITS.umkmName, undefined, true],
  ["pemilik", "Nama Pemilik", "text", FORM_LIMITS.personName, undefined, true],
  ["rt", "RT", "text", FORM_LIMITS.rtRw, "Hanya angka", true],
  ["rw", "RW", "text", FORM_LIMITS.rtRw, "Hanya angka", true],
  ["dukuh", "Dukuh", "text", FORM_LIMITS.villageName, undefined, true],
  ["dusun", "Dusun", "text", FORM_LIMITS.villageName, undefined, true],
  ["alamat_lengkap", "Alamat Lengkap", "text", FORM_LIMITS.address, undefined, true],
  ["no_wa", "Nomor WhatsApp", "tel", FORM_LIMITS.phone, "Hanya angka, +, spasi, atau tanda -", true],
  ["instagram", "Instagram", "text", FORM_LIMITS.socialHandle, undefined, false],
  ["tiktok", "TikTok", "text", FORM_LIMITS.socialHandle, undefined, false],
  ["facebook", "Facebook", "text", FORM_LIMITS.socialHandle, undefined, false],
  ["shopee", "Shopee", "url", FORM_LIMITS.url, undefined, false],
  ["tokopedia", "Tokopedia", "url", FORM_LIMITS.url, undefined, false],
  ["google_maps", "Google Maps", "url", FORM_LIMITS.url, undefined, false],
  ["keunggulan1", "Keunggulan Produk 1", "text", FORM_LIMITS.advantage, undefined, false],
  ["keunggulan2", "Keunggulan Produk 2", "text", FORM_LIMITS.advantage, undefined, false],
  ["keunggulan3", "Keunggulan Produk 3", "text", FORM_LIMITS.advantage, undefined, false],
  ["keunggulan4", "Keunggulan Produk 4", "text", FORM_LIMITS.advantage, undefined, false],
  ["password", "Password", "password", FORM_LIMITS.password, undefined, false],
] as const;

type UmkmForm = Record<(typeof formFields)[number][0], string>;

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
  const { showToast } = useToast();
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState(selectedIds);
  const [loading, setLoading] = useState(false);
  const canAdd = Boolean(category && !selectedCategories.includes(category.value));

  useEffect(() => {
    setSelectedCategories(selectedIds);
  }, [selectedIds]);

  async function persistCategories(next: string[]) {
    setLoading(true);
    try {
      const result = await updateUmkmCategories(
        Number(umkmId),
        next.map(Number),
      );
      setLoading(false);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      showToast("Kategori berhasil diperbarui.", "success");
      router.refresh();
    } catch (err) {
      setLoading(false);
      showToast("Penyebab: Gagal menyimpan kategori karena gangguan sistem.\nSolusi: Silakan coba beberapa saat lagi.", "error");
      console.error("persistCategories error:", err);
    }
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
          className="h-12 rounded-xl bg-color1 px-5 font-bold text-white transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tambah
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {selectedCategories.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-color4 px-3.5 py-2 text-sm font-semibold text-color5"
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { showToast } = useToast();
  const changed = JSON.stringify(saved) !== JSON.stringify(draft);

  useEffect(() => {
    setSaved(product);
    setDraft(product);
  }, [product]);

  const update = (key: keyof Product, value: string | boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const nameError = !draft.name.trim();

  async function save() {
    if (nameError) {
      showToast(
        "Gagal Memperbarui Produk\nPenyebab: Nama produk tidak boleh kosong.\nSolusi: Masukkan nama produk terlebih dahulu sebelum menyimpan.",
        "error"
      );
      return;
    }

    if (draft.isRange) {
      const minVal = Number(draft.price.replace(/\D/g, "") || "0");
      const maxVal = Number((draft.priceMax ?? "").replace(/\D/g, "") || "0");
      if (maxVal < minVal) {
        showToast(
          "Gagal Memperbarui Produk\nPenyebab: Batas maksimal harga tidak boleh lebih kecil dari batas minimal harga.\nSolusi: Pastikan nominal batas maksimal lebih besar atau sama dengan batas minimal.",
          "error"
        );
        return;
      }
    }

    setSaving(true);
    try {
      const result = await updateProduct(Number(umkmId), product.id, {
        name: draft.name,
        description: draft.description,
        price: draft.price,
        priceMax: draft.priceMax,
        isRange: draft.isRange,
      });
      setSaving(false);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      setSaved(draft);
      showToast("Produk berhasil diperbarui.", "success", "Berhasil Memperbarui Produk");
      onSaved();
    } catch (err) {
      setSaving(false);
      showToast("Gagal Memperbarui Produk\nPenyebab: Terjadi gangguan jaringan.\nSolusi: Silakan coba beberapa saat lagi.", "error");
      console.error("save product error:", err);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      const result = await deleteProduct(Number(umkmId), product.id);
      setDeleting(false);
      setShowConfirmDelete(false);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      onDeleted();
      showToast("Produk berhasil dihapus.", "success", "Berhasil Menghapus Produk");
    } catch (err) {
      setDeleting(false);
      setShowConfirmDelete(false);
      showToast("Gagal Menghapus Produk\nPenyebab: Gangguan jaringan.\nSolusi: Silakan coba beberapa saat lagi.", "error");
      console.error("remove product error:", err);
    }
  }

  return (
    <article className="rounded-2xl border border-color4/80 bg-color3 p-4 shadow-sm flex flex-col justify-between">
      <div className="space-y-3">
        <h3 className="font-bold text-color1">Edit Produk</h3>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-color5">
            Nama Produk <span className="text-red-500">*</span>
          </span>
          <input
            value={draft.name}
            maxLength={FORM_LIMITS.productName}
            onChange={(event) => update("name", event.target.value)}
            className={`h-10 w-full rounded-lg border px-3 outline-none transition ${
              nameError
                ? "border-red-500 bg-red-50/20 focus:border-red-600"
                : "border-color4 focus:border-color1"
            }`}
          />
          {nameError ? (
            <span className="mt-1 block text-xs font-semibold text-red-600">Nama produk wajib diisi</span>
          ) : (
            <span className="mt-1 block text-xs text-color5/55">{characterHint(FORM_LIMITS.productName)}</span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-color5">Deskripsi</span>
          <textarea
            value={draft.description}
            maxLength={FORM_LIMITS.productDescription}
            onChange={(event) => update("description", event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-color4 px-3 py-2 text-sm outline-none focus:border-color1"
          />
          <span className="mt-1 block text-xs text-color5/55">{characterHint(FORM_LIMITS.productDescription)}</span>
        </label>

        {/* Price Type Toggle Switch */}
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-color5">Tipe Harga</span>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-color4/40 p-1 border border-color4/60">
            <button
              type="button"
              onClick={() => update("isRange", false)}
              className={`rounded-lg py-1.5 text-xs font-bold transition ${
                !draft.isRange
                  ? "bg-color1 text-white shadow-xs"
                  : "text-color5/70 hover:text-color5"
              }`}
            >
              Harga Pasti
            </button>
            <button
              type="button"
              onClick={() => update("isRange", true)}
              className={`rounded-lg py-1.5 text-xs font-bold transition ${
                draft.isRange
                  ? "bg-color1 text-white shadow-xs"
                  : "text-color5/70 hover:text-color5"
              }`}
            >
              Rentang Harga
            </button>
          </div>
        </div>

        {!draft.isRange ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-color5">Harga (Rp)</span>
            <input
              value={draft.price}
              onChange={(event) =>
                update("price", event.target.value.replace(/\D/g, "").slice(0, FORM_LIMITS.productPriceDigits))
              }
              maxLength={FORM_LIMITS.productPriceDigits}
              inputMode="numeric"
              placeholder="Contoh: 15000"
              className="h-10 w-full rounded-lg border border-color4 px-3 outline-none focus:border-color1"
            />
            <span className="mt-1 block text-xs text-color5/55">Hanya angka • Maksimal {FORM_LIMITS.productPriceDigits} digit</span>
          </label>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-color5">Batas Minimal (Rp)</span>
              <input
                value={draft.price}
                onChange={(event) =>
                  update("price", event.target.value.replace(/\D/g, "").slice(0, FORM_LIMITS.productPriceDigits))
                }
                maxLength={FORM_LIMITS.productPriceDigits}
                inputMode="numeric"
                placeholder="Contoh: 1000"
                className="h-10 w-full rounded-lg border border-color4 px-3 text-sm outline-none focus:border-color1"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-color5">Batas Maksimal (Rp)</span>
              <input
                value={draft.priceMax ?? ""}
                onChange={(event) =>
                  update("priceMax", event.target.value.replace(/\D/g, "").slice(0, FORM_LIMITS.productPriceDigits))
                }
                maxLength={FORM_LIMITS.productPriceDigits}
                inputMode="numeric"
                placeholder="Contoh: 10000"
                className="h-10 w-full rounded-lg border border-color4 px-3 text-sm outline-none focus:border-color1"
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-color4/60">
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
          className="rounded-lg bg-color1 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          disabled={saving || deleting}
          onClick={() => setShowConfirmDelete(true)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 size={15} /> {deleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus produk "${draft.name}"?`}
        confirmLabel="Hapus Produk"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleting}
        onConfirm={() => void remove()}
        onClose={() => setShowConfirmDelete(false)}
      />
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
  const { showToast } = useToast();
  const form = { ...defaultForm, ...initialForm, password: "" };
  const [savedForm, setSavedForm] = useState(form);
  const [draftForm, setDraftForm] = useState(form);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  const [savedImages, setSavedImages] = useState<Record<string, UploadedImage>>(initialImages);
  const [displayImages, setDisplayImages] = useState<Record<string, UploadedImage>>(initialImages);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [deleteImageTarget, setDeleteImageTarget] = useState<string | null>(null);

  const [savingForm, setSavingForm] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);

  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [addingProduct, setAddingProduct] = useState(false);

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

  // Debounce product search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setProductPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formChanged = JSON.stringify(savedForm) !== JSON.stringify(draftForm);
  const imagesChanged = Object.keys(pendingFiles).length > 0;

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          product.description.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [products, debouncedSearch],
  );
  const totalProductPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE,
  );
  const visibleProducts = filteredProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE,
  );

  function updateForm(key: keyof UmkmForm, value: string) {
    if (key === "rt" || key === "rw") value = value.replace(/\D/g, "");
    if (key === "no_wa") value = value.replace(/[^\d+\s()-]/g, "");

    setDraftForm((current) => ({ ...current, [key]: value }));

    // Reset invalid error border as soon as user types in required field
    if (value.trim()) {
      setInvalidFields((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function saveForm() {
    // Validate required fields
    const missing: Record<string, boolean> = {};
    if (!draftForm.nama.trim()) missing.nama = true;
    if (!draftForm.pemilik.trim()) missing.pemilik = true;
    if (!draftForm.rt.trim()) missing.rt = true;
    if (!draftForm.rw.trim()) missing.rw = true;
    if (!draftForm.dukuh.trim()) missing.dukuh = true;
    if (!draftForm.dusun.trim()) missing.dusun = true;
    if (!draftForm.alamat_lengkap.trim()) missing.alamat_lengkap = true;
    if (!draftForm.no_wa.trim()) missing.no_wa = true;

    if (Object.keys(missing).length > 0) {
      setInvalidFields(missing);
      showToast(
        "Gagal Memperbarui Profil\nPenyebab: Kolom wajib (* Nama, Pemilik, RT, RW, Dukuh, Dusun, Alamat Lengkap, No. WA) belum terisi.\nSolusi: Lengkapi kolom bertanda bintang merah sebelum menyimpan.",
        "error"
      );
      return;
    }

    setSavingForm(true);
    try {
      const result = await updateUmkmProfile(Number(umkmId), draftForm);
      setSavingForm(false);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      const nextForm = { ...draftForm, password: "" };
      setSavedForm(nextForm);
      setDraftForm(nextForm);
      setInvalidFields({});
      showToast("Profil UMKM berhasil disimpan.", "success");
      router.refresh();
    } catch (err) {
      setSavingForm(false);
      showToast(
        "Penyebab: Terjadi masalah koneksi saat menyimpan profil UMKM.\nSolusi: Silakan periksa jaringan internet Anda dan coba lagi.",
        "error"
      );
      console.error("saveForm error:", err);
    }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>, slot: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      showToast(
        "Penyebab: Gambar yang dipilih memiliki format yang tidak didukung atau ukurannya melebihi 2 MB.\nSolusi: Pilih foto berformat JPEG/PNG dengan ukuran di bawah 2 MB.",
        "error"
      );
      event.target.value = "";
      return;
    }
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
    try {
      for (const [slotLabel, file] of entries) {
        const slot = slotKeys[slotLabel as (typeof imageSlots)[number]];
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadUmkmImage(Number(umkmId), slot, formData);
        if (result.error) {
          showToast(result.error, "error");
          setSavingImages(false);
          return;
        }
      }

      setSavingImages(false);
      setPendingFiles({});
      showToast("Gambar UMKM berhasil disimpan.", "success");
      router.refresh();
    } catch (err) {
      setSavingImages(false);
      showToast(
        "Penyebab: Gagal mengunggah foto karena koneksi internet terputus.\nSolusi: Periksa jaringan Anda dan coba unggah lagi.",
        "error"
      );
      console.error("saveImages error:", err);
    }
  }

  function cancelImages() {
    for (const [slot, image] of Object.entries(displayImages)) {
      if (pendingFiles[slot] && image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }
    }
    setDisplayImages({ ...savedImages });
    setPendingFiles({});
  }

  async function handleConfirmDeleteImage() {
    if (!deleteImageTarget) return;
    const slotLabel = deleteImageTarget;
    const slot = slotKeys[slotLabel as (typeof imageSlots)[number]];

    setSavingImages(true);
    try {
      const result = await deleteUmkmImage(Number(umkmId), slot);
      setSavingImages(false);
      setDeleteImageTarget(null);

      if (result.error) {
        showToast(result.error, "error");
        return;
      }

      // Real-time frontend update
      setDisplayImages((prev) => {
        const next = { ...prev };
        delete next[slotLabel];
        return next;
      });
      setSavedImages((prev) => {
        const next = { ...prev };
        delete next[slotLabel];
        return next;
      });

      showToast(`Gambar "${slotLabel}" berhasil dihapus.`, "success");
      router.refresh();
    } catch (err) {
      setSavingImages(false);
      setDeleteImageTarget(null);
      showToast(
        "Penyebab: Gagal menghapus gambar karena gangguan sistem.\nSolusi: Silakan coba lagi.",
        "error"
      );
      console.error("removeImage error:", err);
    }
  }

  async function handleAddProduct() {
    setAddingProduct(true);
    try {
      const result = await createProduct(Number(umkmId), {
        name: "Produk Baru",
        description: "",
        price: "0",
        priceMax: "",
        isRange: false,
      });
      setAddingProduct(false);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }

      // Real-time update list produk di frontend
      if (result.id) {
        setProducts((prev) => [
          { id: result.id!, name: "Produk Baru", description: "", price: "0", priceMax: "", isRange: false },
          ...prev,
        ]);
      }
      setProductPage(1);
      showToast("Produk baru berhasil ditambahkan.", "success");
      router.refresh();
    } catch (err) {
      setAddingProduct(false);
      showToast(
        "Penyebab: Terjadi kesalahan server saat membuat produk baru.\nSolusi: Silakan coba tambah produk beberapa saat lagi.",
        "error"
      );
      console.error("handleAddProduct error:", err);
    }
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
          Manajemen UMKM
        </p>
        <h1 className="mt-1 text-3xl font-bold">{savedForm.nama || "UMKM"}</h1>
        <p className="mt-2 text-color5/65">
          Perbarui profil usaha, gambar, dan produk yang dijual.
        </p>
      </div>

      {/* Profil UMKM Form */}
      <section className="mt-8 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold">Data UMKM</h2>
        <p className="mt-1 text-sm text-color5/65">
          Kolom bertanda bintang merah (<span className="text-red-500 font-bold">*</span>) wajib diisi.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {formFields.map(([key, label, type, maxLength, format, isRequired]) => {
            const isError = Boolean(invalidFields[key]);

            if (key === "password") {
              return (
                <div key={key} className="md:col-span-1">
                  <PasswordInput
                    label={label}
                    isRequired={isRequired}
                    value={draftForm[key]}
                    maxLength={maxLength}
                    onChange={(event) => updateForm(key, event.target.value)}
                    error={isError}
                    hint="Kosongkan jika tidak ingin mengubah password."
                  />
                </div>
              );
            }

            return (
              <label
                key={key}
                className={key === "alamat_lengkap" ? "md:col-span-2 block" : "block"}
              >
                <span className="mb-2 block text-sm font-semibold text-color5">
                  {label} {isRequired && <span className="text-red-500">*</span>}
                </span>
                {key === "alamat_lengkap" ? (
                  <textarea
                    value={draftForm[key]}
                    maxLength={maxLength}
                    onChange={(event) => updateForm(key, event.target.value)}
                    rows={3}
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                      isError
                        ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-500/15"
                        : "border-color4 focus:border-color1 focus:ring-2 focus:ring-color1/15"
                    }`}
                  />
                ) : (
                  <input
                    type={type}
                    value={draftForm[key]}
                    maxLength={maxLength}
                    inputMode={key === "rt" || key === "rw" ? "numeric" : undefined}
                    onChange={(event) => updateForm(key, event.target.value)}
                    className={`h-12 w-full rounded-xl border px-4 outline-none transition ${
                      isError
                        ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-500/15"
                        : "border-color4 focus:border-color1 focus:ring-2 focus:ring-color1/15"
                    }`}
                  />
                )}
                {isError ? (
                  <span className="mt-1 block text-xs font-semibold text-red-600">
                    {label} wajib diisi.
                  </span>
                ) : (
                  <span className="mt-2 block text-xs text-color5/55">
                    {characterHint(maxLength, format)}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-color4 pt-6">
          <button
            type="button"
            disabled={!formChanged || savingForm}
            onClick={() => {
              setDraftForm(savedForm);
              setInvalidFields({});
            }}
            className="rounded-xl border border-color4 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!formChanged || savingForm}
            onClick={() => void saveForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} />
            {savingForm ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </section>

      {/* Category Selector */}
      <CategorySelector
        options={categoryOptions}
        selectedIds={initialCategoryIds}
        umkmId={umkmId}
      />

      {/* Logo & Gambar UMKM */}
      <section className="mt-7 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <ImagePlus className="text-color1" size={22} />
          <h2 className="text-xl font-bold">Logo dan Gambar UMKM</h2>
        </div>
        <p className="mt-2 text-sm text-color5/60">
          Unggah atau ganti logo serta gambar usaha. Maksimal 2 MB, format JPEG/JPG/PNG.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {imageSlots.map((slot) => (
            <article key={slot} className="rounded-2xl border border-color4/80 p-4 flex flex-col justify-between">
              <div>
                <p className="font-bold">{slot}</p>
                <button
                  type="button"
                  disabled={!displayImages[slot]}
                  onClick={() => setPreviewImage(displayImages[slot] ?? null)}
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
              </div>

              <div className="mt-3 space-y-2">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-color4 px-3 py-2 text-sm font-bold text-color1 transition hover:bg-color4/45">
                  <span className="flex items-center gap-2">
                    <Upload size={16} />
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
                    onClick={() => setDeleteImageTarget(slot)}
                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    Hapus Gambar
                  </button>
                )}
              </div>
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
            className="inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={18} />
            {savingImages ? "Menyimpan..." : "Simpan Gambar"}
          </button>
        </div>
      </section>

      {/* Lightbox Preview Gambar */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preview gambar UMKM"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-color5/75 p-5 backdrop-blur-xs"
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
              className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full bg-color3 text-color5 shadow-lg transition hover:bg-color4"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal Hapus Gambar */}
      <ConfirmModal
        isOpen={Boolean(deleteImageTarget)}
        title="Hapus Gambar?"
        message={`Apakah Anda yakin ingin menghapus ${deleteImageTarget}?`}
        confirmLabel="Hapus Gambar"
        cancelLabel="Batal"
        variant="danger"
        isLoading={savingImages}
        onConfirm={() => void handleConfirmDeleteImage()}
        onClose={() => setDeleteImageTarget(null)}
      />

      {/* Kelola Produk UMKM */}
      <section className="mt-7 rounded-2xl border border-color4/80 bg-color3 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Daftar Produk</h2>
            <p className="mt-1 text-sm text-color5/60">
              Kelola katalog barang atau jasa yang ditawarkan oleh UMKM ini.
            </p>
          </div>
          <button
            type="button"
            disabled={addingProduct}
            onClick={() => void handleAddProduct()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white transition hover:bg-color1/90 disabled:opacity-50"
          >
            <Plus size={18} /> {addingProduct ? "Menambahkan..." : "Tambah Produk Baru"}
          </button>
        </div>

        {/* Debounced search filter produk */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="h-11 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none transition focus:border-color1"
          />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductEditor
              key={product.id}
              umkmId={umkmId}
              product={product}
              onSaved={() => router.refresh()}
              onDeleted={() => {
                setProducts((current) =>
                  current.filter((item) => item.id !== product.id),
                );
                router.refresh();
              }}
            />
          ))}
        </div>

        {!visibleProducts.length && (
          <p className="py-12 text-center text-sm font-medium text-color5/60">
            {search ? "Produk tidak ditemukan." : "Belum ada produk yang ditambahkan."}
          </p>
        )}

        {totalProductPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={productPage === 1}
              onClick={() => setProductPage((p) => p - 1)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-color4 bg-color3 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setProductPage(n)}
                className={`h-9 w-9 rounded-lg font-bold text-sm ${
                  productPage === n ? "bg-color1 text-white" : "border border-color4 bg-color3"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={productPage === totalProductPages}
              onClick={() => setProductPage((p) => p + 1)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-color4 bg-color3 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
