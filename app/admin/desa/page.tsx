import DesaManagement, {
  type GalleryItem,
  type VillageForm,
} from "@/components/DesaManagement";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const emptyForm: VillageForm = {
  address: "",
  phone: "",
  email: "",
  description: "",
  googleMaps: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  username: "",
  password: "",
};

function buildInitialGallery(
  sampulBerandaUrl: string,
  sampulTentangUrl: string,
  balaiUrl: string,
  galleryImages: { urutan: number; url: string; description: string }[],
): GalleryItem[] {
  const galleryByUrutan = new Map(
    galleryImages.map((item) => [item.urutan, item]),
  );

  return [
    {
      id: "sampul-beranda",
      label: "Foto Sampul Beranda",
      image: sampulBerandaUrl,
      description: "",
    },
    {
      id: "sampul-tentang",
      label: "Foto Sampul Tentang Desa",
      image: sampulTentangUrl,
      description: "",
    },
    {
      id: "balai",
      label: "Gambar Balai Desa",
      image: balaiUrl,
      description: "",
    },
    ...Array.from({ length: 6 }, (_, index) => {
      const urutan = index + 1;
      const item = galleryByUrutan.get(urutan);
      return {
        id: `gambar-${urutan}`,
        label: `Gambar ${urutan}`,
        image: item?.url ?? "",
        description: item?.description ?? "",
      };
    }),
  ];
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/masuk");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin");

  const [desaResult, galleryResult] = await Promise.all([
    supabase.from("desa").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("desa_images")
      .select("urutan,storage_path,deskripsi")
      .eq("desa_id", 1)
      .order("urutan"),
  ]);

  const desa = desaResult.data;
  const initialForm: VillageForm = desa
    ? {
        address: desa.alamat ?? "",
        phone: desa.no_telepon ?? "",
        email: desa.email ?? "",
        description: desa.tentang ?? "",
        googleMaps: desa.google_maps ?? "",
        facebook: desa.facebook ?? "",
        instagram: desa.instagram ?? "",
        tiktok: desa.tiktok ?? "",
        youtube: desa.youtube ?? "",
        username: profile?.username ?? "",
        password: "",
      }
    : { ...emptyForm, username: profile?.username ?? "", password: "" };

  const sampulBerandaUrl = desa?.sampul_beranda_path
    ? supabase.storage.from("umkm-media").getPublicUrl(desa.sampul_beranda_path)
        .data.publicUrl
    : "";

  const sampulTentangUrl = desa?.sampul_tentang_path
    ? supabase.storage.from("umkm-media").getPublicUrl(desa.sampul_tentang_path)
        .data.publicUrl
    : "";

  const balaiUrl = desa?.balai_desa_path
    ? supabase.storage.from("umkm-media").getPublicUrl(desa.balai_desa_path)
        .data.publicUrl
    : "";

  const galleryImages = (galleryResult.data ?? []).map((item) => ({
    urutan: item.urutan,
    url: supabase.storage.from("umkm-media").getPublicUrl(item.storage_path)
      .data.publicUrl,
    description: item.deskripsi ?? "",
  }));

  const initialGallery = buildInitialGallery(sampulBerandaUrl, sampulTentangUrl, balaiUrl, galleryImages);

  return (
    <DesaManagement initialForm={initialForm} initialGallery={initialGallery} />
  );
}
