import GuestUmkmDirectory from "@/components/GuestUmkmDirectory";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const [umkmResult, kategoriResult] = await Promise.all([
    supabase
      .from("umkm")
      .select("id,slug,nama,pemilik,dusun")
      .order("nama", { ascending: true }),
    supabase.from("kategori").select("nama").order("nama"),
  ]);

  const umkms = umkmResult.data ?? [];
  const umkmIds = umkms.map((item) => item.id);

  const [logoResult, umkmKategoriResult] = umkmIds.length > 0
    ? await Promise.all([
        supabase
          .from("umkm_images")
          .select("umkm_id,storage_path")
          .in("umkm_id", umkmIds)
          .eq("slot", "logo"),
        supabase
          .from("umkm_kategori")
          .select("umkm_id,kategori(nama)")
          .in("umkm_id", umkmIds),
      ])
    : [{ data: [] }, { data: [] }];

  const logoMap = new Map<number, string>();
  for (const image of logoResult.data ?? []) {
    const publicUrl = supabase.storage.from("umkm-media").getPublicUrl(image.storage_path).data.publicUrl;
    if (publicUrl) {
      logoMap.set(image.umkm_id, publicUrl);
    }
  }

  type UmkmKategoriRecord = {
    umkm_id: number;
    kategori?: { nama?: string }[] | { nama?: string } | null;
  };

  const categoryMap = new Map<number, string>();
  for (const record of (umkmKategoriResult.data ?? []) as UmkmKategoriRecord[]) {
    const kategori = record.kategori;
    const categoryName = Array.isArray(kategori) ? kategori[0]?.nama : kategori?.nama;
    if (record.umkm_id && categoryName && !categoryMap.has(record.umkm_id)) {
      categoryMap.set(record.umkm_id, categoryName);
    }
  }

  const initialUmkms = umkms.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.nama,
    owner: item.pemilik,
    category: categoryMap.get(item.id) ?? "UMKM",
    location: item.dusun ? `Dusun ${item.dusun}` : "Desa Masaran",
    image: logoMap.get(item.id),
  }));

  const categories = (kategoriResult.data ?? []).map((item) => item.nama).filter(Boolean);
  const dusuns = Array.from(new Set(initialUmkms.map((item) => item.location))).sort();

  return <GuestUmkmDirectory initialUmkms={initialUmkms} categories={categories} dusuns={dusuns} />;
}
