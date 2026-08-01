"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function shadeCardStyle(imageUrl: string | null | undefined, hex: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${hex}, #ffffff)`,
  };
}

export function ShadeList() {
  const shades = useLiveQuery(() => repositories.shades.getAll(), [], []);
  const collections = useLiveQuery(() => repositories.shadeCollections.getAll(), [], []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this shade?")) return;

    try {
      await repositories.shades.remove(id);
      toast.success("Shade deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete shade");
    }
  };

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">Shades</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Manage shade cards, images, and collection links locally.</p>
        </div>

        <Button asChild>
          <Link href="/admin/shades/new">
            <Plus className="mr-2 h-4 w-4" />
            New Shade
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b border-black/5 text-neutral-500">
            <tr>
              <th className="px-3 py-3 font-medium">Card</th>
              <th className="px-3 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Collection</th>
              <th className="px-3 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Custom</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shades.map((shade) => {
              const collection = collections.find((entry) => entry.id === shade.collectionId);
              return (
                <tr key={shade.id} className="border-b border-black/5 last:border-b-0 align-top">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 rounded-2xl border border-black/10" style={shadeCardStyle(shade.imageUrl, shade.hex)} />
                      <div>
                        <p className="font-medium text-neutral-950">{shade.name}</p>
                        <p className="text-xs text-neutral-500">{shade.hex}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-neutral-700">{shade.code}</td>
                  <td className="px-3 py-4 text-neutral-700">{collection?.name ?? "-"}</td>
                  <td className="px-3 py-4 text-neutral-700">{shade.productId ?? "-"}</td>
                  <td className="px-3 py-4">
                    <Badge variant={shade.isCustom ? "default" : "secondary"}>{shade.isCustom ? "Custom" : "Preset"}</Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant={shade.isActive ? "default" : "secondary"}>{shade.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/shades/${shade.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(shade.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {shades.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-neutral-500" colSpan={7}>
                  No shades yet. Create the first one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
