import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Paintbrush } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

type AdminLoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifyAdminSessionToken(sessionToken) : null;

  if (session) {
    redirect("/admin");
  }

  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams?.next || "/admin";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_28%),linear-gradient(to_bottom,#fafaf9,#f5f5f4)] px-6 py-10 text-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:min-h-[80vh] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to storefront
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur">
            <Paintbrush className="h-4 w-4 text-amber-700" />
            PaintFlow Admin Access
          </div>

          <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl">
            Manage products, stock, and invoices from one place.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
            This admin area is designed for internal store operations, including
            product management, inventory tracking, billing workflows, and future
            business reporting.
          </p>

          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-neutral-500">Products</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">
                Add and manage inventory items
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-neutral-500">Operations</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">
                Access invoices, stock, and workflows
              </p>
            </div>
          </div>
        </div>

        <div className="lg:justify-self-end">
          <AdminLoginForm nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}