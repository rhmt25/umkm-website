import UmkmManagement from "@/components/UmkmManagement";

export default async function Page({ params }: PageProps<"/admin/umkm/[id]">) {
  const { id } = await params;
  return <UmkmManagement umkmId={id} />;
}
