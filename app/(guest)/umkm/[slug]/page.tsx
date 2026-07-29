import UmkmDetail from "@/components/UmkmDetail";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: umkm, error: umkmError } = await supabase
    .from("umkm")
    .select(
      "id,slug,nama,pemilik,rt,rw,dukuh,dusun,alamat_lengkap,no_wa,instagram,tiktok,facebook,shopee,tokopedia,google_maps,keunggulan1,keunggulan2,keunggulan3,keunggulan4",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (umkmError || !umkm) {
    notFound();
  }

  const [imagesResult, productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("umkm_images")
      .select("slot,storage_path,alt_text")
      .eq("umkm_id", umkm.id),
    supabase
      .from("produk")
      .select("id,nama,deskripsi,harga")
      .eq("id_umkm", umkm.id)
      .order("id", { ascending: true }),
    supabase
      .from("umkm_kategori")
      .select("kategori(nama)")
      .eq("umkm_id", umkm.id),
  ]);

  const logoImage = imagesResult.data?.find((item) => item.slot === "logo");
  const logoUrl = logoImage?.storage_path
    ? supabase.storage.from("umkm-media").getPublicUrl(logoImage.storage_path).data.publicUrl
    : "";

  const galleryImages = [
    { id: "gambar_1", label: "Foto UMKM 1" },
    { id: "gambar_2", label: "Foto UMKM 2" },
    { id: "gambar_3", label: "Foto UMKM 3" },
  ].map((item) => {
    const source = imagesResult.data?.find((image) => image.slot === item.id);
    return {
      id: item.id,
      label: item.label,
      url: source?.storage_path
        ? supabase.storage.from("umkm-media").getPublicUrl(source.storage_path).data.publicUrl
        : "",
      alt: source?.alt_text ?? item.label,
    };
  });

  const products = (productsResult.data ?? []).map((product) => ({
    id: product.id,
    name: product.nama,
    description: product.deskripsi ?? "",
    price: product.harga != null ? `Rp ${Number(product.harga).toLocaleString("id-ID", { maximumFractionDigits: 0 })}` : "Rp 0",
  }));

  type CategoryRecord = {
    kategori?: { nama?: string }[] | { nama?: string } | null;
  };

  const categories = ((categoriesResult.data ?? []) as CategoryRecord[])
    .map((record) => {
      const kategori = record.kategori;
      return Array.isArray(kategori) ? kategori[0]?.nama : kategori?.nama;
    })
    .filter((name): name is string => Boolean(name));

  const whatsappUrl = umkm.no_wa
    ? `https://wa.me/${umkm.no_wa.replace(/[^0-9]/g, "").replace(/^0/, "62")}`
    : "";

  return (
    <UmkmDetail
      name={umkm.nama}
      owner={umkm.pemilik}
      categories={categories.length > 0 ? categories : ["UMKM Lokal"]}
      address={umkm.alamat_lengkap ?? "Desa Masaran"}
      phone={umkm.no_wa ?? ""
      }
      whatsappUrl={whatsappUrl}
      links={{
        google_maps: umkm.google_maps ?? "",
        instagram: umkm.instagram ?? "",
        facebook: umkm.facebook ?? "",
        tiktok: umkm.tiktok ?? "",
        shopee: umkm.shopee ?? "",
        tokopedia: umkm.tokopedia ?? "",
      }}
      logoUrl={logoUrl}
      galleryImages={galleryImages}
      features={[umkm.keunggulan1, umkm.keunggulan2, umkm.keunggulan3, umkm.keunggulan4].filter((item): item is string => Boolean(item))}
      products={products}
    />
  );
}
