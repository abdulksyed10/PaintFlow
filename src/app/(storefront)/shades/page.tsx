import { ShadeBrowser } from "@/features/storefront/shade-browser";
import { demoShadeCollections, demoShades } from "@/data/seed/demo-data";

export default function ShadesPage() {
  const shades = demoShades.filter((shade) => shade.isActive);
  const collections = demoShadeCollections.filter((collection) => collection.storefrontVisible && collection.isActive);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Shades</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
          Browse shade inspiration with real image cards
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Shades can be uploaded or linked as images by admins, so the storefront can show reference cards instead of only generated swatches.
        </p>
      </div>

      <div className="mt-10">
        <ShadeBrowser shades={shades} collections={collections} />
      </div>
    </div>
  );
}
