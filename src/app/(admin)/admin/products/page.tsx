import { products } from "@/lib/dummy-data/products";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProductsPage() {
  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          Product Master
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left">
          <thead className="border-b border-black/5 text-sm text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Tintable</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-neutral-950">{product.name}</p>
                    <p className="text-sm text-neutral-500">{product.finish}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-600">{product.brand}</td>
                <td className="px-4 py-4 text-sm text-neutral-600">{product.category}</td>
                <td className="px-4 py-4 text-sm text-neutral-600">
                  {product.size}
                  {product.unit}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={product.tintable ? "default" : "secondary"}>
                    {product.tintable ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-600">{product.stock}</td>
                <td className="px-4 py-4 text-sm text-neutral-600">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={product.status === "active" ? "default" : "secondary"}>
                    {product.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}