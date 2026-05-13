import { products } from "@/lib/dummy-data/products";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function StorefrontProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          Product Catalog
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">
          Explore paints, primers, and surface essentials
        </h1>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          A storefront-ready catalog experience for premium paint products across
          interior, exterior, primer, and preparation categories.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="rounded-[1.5rem] border-black/5">
            <div className="h-40 rounded-t-[1.5rem] bg-gradient-to-br from-stone-200 via-stone-100 to-neutral-50" />
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-neutral-500">{product.brand}</p>
                  <h2 className="text-xl font-semibold tracking-tight">{product.name}</h2>
                </div>
                <Badge variant={product.tintable ? "default" : "secondary"}>
                  {product.tintable ? "Tintable" : "Standard"}
                </Badge>
              </div>

              <p className="text-sm leading-6 text-neutral-600">
                {product.shortDescription}
              </p>

              <div className="flex flex-wrap gap-2 text-sm text-neutral-500">
                <span>{product.category}</span>
                <span>•</span>
                <span>
                  {product.size}
                  {product.unit}
                </span>
                <span>•</span>
                <span>{product.finish}</span>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                <span className="text-sm text-neutral-500">Stock: {product.stock}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}