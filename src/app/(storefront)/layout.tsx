import Link from "next/link";
import { Hammer, Paintbrush, Search, Sparkles } from "lucide-react";
import { storefrontNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.08),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(45,212,191,0.08),_transparent_20%),linear-gradient(to_bottom,_#fffdf9,_#fff8f3)] text-slate-950">
      <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-100 via-orange-50 to-teal-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 text-sm text-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm">
              <Hammer className="h-4.5 w-4.5" />
            </span>
            <p className="leading-6">
              Modern storefront preview with richer categorization, live search, and quote-ready browsing.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-amber-300/80 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm backdrop-blur">
            Built for browsing and quoting
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight text-slate-950"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-teal-400 text-white shadow-sm">
                <Paintbrush className="h-4.5 w-4.5" />
              </span>
              <span className="text-lg">PaintFlow</span>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {storefrontNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 transition-colors hover:bg-white hover:text-orange-600"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <form action="/products" method="get" className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search products"
                  className="h-11 w-56 rounded-full border border-slate-200 bg-white/90 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <Button asChild variant="outline" className="rounded-full md:hidden">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Link>
              </Button>
              <Button type="submit" className="hidden rounded-full md:inline-flex">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Catalog
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/quote-request">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}