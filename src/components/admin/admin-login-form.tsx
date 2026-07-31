"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Paintbrush } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("demo.owner");
  const [password, setPassword] = useState("PaintFlow@123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(error?.message ?? "Unable to sign in");
      }

      toast.success("Signed in");
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or username</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="demo.owner"
              className="h-12 rounded-xl border-black/10 bg-white"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-xl border-black/10 bg-white"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-neutral-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 accent-amber-700"
                defaultChecked
              />
              Remember me
            </label>

            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Local auth
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl bg-neutral-950 text-white hover:bg-neutral-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-sm leading-6 text-neutral-500">
            Try <span className="font-medium text-neutral-700">demo.owner</span> with the password
            <span className="font-medium text-neutral-700"> PaintFlow@123</span>.
          </p>
        </form>

        <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2 font-medium text-neutral-900">
            <Paintbrush className="h-4 w-4 text-amber-700" />
            Local session mode
          </div>
          <p className="mt-2 leading-6">
            Access is protected with a signed session cookie so the admin area is blocked before it
            loads.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
