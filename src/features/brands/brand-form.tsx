"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { repositories } from "@/data/repositories";
import type { Brand } from "@/data/models";
import { slugify } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  storefrontVisible: z.boolean(),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0),
  logoUrl: z.string().optional(),
  isActive: z.boolean(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

function toFormValues(brand?: Brand): BrandFormValues {
  return {
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    storefrontVisible: brand?.storefrontVisible ?? true,
    featured: brand?.featured ?? false,
    displayOrder: brand?.displayOrder ?? 0,
    logoUrl: brand?.logoUrl ?? "",
    isActive: brand?.isActive ?? true,
  };
}

export function BrandForm({ brandId }: { brandId?: string }) {
  const router = useRouter();
  const brand = useLiveQuery(
    () => (brandId ? repositories.brands.getById(brandId) : Promise.resolve(undefined)),
    [brandId],
    undefined
  );

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    form.reset(toFormValues(brand));
  }, [brand, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        logoUrl: values.logoUrl || null,
      };

      if (brandId) {
        await repositories.brands.update(brandId, payload);
        toast.success("Brand updated");
      } else {
        await repositories.brands.create(payload);
        toast.success("Brand created");
      }

      router.push("/admin/brands");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save brand");
    }
  });

  const nameValue = useWatch({ control: form.control, name: "name" });

  useEffect(() => {
    if (!brandId && !form.getValues("slug") && nameValue) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [brandId, form, nameValue]);

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          {brandId ? "Edit Brand" : "New Brand"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" min="0" {...form.register("displayOrder", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" {...form.register("logoUrl")} placeholder="Optional brand logo URL" />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("storefrontVisible")} />
            Visible on storefront
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("featured")} />
            Featured brand
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{brandId ? "Save Changes" : "Create Brand"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
