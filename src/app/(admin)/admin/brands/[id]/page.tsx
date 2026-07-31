import { BrandForm } from "@/features/brands/brand-form";

export default async function BrandEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BrandForm brandId={id} />;
}
