import { CategoryForm } from "@/features/categories/category-form";

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CategoryForm categoryId={id} />;
}
