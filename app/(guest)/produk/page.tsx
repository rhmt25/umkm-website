import GuestProductDirectory from "@/components/GuestProductDirectory";
import { createClient } from "@/lib/supabase/server";

function formatPrice(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return `Rp ${parsed.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

type ProductRow = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number | string | null;
  umkm?: { id: number; slug: string; nama: string; dusun: string | null } | null;
};

export default async function Page() {
  const supabase = await createClient();

  const productsResult = await supabase
    .from("produk")
    .select("id,nama,deskripsi,harga,umkm(id,slug,nama,dusun)")
    .order("id", { ascending: true });

  const products = (productsResult.data ?? []).map((row) => {
    const rawUmkm = (row as any).umkm;
    const umkm = Array.isArray(rawUmkm) ? rawUmkm[0] : rawUmkm;

    return {
      id: row.id,
      nama: row.nama,
      deskripsi: row.deskripsi ?? null,
      harga: row.harga ?? null,
      umkm: umkm
        ? {
            id: umkm.id,
            slug: umkm.slug,
            nama: umkm.nama,
            dusun: umkm.dusun ?? null,
          }
        : null,
    } as ProductRow;
  });

  const umkmIds = Array.from(
    new Set(products.map((item) => item.umkm?.id).filter((id): id is number => typeof id === "number")),
  );

  const kategoriResult = umkmIds.length > 0
    ? await supabase
        .from("umkm_kategori")
        .select("umkm_id,kategori(nama)")
        .in("umkm_id", umkmIds)
    : { data: [] };

  type CategoryRecord = {
    umkm_id: number;
    kategori?: { nama?: string }[] | { nama?: string } | null;
  };

  const categoryMap = new Map<number, string>();
  for (const record of (kategoriResult.data ?? []) as CategoryRecord[]) {
    const kategori = record.kategori;
    const name = Array.isArray(kategori) ? kategori[0]?.nama : kategori?.nama;

    if (record.umkm_id && name && !categoryMap.has(record.umkm_id)) {
      categoryMap.set(record.umkm_id, name);
    }
  }

  const initialProducts = products.map((item) => ({
    id: item.id,
    name: item.nama,
    description: item.deskripsi ?? "",
    umkmName: item.umkm?.nama ?? "UMKM",
    umkmSlug: item.umkm?.slug ?? "",
    category: categoryMap.get(item.umkm?.id ?? 0) ?? "Produk UMKM",
    dusun: item.umkm?.dusun ?? "",
    price: formatPrice(item.harga),
  }));

  const categories = Array.from(new Set(initialProducts.map((item) => item.category))).sort();
  const dusuns = Array.from(new Set(initialProducts.map((item) => item.dusun).filter(Boolean))).sort();

  return <GuestProductDirectory initialProducts={initialProducts} categories={categories} dusuns={dusuns} />;
}
