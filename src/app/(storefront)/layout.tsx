import Link from "next/link";
import { Hammer, Paintbrush } from "lucide-react";
import { storefrontNav } from "@/lib/nav";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 text-base text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Hammer className="h-5 w-5 shrink-0" />
            <p className="leading-6">
              Preview build — PaintFlow is currently being refined. Full launch
              with the custom domain on{" "}
              <span className="font-semibold">June 1</span>.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-amber-300 bg-white/80 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
            Launching June 1
          </span>
        </div>
      </div>

      <header className="border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Paintbrush className="h-5 w-5" />
            <span>PaintFlow</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-neutral-600">
            {storefrontNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-neutral-950"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}