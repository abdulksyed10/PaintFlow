import Link from "next/link";
import { Paintbrush } from "lucide-react";
import { adminNav } from "@/lib/nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-black/5 bg-white">
          <div className="flex h-16 items-center border-b border-black/5 px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Paintbrush className="h-5 w-5" />
              <span>PaintFlow</span>
            </Link>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {adminNav.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="flex h-16 items-center justify-between border-b border-black/5 bg-white px-6">
            <div>
              <p className="text-sm text-neutral-500">Admin Dashboard</p>
              <h1 className="text-base font-semibold tracking-tight text-neutral-950">
                Paint shop operations overview
              </h1>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}