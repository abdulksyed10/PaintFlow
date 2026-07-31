"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProductList() {
  const products = useLiveQuery(() => repositories.products.getAll(), [], []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product and its local variants?")) return;

    try {
      const variants = await repositories.productVariants.getAll();
      await Promise.all(
        variants.filter((variant) => variant.productId === id).map((variant) => repositories.productVariants.remove(variant.id))
      );
      await repositories.products.remove(id);
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product");
    }
  };

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">Products</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Create and edit store products locally.</p>
        </div>

        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 overflow-x-auto">
        <table className="w-full min-w-270 text-left text-sm">
          <thead className="border-b border-black/5 text-neutral-500">
            <tr>
              <th className="px-3 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Brand</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Size</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Tintable</th>
              <th className="px-3 py-3 font-medium">Storefront</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-3 py-4">
                  <div>
                    <p className="font-medium text-neutral-950">{product.name}</p>
                    <p className="text-xs text-neutral-500">/{product.slug}</p>
                  </div>
                </td>
                <td className="px-3 py-4 text-neutral-600">{product.brand}</td>
                <td className="px-3 py-4 text-neutral-600">{product.category}</td>
                <td className="px-3 py-4 text-neutral-600">
                  {product.size} {product.unit}
                </td>
                <td className="px-3 py-4 text-neutral-600">{product.stock}</td>
                <td className="px-3 py-4 text-neutral-600">₹{product.price.toFixed(2)}</td>
                <td className="px-3 py-4">
                  <Badge variant={product.tintable ? "default" : "secondary"}>
                    {product.tintable ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-3 py-4">
                  <Badge variant={product.isVisibleOnStorefront ? "default" : "secondary"}>
                    {product.isVisibleOnStorefront ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-neutral-500" colSpan={9}>
                  No products yet. Create the first one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
