import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Palette, Sparkles } from "lucide-react";

import { products } from "@/lib/dummy-data/products";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSelectionActions } from "@/features/products/product-selection-actions";

function categoryTone(category: string) {
  const value = category.toLowerCase();
  if (value.includes("interior")) return "from-orange-100 via-amber-50 to-white";
  if (value.includes("exterior")) return "from-teal-100 via-cyan-50 to-white";
  if (value.includes("primer") || value.includes("base")) return "from-lime-100 via-emerald-50 to-white";
  if (value.includes("putty") || value.includes("prep")) return "from-slate-100 via-zinc-50 to-white";
  return "from-rose-100 via-orange-50 to-white";
}

function stockLabel(stock: number, threshold = 5) {
  if (stock <= 0) return "Out of stock";
  if (stock <= threshold) return "Low stock";
  return "In stock";
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((entry) => entry.slug === params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((entry) => entry.id !== product.id && (entry.category === product.category || entry.brand === product.brand))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to catalog
          </Link>
        </Button>
        <Badge variant="outline">{product.category}</Badge>
        {product.isFeatured ? <Badge>Featured</Badge> : null}
        <Badge variant={product.tintable ? "default" : "secondary"}>{product.tintable ? "Tintable" : "Ready Mix"}</Badge>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className={`min-h-[420px] bg-gradient-to-br ${categoryTone(product.category)} p-6`}>
            <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/80 bg-white/70 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{product.brand}</p>
                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    {product.name}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">
                    {product.description ?? product.shortDescription}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                  <p className="mt-1 text-sm text-slate-500">{product.size} {product.unit}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Stock", value: `${product.stock} units` },
                  { label: "Finish", value: product.finish ?? "Standard" },
                  { label: "Status", value: stockLabel(product.stock, product.lowStockThreshold) },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold tracking-tight">Product summary</CardTitle>
              <CardDescription>
                A clearer breakdown of what this product covers, where it works, and how the team can quote it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{product.classification ?? "general"}</Badge>
                {product.finish ? <Badge variant="outline">{product.finish}</Badge> : null}
                <Badge variant="outline">{product.size} {product.unit}</Badge>
                <Badge variant={product.stock > (product.lowStockThreshold ?? 5) ? "default" : "secondary"}>
                  {stockLabel(product.stock, product.lowStockThreshold)}
                </Badge>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                {product.shortDescription}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended surfaces</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {(product.recommendedSurfaces ?? [product.category]).map((surface) => (
                      <li key={surface} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                        <span>{surface}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Use cases</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {(product.useCases ?? ["general application"]).map((useCase) => (
                      <li key={useCase} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-orange-500" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/quote-request">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Request a quote
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/products">
                    Browse more products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <ProductSelectionActions productId={product.id} />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Quick facts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Brand", value: product.brand },
                { label: "Category", value: product.category },
                { label: "SKU", value: product.sku ?? "—" },
                { label: "Stock", value: `${product.stock} units` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="mt-12 space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Related products</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">More items in the same range</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((related) => (
              <Card key={related.id} className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                <div className={`h-32 bg-gradient-to-br ${categoryTone(related.category)} p-5`} />
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{related.brand}</p>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{related.name}</h3>
                    </div>
                    <Badge variant="outline">{related.category}</Badge>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{related.shortDescription}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-semibold text-slate-950">{formatCurrency(related.price)}</span>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/products/${related.slug}`}>View details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
