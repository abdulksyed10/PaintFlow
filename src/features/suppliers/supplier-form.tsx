"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { repositories } from "@/data/repositories";
import type { Supplier } from "@/data/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const supplierSchema = z.object({
  companyName: z.string().min(2, "Supplier company name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().min(6, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  notes: z.string().optional(),
  openingBalance: z.number().min(0),
  isActive: z.boolean(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

function toFormValues(supplier?: Supplier): SupplierFormValues {
  return {
    companyName: supplier?.companyName ?? "",
    contactPerson: supplier?.contactPerson ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
    gstin: supplier?.gstin ?? "",
    notes: supplier?.notes ?? "",
    openingBalance: supplier?.openingBalance ?? 0,
    isActive: supplier?.isActive ?? true,
  };
}

export function SupplierForm({ supplierId }: { supplierId?: string }) {
  const router = useRouter();
  const supplier = useLiveQuery(
    () => (supplierId ? repositories.suppliers.getById(supplierId) : Promise.resolve(undefined)),
    [supplierId],
    undefined
  );

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    form.reset(toFormValues(supplier));
  }, [supplier, form]);

  const companyName = useWatch({ control: form.control, name: "companyName" });

  useEffect(() => {
    if (!supplierId && companyName && !form.getValues("phone")) {
      form.setFocus("phone");
    }
  }, [companyName, form, supplierId]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        contactPerson: values.contactPerson || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        gstin: values.gstin || undefined,
        notes: values.notes || undefined,
      };

      if (supplierId) {
        await repositories.suppliers.update(supplierId, payload);
        toast.success("Supplier updated");
      } else {
        await repositories.suppliers.create(payload);
        toast.success("Supplier created");
      }

      router.push("/admin/suppliers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save supplier");
    }
  });

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          {supplierId ? "Edit Supplier" : "New Supplier"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...form.register("companyName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" {...form.register("contactPerson")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={3} {...form.register("address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" {...form.register("gstin")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="openingBalance">Opening Balance</Label>
            <Input id="openingBalance" type="number" min="0" {...form.register("openingBalance", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...form.register("notes")} />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{supplierId ? "Save Changes" : "Create Supplier"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/suppliers")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
