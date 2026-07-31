import { ProductForm } from "@/features/products/product-form";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductForm productId={id} />;
}
