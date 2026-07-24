import UmkmDetail from "@/components/UmkmDetail";

export default async function Page({
  params,
}: PageProps<"/umkm/[slug]">) {
  const { slug } = await params;

  return <UmkmDetail slug={slug} />;
}
