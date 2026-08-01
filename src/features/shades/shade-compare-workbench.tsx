"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";

import type { Shade, ShadeCollection } from "@/data/models";
import { SHADE_COMPARE_STORAGE_KEY, readStoredIds, writeStoredIds } from "@/lib/catalog-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function shadeCardStyle(imageUrl: string | null | undefined, hex: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${hex}, #ffffff)`,
  };
}

export function ShadeCompareWorkbench({ shades, collections }: { shades: Shade[]; collections: ShadeCollection[] }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    setCompareIds(readStoredIds(SHADE_COMPARE_STORAGE_KEY));
  }, []);

  const compareShades = useMemo(
    () => compareIds.map((id) => shades.find((shade) => shade.id === id)).filter(Boolean) as Shade[],
    [compareIds, shades]
  );

  const clearCompare = () => {
    setCompareIds([]);
    writeStoredIds(SHADE_COMPARE_STORAGE_KEY, []);
  };

  const removeCompareItem = (shadeId: string) => {
    const nextIds = compareIds.filter((id) => id !== shadeId);
    setCompareIds(nextIds);
    writeStoredIds(SHADE_COMPARE_STORAGE_KEY, nextIds);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/shades">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shades
          </Link>
        </Button>
        <Badge variant="outline">{compareShades.length} to compare</Badge>
      </div>

      <Card className="rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl font-semibold tracking-tight">Compare shade cards</CardTitle>
          <CardDescription>
            View real image cards, hex values, and linked references side by side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full" onClick={clearCompare}>
              Clear compare
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/shades">
                Add more shades
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {compareShades.length ? (
            <div className="grid gap-4 xl:grid-cols-3">
              {compareShades.map((shade) => {
                const collection = collections.find((entry) => entry.id === shade.collectionId);

                return (
                  <Card key={shade.id} className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                    <div className="h-48 p-4" style={shadeCardStyle(shade.imageUrl, shade.hex)}>
                      <div className="flex h-full items-start justify-between">
                        <div className="space-y-2">
                          <Badge variant="outline">{shade.code}</Badge>
                          {shade.isCustom ? <Badge>Custom</Badge> : <Badge variant="secondary">Preset</Badge>}
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeCompareItem(shade.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove from compare</span>
                        </Button>
                      </div>
                    </div>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <p className="text-sm text-slate-500">{collection?.name ?? "No collection"}</p>
                        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{shade.name}</h3>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hex</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{shade.hex}</p>
                      </div>

                      <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                          <span className="text-slate-500">Source</span>
                          <span className="font-medium text-slate-950">{shade.imageUrl ? "Uploaded image" : "Generated swatch"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                          <span className="text-slate-500">Type</span>
                          <span className="font-medium text-slate-950">{shade.isCustom ? "Custom" : "Preset"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href={`/shades/${shade.id}`}>Open shade</Link>
                        </Button>
                        <Button asChild className="rounded-full">
                          <Link href="/quote-request">Quote this shade</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <CardContent className="p-10 text-center text-slate-500">
                No shades selected yet. Add items from the shade browser to compare them here.
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
