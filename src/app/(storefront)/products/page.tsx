import { products } from "@/lib/dummy-data/products";
import { ProductCatalog } from "@/features/storefront/product-catalog";

export default function StorefrontProductsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const getParam = (key: string) => {
    const value = searchParams?.[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Product Catalog
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
          Explore paints, primers, and surface essentials
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          A richer catalog with live search, brand and category filters, tintable and stock filters,
          and product-level sorting to make browsing faster.
        </p>
      </div>

      <div className="mt-10">
        <ProductCatalog
          products={products}
          initialState={{
            query: getParam("q") ?? undefined,
            category: getParam("category") ?? undefined,
            brand: getParam("brand") ?? undefined,
            classification: getParam("classification") ?? undefined,
            finish: getParam("finish") ?? undefined,
            tintableOnly: getParam("tintable") === "1",
            stockView: getParam("stock") ?? undefined,
            sort: (getParam("sort") as never) ?? undefined,
          }}
        />
      </div>
    </div>
  );
}