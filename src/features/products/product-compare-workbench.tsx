"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookmarkCheck, Scale, Trash2 } from "lucide-react";

import type { Product } from "@/data/models";
import { formatCurrency } from "@/lib/format";
import {
  PRODUCT_COMPARE_STORAGE_KEY,
  PRODUCT_SHORTLIST_STORAGE_KEY,
  readStoredIds,
  writeStoredIds,
} from "@/lib/catalog-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function productRows(product: Product) {
  return [
    { label: "Category", value: product.category },
    { label: "Brand", value: product.brand },
    { label: "Classification", value: product.classification ?? "general" },
    { label: "Finish", value: product.finish ?? "Standard" },
    { label: "Price", value: formatCurrency(product.price) },
    { label: "Size", value: `${product.size} ${product.unit}` },
    { label: "Stock", value: `${product.stock}` },
    { label: "Tintable", value: product.tintable ? "Yes" : "No" },
  ];
}

function getPrimaryUseCases(product: Product) {
  return [...(product.useCases ?? []), ...(product.recommendedSurfaces ?? [])].slice(0, 4);
}

export function ProductCompareWorkbench({ products }: { products: Product[] }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);

  useEffect(() => {
    setCompareIds(readStoredIds(PRODUCT_COMPARE_STORAGE_KEY));
    setShortlistIds(readStoredIds(PRODUCT_SHORTLIST_STORAGE_KEY));
  }, []);

  const compareProducts = useMemo(
    () => compareIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[],
    [compareIds, products]
  );

  const shortlistProducts = useMemo(
    () => shortlistIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[],
    [products, shortlistIds]
  );

  const clearCompare = () => {
    setCompareIds([]);
    writeStoredIds(PRODUCT_COMPARE_STORAGE_KEY, []);
  };

  const clearShortlist = () => {
    setShortlistIds([]);
    writeStoredIds(PRODUCT_SHORTLIST_STORAGE_KEY, []);
  };

  const removeCompareItem = (productId: string) => {
    const nextIds = compareIds.filter((id) => id !== productId);
    setCompareIds(nextIds);
    writeStoredIds(PRODUCT_COMPARE_STORAGE_KEY, nextIds);
  };

  const removeShortlistItem = (productId: string) => {
    const nextIds = shortlistIds.filter((id) => id !== productId);
    setShortlistIds(nextIds);
    writeStoredIds(PRODUCT_SHORTLIST_STORAGE_KEY, nextIds);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to catalog
          </Link>
        </Button>
        <Badge variant="outline">{compareProducts.length} to compare</Badge>
        <Badge variant="secondary">{shortlistProducts.length} shortlisted</Badge>
      </div>

      <Card className="rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl font-semibold tracking-tight">Compare products and review your shortlist</CardTitle>
          <CardDescription>
            Save products from the catalog, then compare finish, stock, price, and use cases in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compare" className="w-full">
            <TabsList>
              <TabsTrigger value="compare">
                <Scale className="mr-2 h-4 w-4" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="shortlist">
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Shortlist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compare" className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="rounded-full" onClick={clearCompare}>
                  Clear compare
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/products">
                    Add more products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {compareProducts.length ? (
                <div className="grid gap-4 xl:grid-cols-3">
                  {compareProducts.map((product) => (
                    <Card key={product.id} className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                      <CardHeader className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{product.brand}</p>
                            <CardTitle className="text-xl font-semibold tracking-tight">{product.name}</CardTitle>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeCompareItem(product.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove from compare</span>
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{product.category}</Badge>
                          {product.finish ? <Badge variant="outline">{product.finish}</Badge> : null}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                        </div>

                        <div className="space-y-3 text-sm text-slate-600">
                          {productRows(product).map((row) => (
                            <div key={row.label} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                              <span className="text-slate-500">{row.label}</span>
                              <span className="font-medium text-slate-950 text-right">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                          <p className="font-medium text-slate-900">Use cases</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {getPrimaryUseCases(product).map((useCase) => (
                              <Badge key={useCase} variant="outline">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button asChild variant="outline" className="rounded-full">
                            <Link href={`/products/${product.slug}`}>View product</Link>
                          </Button>
                          <Button asChild className="rounded-full">
                            <Link href="/quote-request">Quote this product</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                  <CardContent className="p-10 text-center text-slate-500">
                    No products selected yet. Use compare on the catalog cards to build a board.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="shortlist" className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="rounded-full" onClick={clearShortlist}>
                  Clear shortlist
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/products">
                    Continue browsing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shortlistProducts.map((product) => (
                  <Card key={product.id} className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">{product.brand}</p>
                          <CardTitle className="text-xl font-semibold tracking-tight">{product.name}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeShortlistItem(product.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove from shortlist</span>
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{product.category}</Badge>
                        {product.tintable ? <Badge variant="default">Tintable</Badge> : <Badge variant="outline">Ready mix</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-6 text-slate-600">{product.shortDescription}</p>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stock</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{product.stock}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href={`/products/${product.slug}`}>Open product</Link>
                        </Button>
                        <Button asChild className="rounded-full">
                          <Link href="/quote-request">Request quote</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {shortlistProducts.length === 0 ? (
                  <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:col-span-2 xl:col-span-3">
                    <CardContent className="p-10 text-center text-slate-500">
                      Your shortlist is empty. Use shortlist on the catalog cards to save products here.
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
