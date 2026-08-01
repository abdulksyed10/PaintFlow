"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import type { QuoteStatus } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function toDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toLabel(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBadgeVariant(status: QuoteStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "accepted") return "default";
  if (status === "declined" || status === "closed") return "destructive";
  if (status === "new") return "outline";
  return "secondary";
}

export function QuoteAdminDashboard() {
  const [search, setSearch] = useState("");
  const quotes = useLiveQuery(() => repositories.quoteRequests.getAll(), [], []);
  const products = useLiveQuery(() => repositories.products.getAll(), [], []);
  const variants = useLiveQuery(() => repositories.productVariants.getAll(), [], []);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [...quotes].sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime());

    return quotes
      .filter((quote) => {
        return (
          quote.customerName.toLowerCase().includes(query) ||
          quote.phone.toLowerCase().includes(query) ||
          quote.status.toLowerCase().includes(query) ||
          (quote.location ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime());
  }, [quotes, search]);

  const summary = useMemo(() => {
    return quotes.reduce(
      (acc, quote) => {
        acc.total += 1;
        acc[quote.status] = (acc[quote.status] ?? 0) + 1;
        return acc;
      },
      {
        total: 0,
        new: 0,
        contacted: 0,
        "preparing quote": 0,
        quoted: 0,
        accepted: 0,
        declined: 0,
        closed: 0,
      } as Record<string, number>
    );
  }, [quotes]);

  async function updateQuote(id: string, patch: Partial<{ status: QuoteStatus; notes: string }>) {
    try {
      await repositories.quoteRequests.update(id, patch);
      toast.success("Quote updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update quote");
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: summary.total },
          { label: "New", value: summary.new },
          { label: "Quoted", value: summary.quoted },
          { label: "Accepted", value: summary.accepted },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-black/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border-black/5 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold tracking-tight">Quote Queue</CardTitle>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, phone, location, or status"
            className="max-w-md"
          />
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-black/5 text-neutral-500">
              <tr>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Project</th>
                <th className="px-3 py-3 font-medium">Products</th>
                <th className="px-3 py-3 font-medium">Variants</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Notes</th>
                <th className="px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => {
                const productNames = quote.selectedProductIds
                  .map((id) => products.find((entry) => entry.id === id)?.name)
                  .filter(Boolean)
                  .join(", ");
                const variantNames = quote.selectedVariantIds
                  .map((id) => {
                    const variant = variants.find((entry) => entry.id === id);
                    const product = variant ? products.find((entry) => entry.id === variant.productId) : undefined;
                    return product ? `${product.name} - ${variant?.label ?? `${variant?.size} ${variant?.unit}`}` : undefined;
                  })
                  .filter(Boolean)
                  .join(", ");

                return (
                  <tr key={quote.id} className="border-b border-black/5 last:border-b-0 align-top">
                    <td className="px-3 py-4">
                      <p className="font-medium text-neutral-950">{quote.customerName}</p>
                      <p className="text-xs text-neutral-500">{quote.phone}</p>
                      <p className="text-xs text-neutral-500">{quote.location ?? "No location"}</p>
                      <p className="mt-1 text-xs text-neutral-500">{toDateLabel(quote.createdAt ?? new Date().toISOString())}</p>
                    </td>
                    <td className="px-3 py-4 text-neutral-700">{toLabel(quote.projectType)}</td>
                    <td className="px-3 py-4 text-neutral-700">{productNames || "-"}</td>
                    <td className="px-3 py-4 text-neutral-700">{variantNames || "-"}</td>
                    <td className="px-3 py-4">
                      <Badge variant={getBadgeVariant(quote.status)}>{toLabel(quote.status)}</Badge>
                    </td>
                    <td className="px-3 py-4">
                      <Textarea
                        rows={4}
                        defaultValue={quote.notes ?? ""}
                        onBlur={(event) => updateQuote(quote.id, { notes: event.target.value })}
                        placeholder="Internal notes"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        <select
                          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                          value={quote.status}
                          onChange={(event) => updateQuote(quote.id, { status: event.target.value as QuoteStatus })}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="preparing quote">Preparing Quote</option>
                          <option value="quoted">Quoted</option>
                          <option value="accepted">Accepted</option>
                          <option value="declined">Declined</option>
                          <option value="closed">Closed</option>
                        </select>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => updateQuote(quote.id, { status: "contacted" })}>
                            Contacted
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => updateQuote(quote.id, { status: "quoted" })}>
                            Mark Quoted
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredQuotes.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-neutral-500" colSpan={7}>
                    No quote requests yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
