"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { repositories } from "@/data/repositories";
import type { Customer } from "@/data/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(6, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  billingAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
  gstin: z.string().optional(),
  customerType: z.string().optional(),
  notes: z.string().optional(),
  openingBalance: z.number().min(0),
  isActive: z.boolean(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

function toFormValues(customer?: Customer): CustomerFormValues {
  return {
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    billingAddress: customer?.billingAddress ?? "",
    deliveryAddress: customer?.deliveryAddress ?? "",
    gstin: customer?.gstin ?? "",
    customerType: customer?.customerType ?? "",
    notes: customer?.notes ?? "",
    openingBalance: customer?.openingBalance ?? 0,
    isActive: customer?.isActive ?? true,
  };
}

export function CustomerForm({ customerId }: { customerId?: string }) {
  const router = useRouter();
  const customer = useLiveQuery(
    () => (customerId ? repositories.customers.getById(customerId) : Promise.resolve(undefined)),
    [customerId],
    undefined
  );

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    form.reset(toFormValues(customer));
  }, [customer, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        email: values.email || undefined,
        billingAddress: values.billingAddress || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        gstin: values.gstin || undefined,
        customerType: values.customerType || undefined,
        notes: values.notes || undefined,
      };

      if (customerId) {
        await repositories.customers.update(customerId, payload);
        toast.success("Customer updated");
      } else {
        await repositories.customers.create(payload);
        toast.success("Customer created");
      }

      router.push("/admin/customers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save customer");
    }
  });

  const nameValue = useWatch({ control: form.control, name: "name" });

  useEffect(() => {
    if (!customerId && nameValue && !form.getValues("phone")) {
      form.setFocus("phone");
    }
  }, [customerId, form, nameValue]);

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          {customerId ? "Edit Customer" : "New Customer"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerType">Customer Type</Label>
            <Input id="customerType" placeholder="Retail, business, contractor" {...form.register("customerType")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Textarea id="billingAddress" rows={3} {...form.register("billingAddress")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea id="deliveryAddress" rows={3} {...form.register("deliveryAddress")} />
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
            <Button type="submit">{customerId ? "Save Changes" : "Create Customer"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/customers")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
