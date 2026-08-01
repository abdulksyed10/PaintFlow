import { ShadeForm } from "@/features/shades/shade-form";

export default async function ShadeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ShadeForm shadeId={id} />;
}
