import { notFound } from "next/navigation";

import { SupplierForm } from "@/features/suppliers/supplier-form";
import { repositories } from "@/data/repositories";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await repositories.suppliers.getById(id);

  if (!supplier) {
    notFound();
  }

  return <SupplierForm supplierId={id} />;
}
