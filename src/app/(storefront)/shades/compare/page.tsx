import { demoShadeCollections, demoShades } from "@/data/seed/demo-data";
import { ShadeCompareWorkbench } from "@/features/shades/shade-compare-workbench";

export default function ShadeComparePage() {
  const shades = demoShades.filter((shade) => shade.isActive);
  const collections = demoShadeCollections.filter((collection) => collection.isActive);

  return <ShadeCompareWorkbench shades={shades} collections={collections} />;
}
