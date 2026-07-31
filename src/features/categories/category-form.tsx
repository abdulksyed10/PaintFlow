"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { repositories } from "@/data/repositories";
import type { Category } from "@/data/models";
import { slugify } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  categoryType: z.enum(["interior", "exterior", "general", "accessory", "surface prep", "base coat"]),
  storefrontVisible: z.boolean(),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function toFormValues(category?: Category): CategoryFormValues {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    categoryType: category?.categoryType ?? "general",
    storefrontVisible: category?.storefrontVisible ?? true,
    featured: category?.featured ?? false,
    displayOrder: category?.displayOrder ?? 0,
    imageUrl: category?.imageUrl ?? "",
    isActive: category?.isActive ?? true,
  };
}

export function CategoryForm({ categoryId }: { categoryId?: string }) {
  const router = useRouter();
  const category = useLiveQuery(
    () => (categoryId ? repositories.categories.getById(categoryId) : Promise.resolve(undefined)),
    [categoryId],
    undefined
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    form.reset(toFormValues(category));
  }, [category, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        imageUrl: values.imageUrl || null,
      };

      if (categoryId) {
        await repositories.categories.update(categoryId, payload);
        toast.success("Category updated");
      } else {
        await repositories.categories.create(payload);
        toast.success("Category created");
      }

      router.push("/admin/categories");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category");
    }
  });

  const nameValue = useWatch({ control: form.control, name: "name" });

  useEffect(() => {
    if (!categoryId && !form.getValues("slug") && nameValue) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [categoryId, form, nameValue]);

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          {categoryId ? "Edit Category" : "New Category"}
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
            <Label htmlFor="categoryType">Category Type</Label>
            <select
              id="categoryType"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
              {...form.register("categoryType")}
            >
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
              <option value="general">General</option>
              <option value="accessory">Accessory</option>
              <option value="surface prep">Surface Prep</option>
              <option value="base coat">Base Coat</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" min="0" {...form.register("displayOrder", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" {...form.register("imageUrl")} placeholder="Optional storefront image URL" />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("storefrontVisible")} />
            Visible on storefront
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("featured")} />
            Featured category
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{categoryId ? "Save Changes" : "Create Category"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
