import Link from "next/link";
import { ArrowRight, BadgeCheck, Palette, Search, Sparkles } from "lucide-react";
import { products } from "@/lib/dummy-data/products";
import { demoBrands, demoCategories } from "@/data/seed/demo-data";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { storefrontNav } from "@/lib/nav";

const featuredProducts = products.filter((product) => product.isFeatured);
const featuredBrands = demoBrands
  .filter((brand) => brand.storefrontVisible && brand.featured)
  .map((brand) => ({
    ...brand,
    productCount: products.filter((product) => product.brand === brand.name).length,
  }))
  .sort((left, right) => left.displayOrder - right.displayOrder);
const categoryCards = demoCategories
  .filter((category) => category.storefrontVisible)
  .map((category) => ({
    ...category,
    productCount: products.filter((product) => product.categoryId === category.id).length,
    featuredCount: products.filter((product) => product.categoryId === category.id && product.isFeatured).length,
  }))
  .sort((left, right) => left.displayOrder - right.displayOrder);

export default function StorefrontHomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/60 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.16),_transparent_24%),linear-gradient(to_bottom,_#fffaf5,_#fff4ea)]">
        <div className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-orange-700">
              Color changes everything
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Premium paints, practical operations, one modern platform.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore curated paint products, finishes, brands, and shade-ready systems through a storefront
              designed for quick discovery and quote-first browsing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/products">
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link href="/quote-request">Request a Quote</Link>
              </Button>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { label: "Categories", value: `${categoryCards.length}` },
                { label: "Featured Products", value: `${featuredProducts.length}` },
                { label: "Quote Ready", value: "Yes" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-[2rem] border border-white/70 bg-gradient-to-br from-orange-100 via-amber-50 to-teal-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/80 bg-white/70 p-6 backdrop-blur">
                <div className="grid grid-cols-4 gap-3">
                  {["#F97316", "#FB7185", "#14B8A6", "#FBBF24"].map((color) => (
                    <div
                      key={color}
                      className="h-14 rounded-2xl shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="h-5 w-40 rounded-full bg-slate-200" />
                  <div className="h-24 rounded-[1.5rem] bg-gradient-to-r from-orange-200 via-amber-100 to-teal-100" />
                  <div className="flex gap-3">
                    <div className="h-12 flex-1 rounded-2xl bg-slate-100" />
                    <div className="h-12 w-24 rounded-2xl bg-orange-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-orange-300/35 blur-2xl" />
            <div className="absolute -right-6 top-10 h-28 w-28 rounded-full bg-teal-300/30 blur-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Browse by category</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Start from the product family that fits the job</h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/categories">View all categories</Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categoryCards.slice(0, 4).map((category) => (
            <Card key={category.id} className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Category</p>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{category.name}</h3>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    {category.productCount} items
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">{category.description}</p>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  Featured products: <span className="font-semibold text-slate-950">{category.featuredCount}</span>
                </div>

                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={`/categories/${category.slug}`}>Explore category</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Browse Faster</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Search by brand, category, tintability, finish, or stock range.
                </h2>
              </div>
              <Button asChild className="rounded-full">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Open Catalog
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="flex h-full items-center gap-4 p-6">
              <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Quote Support</p>
                <p className="mt-2 text-base leading-6 text-slate-700">
                  Need shades, primers, or a mixed basket? Send the team a quote request with product selections.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {storefrontNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-orange-200 hover:text-orange-600"
            >
              {item.title}
            </Link>
          ))}
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
            <BadgeCheck className="mr-1 inline h-4 w-4 align-[-2px]" />
            Trusted product discovery
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Featured brands</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Brands customers ask for most</h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/products">See catalog</Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredBrands.map((brand) => (
            <Card key={brand.id} className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 via-amber-50 to-teal-50 text-lg font-semibold text-slate-700 shadow-sm">
                      {brand.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Brand</p>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{brand.name}</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    {brand.productCount} items
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">{brand.description}</p>

                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={`/products?brand=${encodeURIComponent(brand.name)}`}>Browse {brand.name}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Featured Selection
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
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
              className="overflow-hidden rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="h-40 bg-gradient-to-br from-orange-100 via-amber-50 to-teal-50" />
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{product.brand}</p>
                  <h3 className="text-xl font-semibold tracking-tight">{product.name}</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {product.size}
                    {product.unit}
                  </span>
                  <span>{product.finish}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-950">
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