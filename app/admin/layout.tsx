import AdminSidebar from "@/components/AdminSidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/masuk");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "umkm")) {
    redirect("/masuk");
  }

  const { data: umkm } = profile.role === "umkm"
    ? await supabase.from("umkm").select("id").eq("user_id", user.id).single()
    : { data: null };

  if (profile.role === "umkm" && !umkm) redirect("/masuk");

  return (
    <div className="min-h-screen bg-color2/45 text-color5 md:flex">
      <AdminSidebar role={profile.role} umkmId={umkm?.id} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
