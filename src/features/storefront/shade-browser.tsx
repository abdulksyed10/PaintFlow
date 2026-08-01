"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import type { Shade, ShadeCollection } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function shadeCardStyle(imageUrl: string | null | undefined, hex: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${hex}, #ffffff)`,
  };
}

export function ShadeBrowser({
  shades,
  collections,
}: {
  shades: Shade[];
  collections: ShadeCollection[];
}) {
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState("all");
  const [customOnly, setCustomOnly] = useState(false);

  const collectionMap = useMemo(() => new Map(collections.map((collection) => [collection.id, collection])), [collections]);

  const filteredShades = useMemo(() => {
    const search = query.trim().toLowerCase();

    return shades.filter((shade) => {
      const collection = collectionMap.get(shade.collectionId ?? "");
      const matchesCollection = collectionId === "all" || shade.collectionId === collectionId;
      const matchesCustom = !customOnly || shade.isCustom;
      const matchesSearch =
        !search ||
        [shade.name, shade.code, shade.hex, shade.notes ?? "", collection?.name ?? "", collection?.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesCollection && matchesCustom && matchesSearch;
    });
  }, [collectionId, collectionMap, customOnly, query, shades]);

  return (
    <div className="space-y-8">
      <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Find shades faster</CardTitle>
              <CardDescription>
                Search by shade code, name, collection, or notes. Cards use uploaded images when available.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4" />
              Image-aware shade cards
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search shades, codes, or notes"
                className="h-11 rounded-2xl pl-10"
              />
            </div>

            <select
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
            >
              <option value="all">All collections</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant={customOnly ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCustomOnly((current) => !current)}
            >
              Custom shades only
            </Button>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredShades.map((shade) => {
          const collection = collectionMap.get(shade.collectionId ?? "");

          return (
            <Card key={shade.id} className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-1">
              <div className="h-48 p-4" style={shadeCardStyle(shade.imageUrl, shade.hex)}>
                <div className="flex h-full items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline">{shade.code}</Badge>
                    {shade.isCustom ? <Badge>Custom</Badge> : <Badge variant="secondary">Preset</Badge>}
                  </div>
                  <div className="rounded-2xl bg-white/85 px-3 py-2 text-right shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hex</p>
                    <p className="text-sm font-semibold text-slate-950">{shade.hex}</p>
                  </div>
                </div>
              </div>

              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{collection?.name ?? "No collection"}</p>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{shade.name}</h3>
                    </div>
                    <span className="h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: shade.hex }} />
                  </div>
                  <p className="text-sm leading-6 text-slate-600 line-clamp-3">{shade.notes ?? "A shade card ready for quote matching and reference."}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{shade.imageUrl ? "Image card" : "Generated preview"}</Badge>
                  <Badge variant="outline">{shade.productId ? "Linked product" : "Standalone"}</Badge>
                </div>

                <Button asChild className="w-full rounded-full">
                  <Link href={`/shades/${shade.id}`}>Open shade</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {filteredShades.length === 0 ? (
          <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:col-span-2 xl:col-span-3">
            <CardContent className="p-10 text-center text-slate-500">
              No shades match your filters.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
