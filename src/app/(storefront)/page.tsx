import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/dummy-data/products";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const featuredProducts = products.filter((product) => product.isFeatured);

export default function StorefrontHomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/5 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_30%),linear-gradient(to_bottom,_#fafaf9,_#f5f5f4)]">
        <div className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
              Color changes everything
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl">
              Premium paints, practical operations, one modern platform.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
              Explore curated paint products, finishes, and brands through a storefront
              designed to feel refined, fast, and visually rich.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/products">
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link href="/admin">View Admin Demo</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-[2rem] border border-black/5 bg-gradient-to-br from-stone-200 via-stone-100 to-amber-50 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-black/5 bg-white/60 p-6 backdrop-blur">
                <div className="grid grid-cols-4 gap-3">
                  {["#D6C6B8", "#B65E3C", "#8E9E82", "#F2C14E"].map((color) => (
                    <div
                      key={color}
                      className="h-14 rounded-2xl shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="h-5 w-40 rounded-full bg-neutral-300" />
                  <div className="h-24 rounded-[1.5rem] bg-gradient-to-r from-stone-300 via-stone-100 to-amber-100" />
                  <div className="flex gap-3">
                    <div className="h-12 flex-1 rounded-2xl bg-neutral-200" />
                    <div className="h-12 w-24 rounded-2xl bg-amber-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-amber-300/40 blur-2xl" />
            <div className="absolute -right-6 top-10 h-28 w-28 rounded-full bg-orange-300/30 blur-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Featured Selection
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              Products built for finish, durability, and choice
            </h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/products">See all products</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden rounded-[1.75rem] border-black/5 bg-white shadow-sm"
            >
              <div className="h-40 bg-gradient-to-br from-stone-200 via-stone-100 to-amber-100" />
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">{product.brand}</p>
                  <h3 className="text-xl font-semibold tracking-tight">{product.name}</h3>
                  <p className="text-sm leading-6 text-neutral-600">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>
                    {product.size}
                    {product.unit}
                  </span>
                  <span>{product.finish}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-neutral-950">
                    {formatCurrency(product.price)}
                  </span>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/products/${product.slug}`}>View Product</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}