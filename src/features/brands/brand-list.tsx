"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BrandList() {
  const brands = useLiveQuery(() => repositories.brands.getAll(), [], []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this brand?")) return;

    try {
      await repositories.brands.remove(id);
      toast.success("Brand deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete brand");
    }
  };

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">Brands</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Manage brand visibility and ordering locally.</p>
        </div>

        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" />
            New Brand
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 overflow-x-auto">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="border-b border-black/5 text-neutral-500">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Visibility</th>
              <th className="px-3 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-3 py-4">
                  <div>
                    <p className="font-medium text-neutral-950">{brand.name}</p>
                    <p className="text-xs text-neutral-500">/{brand.slug}</p>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <Badge variant={brand.storefrontVisible ? "default" : "secondary"}>
                    {brand.storefrontVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-3 py-4 text-neutral-600">{brand.displayOrder}</td>
                <td className="px-3 py-4">
                  <Badge variant={brand.isActive ? "default" : "secondary"}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/brands/${brand.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-neutral-500" colSpan={5}>
                  No brands yet. Create the first one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
