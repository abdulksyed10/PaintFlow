import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { demoShadeCollections, demoShades } from "@/data/seed/demo-data";
import { products } from "@/lib/dummy-data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShadeSelectionActions } from "@/features/shades/shade-selection-actions";

function shadeCardStyle(imageUrl: string | null | undefined, hex: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${hex}, #ffffff)`,
  };
}

export default async function ShadeDetailPage({ params }: { params: { id: string } }) {
  const shade = demoShades.find((entry) => entry.id === params.id && entry.isActive);
  const collections = demoShadeCollections.filter((entry) => entry.isActive);

  if (!shade) {
    notFound();
  }

  const collection = collections.find((entry) => entry.id === shade.collectionId);
  const product = shade.productId ? products.find((entry) => entry.id === shade.productId) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/shades">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shades
          </Link>
        </Button>
        <Badge variant="outline">{shade.code}</Badge>
        {shade.isCustom ? <Badge>Custom</Badge> : <Badge variant="secondary">Preset</Badge>}
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="min-h-[420px] p-6" style={shadeCardStyle(shade.imageUrl, shade.hex)}>
            <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/80 bg-white/70 p-6 backdrop-blur">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Shade preview</p>
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {shade.name}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">{shade.notes ?? "No notes added yet."}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Hex", value: shade.hex },
                  { label: "Source", value: shade.imageUrl ? "Uploaded image" : "Generated swatch" },
                  { label: "Type", value: shade.isCustom ? "Custom" : "Preset" },
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
            <CardTitle className="text-2xl font-semibold tracking-tight">Shade details</CardTitle>
            <CardDescription>
              Images and metadata help the team match real reference cards during quoting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Collection</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{collection?.name ?? "No collection"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Linked product</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{product?.name ?? "No product link"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              <p className="font-medium text-slate-900">Why this works better</p>
              <p className="mt-2">
                Admins can now attach an image URL to the shade itself, so storefront cards and detail pages can show a real visual reference instead of relying on generated gradients alone.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/quote-request">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request a quote
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/products/${product?.slug ?? ""}`}>
                  View linked product
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

              <ShadeSelectionActions shadeId={shade.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
