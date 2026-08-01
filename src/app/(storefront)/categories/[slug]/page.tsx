import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Sparkles } from "lucide-react";

import { demoCategories } from "@/data/seed/demo-data";
import { products } from "@/lib/dummy-data/products";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function categoryTone(categoryType: string) {
  const value = categoryType.toLowerCase();
  if (value.includes("interior")) return "from-orange-100 via-amber-50 to-white";
  if (value.includes("exterior")) return "from-teal-100 via-cyan-50 to-white";
  if (value.includes("base")) return "from-lime-100 via-emerald-50 to-white";
  if (value.includes("surface") || value.includes("accessory")) return "from-slate-100 via-zinc-50 to-white";
  return "from-rose-100 via-orange-50 to-white";
}

export function generateStaticParams() {
  return demoCategories.filter((category) => category.storefrontVisible).map((category) => ({ slug: category.slug }));
}

export default function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = demoCategories.find((entry) => entry.slug === params.slug && entry.storefrontVisible);

  if (!category) {
    notFound();
  }

  const categoryProducts = products
    .filter((product) => product.categoryId === category.id)
    .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || left.price - right.price);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All categories
          </Link>
        </Button>
        <Badge variant="outline">{category.categoryType}</Badge>
        {category.featured ? <Badge>Featured</Badge> : null}
        <Badge variant="secondary">{categoryProducts.length} products</Badge>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className={`min-h-[360px] bg-gradient-to-br ${categoryTone(category.categoryType)} p-6`}>
            <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/80 bg-white/70 p-6 backdrop-blur">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Category spotlight</p>
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {category.name}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  {category.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Products", value: categoryProducts.length },
                  { label: "Featured", value: categoryProducts.filter((product) => product.isFeatured).length },
                  { label: "Tintable", value: categoryProducts.filter((product) => product.tintable).length },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">How this category is used</CardTitle>
            <CardDescription>
              Browse products that match this family, then take the refined list to the quote workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                Great for quick comparison and shortlisting
              </div>
              <p className="mt-2">
                Use the list below to compare price, finish, and stock across the most relevant products in this category.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                  Open filtered catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/quote-request">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request a quote
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 space-y-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Products in this category</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Available items</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{product.brand}</p>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{product.name}</h3>
                    </div>
                    {product.isFeatured ? <Badge>Featured</Badge> : <Badge variant="outline">Standard</Badge>}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{product.shortDescription}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{product.classification ?? "general"}</Badge>
                  {product.finish ? <Badge variant="outline">{product.finish}</Badge> : null}
                  <Badge variant={product.tintable ? "default" : "secondary"}>{product.tintable ? "Tintable" : "Ready mix"}</Badge>
                </div>

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

                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={`/products/${product.slug}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {categoryProducts.length === 0 ? (
            <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:col-span-2 xl:col-span-3">
              <CardContent className="p-10 text-center text-slate-500">
                No products are currently assigned to this category.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
