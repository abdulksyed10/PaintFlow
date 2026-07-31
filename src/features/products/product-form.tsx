"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { repositories } from "@/data/repositories";
import type { Product, ProductVariant } from "@/data/models";
import { slugify } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  sku: z.string().optional(),
  brand: z.string().min(2, "Brand is required"),
  category: z.string().min(2, "Category is required"),
  finish: z.string().optional(),
  size: z.string().min(1, "Size is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive"),
  tintable: z.boolean(),
  status: z.enum(["active", "inactive"]),
  isFeatured: z.boolean(),
  isVisibleOnStorefront: z.boolean(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  lowStockThreshold: z.number().int().min(0),
  classification: z.enum(["interior", "exterior", "general"]),
});

type ProductFormValues = z.infer<typeof productSchema>;

function toFormValues(product?: Product, variant?: ProductVariant): ProductFormValues {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? variant?.sku ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    finish: product?.finish ?? "",
    size: product?.size ?? String(variant?.size ?? ""),
    unit: product?.unit ?? variant?.unit ?? "",
    price: product?.price ?? variant?.regularSellingPrice ?? 0,
    stock: product?.stock ?? variant?.currentStock ?? 0,
    tintable: product?.tintable ?? false,
    status: product?.status ?? "active",
    isFeatured: product?.isFeatured ?? false,
    isVisibleOnStorefront: product?.isVisibleOnStorefront ?? true,
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    lowStockThreshold: product?.lowStockThreshold ?? variant?.lowStockThreshold ?? 0,
    classification: product?.classification ?? "general",
  };
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const product = useLiveQuery(
    () => (productId ? repositories.products.getById(productId) : Promise.resolve(undefined)),
    [productId],
    undefined
  );

  const variant = useLiveQuery(
    async () => {
      if (!product?.variantIds?.length) return undefined;

      const variants = await repositories.productVariants.getAll();
      return variants.find((entry) => entry.id === product.variantIds?.[0]);
    },
    [product?.variantIds?.[0]],
    undefined
  );

  const brands = useLiveQuery(() => repositories.brands.getAll(), [], []);
  const categories = useLiveQuery(() => repositories.categories.getAll(), [], []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    form.reset(toFormValues(product, variant));
  }, [product, variant, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const slug = values.slug || slugify(values.name);
      const productPayload: Omit<Product, "id"> = {
        ...values,
        slug,
        sku: values.sku || undefined,
        shortDescription: values.shortDescription || undefined,
        description: values.description || undefined,
        variantIds: product?.variantIds ?? [],
        imageIds: product?.imageIds ?? [],
      };

      if (productId) {
        const updatedProduct = await repositories.products.update(productId, {
          ...productPayload,
        });

        const variantId = updatedProduct.variantIds?.[0];
        if (variantId) {
          await repositories.productVariants.update(variantId, {
            productId,
            sku: values.sku || updatedProduct.sku || `${slug}-1`,
            label: `${values.size} ${values.unit}`,
            size: Number(values.size),
            unit: values.unit,
            purchasePrice: values.price,
            regularSellingPrice: values.price,
            salePrice: null,
            gstRate: 18,
            currentStock: values.stock,
            lowStockThreshold: values.lowStockThreshold,
            status: values.status === "active" ? "active" : "inactive",
          });
        }

        toast.success("Product updated");
      } else {
        const createdProduct = await repositories.products.create({
          ...productPayload,
          variantIds: [],
          imageIds: [],
        });

        const createdVariant = await repositories.productVariants.create({
          productId: createdProduct.id,
          sku: values.sku || `${slug}-1`,
          label: `${values.size} ${values.unit}`,
          size: Number(values.size),
          unit: values.unit,
          purchasePrice: values.price,
          regularSellingPrice: values.price,
          salePrice: null,
          gstRate: 18,
          currentStock: values.stock,
          lowStockThreshold: values.lowStockThreshold,
          status: values.status === "active" ? "active" : "inactive",
        });

        await repositories.products.update(createdProduct.id, {
          variantIds: [createdVariant.id],
        });

        toast.success("Product created");
      }

      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product");
    }
  });

  const nameValue = useWatch({ control: form.control, name: "name" });

  useEffect(() => {
    if (!productId && !form.getValues("slug") && nameValue) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [productId, form, nameValue]);

  const brandOptions = useMemo(() => brands.map((brand) => brand.name), [brands]);
  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          {productId ? "Edit Product" : "New Product"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">Internal SKU</Label>
            <Input id="sku" {...form.register("sku")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <select
              id="brand"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
              {...form.register("brand")}
            >
              <option value="">Select brand</option>
              {brandOptions.map((brandName) => (
                <option key={brandName} value={brandName}>
                  {brandName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
              {...form.register("category")}
            >
              <option value="">Select category</option>
              {categoryOptions.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classification">Classification</Label>
            <select
              id="classification"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
              {...form.register("classification")}
            >
              <option value="general">General</option>
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="finish">Finish</Label>
            <Input id="finish" {...form.register("finish")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input id="size" {...form.register("size")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...form.register("unit")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Selling Price</Label>
            <Input id="price" type="number" min="0" step="0.01" {...form.register("price", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" min="0" {...form.register("stock", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input id="lowStockThreshold" type="number" min="0" {...form.register("lowStockThreshold", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea id="shortDescription" rows={3} {...form.register("shortDescription")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea id="description" rows={5} {...form.register("description")} />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("tintable")} />
            Tintable
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isFeatured")} />
            Featured product
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isVisibleOnStorefront")} />
            Visible on storefront
          </label>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
              {...form.register("status")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{productId ? "Save Changes" : "Create Product"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
