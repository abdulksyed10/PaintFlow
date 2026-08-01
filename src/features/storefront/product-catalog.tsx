"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import type { Product } from "@/data/models";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductSelectionActions } from "@/features/products/product-selection-actions";

type SortOption = "featured" | "recommended" | "price-asc" | "price-desc" | "stock-desc" | "name-asc";

type FilterOption = {
  label: string;
  value: string;
};

export type ProductCatalogState = {
  query?: string;
  category?: string;
  brand?: string;
  classification?: string;
  finish?: string;
  tintableOnly?: boolean;
  stockView?: string;
  sort?: SortOption;
};

function uniqueValues(products: Product[], selector: (product: Product) => string | undefined) {
  return Array.from(new Set(products.map(selector).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function stockLabel(stock: number, threshold = 5) {
  if (stock <= 0) return "Out of stock";
  if (stock <= threshold) return "Low stock";
  return "In stock";
}

function stockTone(stock: number, threshold = 5) {
  if (stock <= 0) return "destructive" as const;
  if (stock <= threshold) return "secondary" as const;
  return "default" as const;
}

function categoryTone(category: string) {
  const value = category.toLowerCase();
  if (value.includes("interior")) return "from-orange-100 via-amber-50 to-white";
  if (value.includes("exterior")) return "from-teal-100 via-cyan-50 to-white";
  if (value.includes("primer") || value.includes("base")) return "from-lime-100 via-emerald-50 to-white";
  if (value.includes("putty") || value.includes("prep")) return "from-slate-100 via-zinc-50 to-white";
  return "from-rose-100 via-orange-50 to-white";
}

type FilterControlsProps = {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  classification: string;
  setClassification: (value: string) => void;
  finish: string;
  setFinish: (value: string) => void;
  tintableOnly: boolean;
  setTintableOnly: (value: boolean | ((current: boolean) => boolean)) => void;
  stockView: string;
  setStockView: (value: string) => void;
  sort: SortOption;
  setSort: (value: SortOption) => void;
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  classificationOptions: FilterOption[];
  finishOptions: FilterOption[];
  onReset: () => void;
};

function FilterControls({
  query,
  setQuery,
  category,
  setCategory,
  brand,
  setBrand,
  classification,
  setClassification,
  finish,
  setFinish,
  tintableOnly,
  setTintableOnly,
  stockView,
  setStockView,
  sort,
  setSort,
  categoryOptions,
  brandOptions,
  classificationOptions,
  finishOptions,
  onReset,
}: FilterControlsProps) {
  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, brands, finishes, use cases, or surfaces"
              className="h-11 rounded-2xl pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Brand</label>
          <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="all">All brands</option>
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Classification</label>
          <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={classification} onChange={(event) => setClassification(event.target.value)}>
            <option value="all">All types</option>
            {classificationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Finish</label>
          <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={finish} onChange={(event) => setFinish(event.target.value)}>
            <option value="all">All finishes</option>
            {finishOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Stock</label>
          <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={stockView} onChange={(event) => setStockView(event.target.value)}>
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Sort</label>
          <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            <option value="featured">Featured first</option>
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="stock-desc">Stock: high to low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={tintableOnly ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setTintableOnly((current) => !current)}
        >
          Tintable only
        </Button>
        <Button
          type="button"
          variant={category === "all" ? "default" : "outline"}
          className="rounded-full"
          onClick={onReset}
        >
          Reset filters
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categoryOptions.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={category === item.value ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCategory(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </>
  );
}

export function ProductCatalog({ products, initialState }: { products: Product[]; initialState?: ProductCatalogState }) {
  const [query, setQuery] = useState(initialState?.query ?? "");
  const [category, setCategory] = useState(initialState?.category ?? "all");
  const [brand, setBrand] = useState(initialState?.brand ?? "all");
  const [classification, setClassification] = useState(initialState?.classification ?? "all");
  const [finish, setFinish] = useState(initialState?.finish ?? "all");
  const [tintableOnly, setTintableOnly] = useState(initialState?.tintableOnly ?? false);
  const [stockView, setStockView] = useState(initialState?.stockView ?? "all");
  const [sort, setSort] = useState<SortOption>(initialState?.sort ?? "featured");

  const categoryOptions = useMemo<FilterOption[]>(
    () => uniqueValues(products, (product) => product.category).map((value) => ({ label: value, value })),
    [products]
  );
  const brandOptions = useMemo<FilterOption[]>(
    () => uniqueValues(products, (product) => product.brand).map((value) => ({ label: value, value })),
    [products]
  );
  const classificationOptions = useMemo<FilterOption[]>(
    () => uniqueValues(products, (product) => product.classification).map((value) => ({ label: value, value })),
    [products]
  );
  const finishOptions = useMemo<FilterOption[]>(
    () => uniqueValues(products, (product) => product.finish).map((value) => ({ label: value, value })),
    [products]
  );

  const productCounts = useMemo(() => {
    const counts = {
      all: products.length,
      featured: products.filter((product) => product.isFeatured).length,
      tintable: products.filter((product) => product.tintable).length,
      lowStock: products.filter((product) => product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5)).length,
    };

    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    const matchesSearch = (product: Product) => {
      if (!searchTerm) return true;

      return [
        product.name,
        product.brand,
        product.category,
        product.finish ?? "",
        product.shortDescription ?? "",
        ...(product.recommendedSurfaces ?? []),
        ...(product.useCases ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
    };

    const matchesStock = (product: Product) => {
      if (stockView === "all") return true;
      if (stockView === "low") return product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5);
      if (stockView === "out") return product.stock <= 0;
      return product.stock > (product.lowStockThreshold ?? 5);
    };

    const list = products.filter((product) => {
      const classificationMatches = classification === "all" || (product.classification ?? "general") === classification;
      const categoryMatches = category === "all" || product.category === category;
      const brandMatches = brand === "all" || product.brand === brand;
      const finishMatches = finish === "all" || (product.finish ?? "") === finish;

      return (
        matchesSearch(product) &&
        categoryMatches &&
        brandMatches &&
        classificationMatches &&
        finishMatches &&
        matchesStock(product) &&
        (!tintableOnly || product.tintable)
      );
    });

    const sorted = [...list].sort((left, right) => {
      switch (sort) {
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "stock-desc":
          return right.stock - left.stock;
        case "name-asc":
          return left.name.localeCompare(right.name);
        case "recommended":
          return (Number(right.isFeatured) - Number(left.isFeatured)) || (right.stock - left.stock);
        case "featured":
        default:
          return (Number(right.isFeatured) - Number(left.isFeatured)) || (left.price - right.price);
      }
    });

    return sorted;
  }, [brand, category, classification, finish, products, query, sort, stockView, tintableOnly]);

  const summary = useMemo(() => {
    const activeCount = filteredProducts.length;
    const featuredCount = products.filter((product) => product.isFeatured).length;
    const tintableCount = products.filter((product) => product.tintable).length;
    const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5)).length;

    return { activeCount, featuredCount, tintableCount, lowStockCount };
  }, [filteredProducts.length, products]);

  const categoryChips = useMemo(
    () => [{ label: "All", value: "all" }, ...categoryOptions],
    [categoryOptions]
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Results", value: summary.activeCount },
          { label: "Featured", value: summary.featuredCount },
          { label: "Tintable", value: summary.tintableCount },
          { label: "Low Stock", value: summary.lowStockCount },
        ].map((item) => (
          <Card key={item.label} className="rounded-[1.5rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight text-slate-950">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Search and refine the catalog</CardTitle>
              <CardDescription>
                Filter by category, brand, finish, classification, stock, and tintability.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
              Live filtering
            </div>
          </div>

          <div className="hidden lg:block">
            <FilterControls
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              brand={brand}
              setBrand={setBrand}
              classification={classification}
              setClassification={setClassification}
              finish={finish}
              setFinish={setFinish}
              tintableOnly={tintableOnly}
              setTintableOnly={setTintableOnly}
              stockView={stockView}
              setStockView={setStockView}
              sort={sort}
              setSort={setSort}
              categoryOptions={categoryChips}
              brandOptions={brandOptions}
              classificationOptions={classificationOptions}
              finishOptions={finishOptions}
              onReset={() => {
                setCategory("all");
                setQuery("");
                setBrand("all");
                setClassification("all");
                setFinish("all");
                setTintableOnly(false);
                setStockView("all");
                setSort("featured");
              }}
            />
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Open filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-[2rem] p-0 sm:max-w-none">
                <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
                  <SheetTitle className="text-2xl font-semibold tracking-tight">Filter catalog</SheetTitle>
                  <SheetDescription>
                    Search, sort, and narrow products without leaving the page.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-5 px-6 py-6">
                  <FilterControls
                    query={query}
                    setQuery={setQuery}
                    category={category}
                    setCategory={setCategory}
                    brand={brand}
                    setBrand={setBrand}
                    classification={classification}
                    setClassification={setClassification}
                    finish={finish}
                    setFinish={setFinish}
                    tintableOnly={tintableOnly}
                    setTintableOnly={setTintableOnly}
                    stockView={stockView}
                    setStockView={setStockView}
                    sort={sort}
                    setSort={setSort}
                    categoryOptions={categoryChips}
                    brandOptions={brandOptions}
                    classificationOptions={classificationOptions}
                    finishOptions={finishOptions}
                    onReset={() => {
                      setCategory("all");
                      setQuery("");
                      setBrand("all");
                      setClassification("all");
                      setFinish("all");
                      setTintableOnly(false);
                      setStockView("all");
                      setSort("featured");
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm">{summary.activeCount} results</span>
              <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm">{productCounts.lowStock} low stock</span>
            </div>
          </div>
      </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2 text-sm text-slate-500">
        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm">All products: {productCounts.all}</span>
        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm">Featured: {productCounts.featured}</span>
        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm">Tintable: {productCounts.tintable}</span>
        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm">Low stock: {productCounts.lowStock}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur">
        <div>
          <p className="text-sm font-medium text-slate-900">Compare or shortlist products as you browse.</p>
          <p className="text-sm text-slate-600">Save items from the cards below, then open the compare board when you want side-by-side review.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/products/compare">Open compare board</Link>
        </Button>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => {
          const lowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5);

          return (
            <Card key={product.id} className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-1">
              <div className={`h-40 bg-gradient-to-br ${categoryTone(product.category)} p-5`}>
                <div className="flex h-full items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant={stockTone(product.stock, product.lowStockThreshold)}>
                      {stockLabel(product.stock, product.lowStockThreshold)}
                    </Badge>
                    <Badge variant={product.tintable ? "default" : "secondary"}>
                      {product.tintable ? "Tintable" : "Ready Mix"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">From</p>
                    <p className="text-lg font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>

              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{product.brand}</p>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{product.name}</h3>
                    </div>
                    {product.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                  </div>
                  <p className="text-sm leading-6 text-slate-600 line-clamp-3">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.classification ? <Badge variant="outline">{product.classification}</Badge> : null}
                  {product.finish ? <Badge variant="outline">{product.finish}</Badge> : null}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Size</p>
                    <p className="mt-1 font-medium text-slate-900">{product.size} {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stock</p>
                    <p className={`mt-1 font-medium ${lowStock ? "text-amber-700" : "text-slate-900"}`}>{product.stock} units</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
                    <p className="text-lg font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                  </div>
                </div>

                <ProductSelectionActions productId={product.id} compact />

                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={`/products/${product.slug}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {filteredProducts.length === 0 ? (
          <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:col-span-2 xl:col-span-3">
            <CardContent className="p-10 text-center text-slate-500">
              No products match your filters. Try a broader category or clear the search.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
