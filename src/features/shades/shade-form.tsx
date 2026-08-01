"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { repositories } from "@/data/repositories";
import type { Shade } from "@/data/models";
import { slugify } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const shadeSchema = z.object({
  collectionId: z.string().optional(),
  productId: z.string().optional(),
  code: z.string().min(2, "Shade code is required"),
  name: z.string().min(2, "Shade name is required"),
  hex: z.string().min(4, "Hex color is required"),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
  isCustom: z.boolean(),
  isActive: z.boolean(),
});

type ShadeFormValues = z.infer<typeof shadeSchema>;

function toFormValues(shade?: Shade): ShadeFormValues {
  return {
    collectionId: shade?.collectionId ?? "",
    productId: shade?.productId ?? "",
    code: shade?.code ?? "",
    name: shade?.name ?? "",
    hex: shade?.hex ?? "#FFFFFF",
    imageUrl: shade?.imageUrl ?? "",
    notes: shade?.notes ?? "",
    isCustom: shade?.isCustom ?? false,
    isActive: shade?.isActive ?? true,
  };
}

export function ShadeForm({ shadeId }: { shadeId?: string }) {
  const router = useRouter();
  const shade = useLiveQuery(
    () => (shadeId ? repositories.shades.getById(shadeId) : Promise.resolve(undefined)),
    [shadeId],
    undefined
  );

  const collections = useLiveQuery(() => repositories.shadeCollections.getAll(), [], []);
  const products = useLiveQuery(() => repositories.products.getAll(), [], []);

  const form = useForm<ShadeFormValues>({
    resolver: zodResolver(shadeSchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    form.reset(toFormValues(shade));
  }, [form, shade]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        collectionId: values.collectionId || null,
        productId: values.productId || null,
        imageUrl: values.imageUrl || null,
        id: shadeId ?? slugify(values.code),
      };

      if (shadeId) {
        await repositories.shades.update(shadeId, payload);
        toast.success("Shade updated");
      } else {
        await repositories.shades.create(payload);
        toast.success("Shade created");
      }

      router.push("/admin/shades");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save shade");
    }
  });

  const collectionOptions = useMemo(() => collections, [collections]);
  const productOptions = useMemo(() => products, [products]);

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          {shadeId ? "Edit Shade" : "New Shade"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" {...form.register("code")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hex">Hex</Label>
            <Input id="hex" {...form.register("hex")} placeholder="#F3EEE6" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collectionId">Collection</Label>
            <select id="collectionId" className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm" {...form.register("collectionId")}>
              <option value="">No collection</option>
              {collectionOptions.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productId">Product</Label>
            <select id="productId" className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm" {...form.register("productId")}>
              <option value="">No product</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" {...form.register("imageUrl")} placeholder="Optional shade image URL" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...form.register("notes")} />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isCustom")} />
            Custom shade
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{shadeId ? "Save Changes" : "Create Shade"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/shades")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
