import AdminUmkmList from "@/components/AdminUmkmList";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function Page() {
  return <AdminUmkmListPage />;
}

async function AdminUmkmListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/masuk");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    if (profile?.role === "umkm") {
      const { data: umkm } = await supabase
        .from("umkm")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (umkm?.id) redirect(`/admin/umkm/${umkm.id}`);
    }
    redirect("/admin");
  }

  return <AdminUmkmList />;
}
