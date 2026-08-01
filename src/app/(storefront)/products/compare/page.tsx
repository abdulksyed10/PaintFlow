import { products } from "@/lib/dummy-data/products";
import { ProductCompareWorkbench } from "@/features/products/product-compare-workbench";

export default function ProductComparePage() {
  return <ProductCompareWorkbench products={products} />;
}
