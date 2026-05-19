import Link from "next/link";
import { ArrowLeft, LockKeyhole, Paintbrush } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
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
          <Card className="w-full max-w-md rounded-[2rem] border-black/5 bg-white/90 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur">
            <CardHeader className="space-y-4 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Secure Admin Entry
                </p>
                <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                  Sign in to dashboard
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@paintflow.com"
                  className="h-12 rounded-xl border-black/10 bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm font-medium text-amber-700 transition-colors hover:text-amber-800"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-12 rounded-xl border-black/10 bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-neutral-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 accent-amber-700"
                  />
                  Remember me
                </label>

                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  UI Preview
                </span>
              </div>

              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-xl bg-neutral-950 text-white hover:bg-neutral-800"
              >
                <Link href="/admin">Sign In</Link>
              </Button>

              <p className="text-sm leading-6 text-neutral-500">
                This is currently a frontend login preview. Secure authentication
                and role-based access will be connected in a later phase.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}