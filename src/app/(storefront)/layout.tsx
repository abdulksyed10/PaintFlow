import Link from "next/link";
import { Hammer, Paintbrush } from "lucide-react";
import { storefrontNav } from "@/lib/nav";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.08),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(45,212,191,0.08),_transparent_20%),linear-gradient(to_bottom,_#fffdf9,_#fff8f3)] text-slate-950">
      <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-100 via-orange-50 to-teal-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 text-base text-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm">
              <Hammer className="h-4.5 w-4.5" />
            </span>
            <p className="leading-6">
              Preview build — PaintFlow is currently being refined. Full launch on{" "}
              <span className="font-semibold">August 20</span>.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-amber-300/80 bg-white/75 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm backdrop-blur">
            Launching August 20
          </span>
        </div>
      </div>

      <header className="border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-teal-400 text-white shadow-sm">
              <Paintbrush className="h-4.5 w-4.5" />
            </span>
            <span>PaintFlow</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-slate-600">
            {storefrontNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-orange-600"
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