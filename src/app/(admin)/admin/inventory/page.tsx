import { products } from "@/lib/dummy-data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminInventoryPage() {
  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          Inventory Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => {
          const isLow = product.stock <= (product.lowStockThreshold ?? 0);

          return (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-4 py-4"
            >
              <div>
                <p className="font-medium text-neutral-950">{product.name}</p>
                <p className="text-sm text-neutral-500">
                  {product.brand} • {product.category}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-neutral-950">Stock: {product.stock}</p>
                <p className={`text-sm ${isLow ? "text-red-600" : "text-neutral-500"}`}>
                  {isLow ? "Low stock" : "Stock level healthy"}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}