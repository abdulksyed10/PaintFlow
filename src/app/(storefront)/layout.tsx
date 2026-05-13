import Link from "next/link";
import { Paintbrush } from "lucide-react";
import { storefrontNav } from "@/lib/nav";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
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