import CategoryManager from "@/components/CategoryManager";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("kategori").select("id, nama").order("nama");
  const categories = (data ?? []).map((item) => ({ id: item.id, name: item.nama }));
  return <CategoryManager initialCategories={categories} />;
}
