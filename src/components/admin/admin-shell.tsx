"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Paintbrush } from "lucide-react";

import { adminNav } from "@/lib/nav";
import type { AdminSession } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function getSectionTitle(pathname: string) {
  const navItem = adminNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return navItem?.title ?? "Dashboard";
}

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const sectionTitle = getSectionTitle(pathname);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
      router.replace("/admin-login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-black/5 bg-white lg:block">
          <div className="flex h-16 items-center border-b border-black/5 px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <Paintbrush className="h-4.5 w-4.5" />
              </span>
              <span>PaintFlow</span>
            </Link>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-700"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="flex h-16 items-center justify-between gap-4 border-b border-black/5 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open admin navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-70 p-0">
                  <SheetHeader className="border-b border-black/5 px-6 py-4 text-left">
                    <SheetTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                        <Paintbrush className="h-4.5 w-4.5" />
                      </span>
                      PaintFlow Admin
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col gap-1 p-4">
                    {adminNav.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-orange-50 text-orange-700"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              <div>
                <p className="text-sm text-neutral-500">Admin Dashboard</p>
                <h1 className="text-base font-semibold tracking-tight text-neutral-950">
                  {sectionTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-neutral-950">{session.displayName}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{session.role}</p>
              </div>

              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
