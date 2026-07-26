import UmkmManagement from "@/components/UmkmManagement";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const slotLabels: Record<string, string> = {
  logo: "Logo UMKM",
  gambar_1: "Gambar UMKM 1",
  gambar_2: "Gambar UMKM 2",
  gambar_3: "Gambar UMKM 3",
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/masuk");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "umkm") redirect("/admin");

  const { data: umkmResult } = await supabase
    .from("umkm")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!umkmResult) redirect("/admin");

  const id = String(umkmResult.id);
  const { user_id, slug, created_at, updated_at, id: _id, ...form } = umkmResult;
  const initialForm = Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value ?? ""]),
  );

  const [
    productsResult,
    categoriesResult,
    selectedCategoriesResult,
    imagesResult,
  ] = await Promise.all([
    supabase
      .from("produk")
      .select("id,nama,deskripsi,harga")
      .eq("id_umkm", id)
      .order("id"),
    supabase.from("kategori").select("id,nama").order("nama"),
    supabase.from("umkm_kategori").select("kategori_id").eq("umkm_id", id),
    supabase.from("umkm_images").select("slot,storage_path").eq("umkm_id", id),
  ]);

  const initialProducts = (productsResult.data ?? []).map((product) => ({
    id: product.id,
    name: product.nama,
    description: product.deskripsi ?? "",
    price: String(Math.round(Number(product.harga))),
  }));

  const initialImages: Record<string, { url: string; name: string }> = {};
  for (const image of imagesResult.data ?? []) {
    const label = slotLabels[image.slot];
    if (!label) continue;
    const {
      data: { publicUrl },
    } = supabase.storage.from("umkm-media").getPublicUrl(image.storage_path);
    initialImages[label] = {
      url: publicUrl,
      name: image.storage_path.split("/").pop() ?? image.slot,
    };
  }

  return (
    <UmkmManagement
      umkmId={id}
      initialForm={initialForm}
      initialProducts={initialProducts}
      initialImages={initialImages}
      categoryOptions={(categoriesResult.data ?? []).map((item) => ({
        value: String(item.id),
        label: item.nama,
      }))}
      initialCategoryIds={(selectedCategoriesResult.data ?? []).map((item) =>
        String(item.kategori_id),
      )}
      showBackLink={false}
    />
  );
}
