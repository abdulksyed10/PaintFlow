import { notFound } from "next/navigation";

import { CustomerForm } from "@/features/customers/customer-form";
import { repositories } from "@/data/repositories";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await repositories.customers.getById(id);

  if (!customer) {
    notFound();
  }

  return <CustomerForm customerId={id} />;
}
