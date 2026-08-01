import Link from "next/link";
import { ArrowRight, BadgeCheck, PaintBucket, Sparkles } from "lucide-react";

import { demoCategories } from "@/data/seed/demo-data";
import { products } from "@/lib/dummy-data/products";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function categoryTone(categoryType: string) {
  const value = categoryType.toLowerCase();
  if (value.includes("interior")) return "from-orange-100 via-amber-50 to-white";
  if (value.includes("exterior")) return "from-teal-100 via-cyan-50 to-white";
  if (value.includes("base")) return "from-lime-100 via-emerald-50 to-white";
  if (value.includes("surface") || value.includes("accessory")) return "from-slate-100 via-zinc-50 to-white";
  return "from-rose-100 via-orange-50 to-white";
}

const categoryCards = demoCategories
  .filter((category) => category.storefrontVisible)
  .map((category) => ({
    ...category,
    products: products.filter((product) => product.categoryId === category.id),
  }))
  .sort((left, right) => left.displayOrder - right.displayOrder);

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Categories</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
          Shop by product family
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Start with the job type, then narrow into the right product family for finish, protection, or preparation.
        </p>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categoryCards.map((category) => (
          <Card key={category.id} className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className={`h-36 bg-gradient-to-br ${categoryTone(category.categoryType)} p-5`}>
              <div className="flex h-full items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="outline">{category.categoryType}</Badge>
                  {category.featured ? <Badge>Featured</Badge> : null}
                </div>
                <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Products</p>
                  <p className="text-lg font-semibold text-slate-950">{category.products.length}</p>
                </div>
              </div>
            </div>

            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">{category.slug}</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{category.name}</h2>
                <p className="text-sm leading-6 text-slate-600">{category.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{category.products.length} products</Badge>
                <Badge variant="outline">{category.featured ? "Featured" : "Standard"}</Badge>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  Storefront visible and quote-ready
                </span>
                <span className="flex items-center gap-2">
                  <PaintBucket className="h-4 w-4 text-orange-500" />
                  Designed for quick product comparison
                </span>
              </div>

              <Button asChild className="w-full rounded-full">
                <Link href={`/categories/${category.slug}`}>
                  Explore {category.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">Need help choosing?</CardTitle>
            <CardDescription>
              Use the quote workflow to hand the team a more exact project brief.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="/quote-request">
                <Sparkles className="mr-2 h-4 w-4" />
                Request a quote
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/products">Browse all products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">Quick path</CardTitle>
            <CardDescription>
              Jump straight into the most commonly browsed families.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {categoryCards.slice(0, 4).map((category) => (
              <Button key={category.id} asChild variant="outline" className="rounded-full">
                <Link href={`/categories/${category.slug}`}>{category.name}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
