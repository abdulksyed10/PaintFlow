"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { repositories } from "@/data/repositories";
import type { InvoiceStatus, QuoteStatus } from "@/data/models";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function toDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toStatusLabel(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInvoiceBadgeVariant(status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "overdue" || status === "void") return "destructive";
  if (status === "draft") return "outline";
  return "secondary";
}

function getQuoteBadgeVariant(status: QuoteStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "accepted") return "default";
  if (status === "declined" || status === "closed") return "destructive";
  if (status === "new") return "outline";
  return "secondary";
}

export function ReportsDashboard() {
  const products = useLiveQuery(() => repositories.products.getAll(), [], []);
  const variants = useLiveQuery(() => repositories.productVariants.getAll(), [], []);
  const inventory = useLiveQuery(() => repositories.inventory.getAll(), [], []);
  const salesInvoices = useLiveQuery(() => repositories.salesInvoices.getAll(), [], []);
  const purchaseInvoices = useLiveQuery(() => repositories.purchaseInvoices.getAll(), [], []);
  const salesInvoiceItems = useLiveQuery(() => repositories.salesInvoiceItems.getAll(), [], []);
  const quoteRequests = useLiveQuery(() => repositories.quoteRequests.getAll(), [], []);
  const payments = useLiveQuery(() => repositories.payments.getAll(), [], []);
  const customers = useLiveQuery(() => repositories.customers.getAll(), [], []);
  const suppliers = useLiveQuery(() => repositories.suppliers.getAll(), [], []);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const variantMap = useMemo(() => new Map(variants.map((variant) => [variant.id, variant])), [variants]);

  const metrics = useMemo(() => {
    const revenue = salesInvoices.reduce((total, invoice) => total + invoice.grandTotal, 0);
    const received = salesInvoices.reduce((total, invoice) => total + invoice.amountPaid, 0);
    const salesBalance = salesInvoices.reduce((total, invoice) => total + invoice.balanceDue, 0);
    const purchases = purchaseInvoices.reduce((total, invoice) => total + invoice.grandTotal, 0);
    const paymentsTotal = payments.reduce((total, payment) => total + payment.amount, 0);
    const stockValue = products.reduce((total, product) => total + product.stock * product.price, 0);
    const lowStockProducts = products.filter((product) => product.stock <= (product.lowStockThreshold ?? 0));
    const activeQuotes = quoteRequests.filter((quote) => ["new", "contacted", "preparing quote", "quoted"].includes(quote.status));
    const paidInvoices = salesInvoices.filter((invoice) => invoice.status === "paid").length;
    const overdueInvoices = salesInvoices.filter((invoice) => invoice.status === "overdue").length;

    return {
      revenue,
      received,
      salesBalance,
      purchases,
      paymentsTotal,
      stockValue,
      lowStockProducts,
      activeQuotes,
      paidInvoices,
      overdueInvoices,
    };
  }, [payments, products, purchaseInvoices, quoteRequests, salesInvoices]);

  const recentMovements = useMemo(
    () =>
      [...inventory]
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
        .slice(0, 8)
        .map((movement) => {
          const variant = variantMap.get(movement.productVariantId);
          const product = variant ? productMap.get(variant.productId) : undefined;

          return {
            movement,
            productName: product?.name ?? "Unknown product",
            variantLabel: variant?.label ?? `${variant?.size ?? ""} ${variant?.unit ?? ""}`.trim(),
          };
        }),
    [inventory, productMap, variantMap]
  );

  const topProducts = useMemo(() => {
    const quantitiesByProduct = new Map<string, number>();

    for (const item of salesInvoiceItems) {
      const current = quantitiesByProduct.get(item.productId) ?? 0;
      quantitiesByProduct.set(item.productId, current + item.quantity);
    }

    return [...quantitiesByProduct.entries()]
      .map(([productId, sold]) => ({
        product: productMap.get(productId),
        sold,
      }))
      .filter((entry) => Boolean(entry.product))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);
  }, [productMap, salesInvoiceItems]);

  const recentInvoices = useMemo(
    () =>
      [...salesInvoices]
        .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
        .slice(0, 6),
    [salesInvoices]
  );

  const recentQuotes = useMemo(
    () =>
      [...quoteRequests]
        .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
        .slice(0, 6),
    [quoteRequests]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Sales Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(metrics.revenue)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(metrics.received)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Open Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-amber-700">{formatCurrency(metrics.salesBalance)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(metrics.stockValue)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-black/5 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Sold Qty</th>
                  <th className="px-3 py-3 font-medium">Current Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((entry) => (
                  <tr key={entry.product!.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-3 py-4">
                      <p className="font-medium text-neutral-950">{entry.product!.name}</p>
                      <p className="text-xs text-neutral-500">{entry.product!.brand}</p>
                    </td>
                    <td className="px-3 py-4 text-neutral-700">{entry.sold}</td>
                    <td className="px-3 py-4 text-neutral-700">{entry.product!.stock}</td>
                    <td className="px-3 py-4">
                      <Badge variant={entry.product!.stock <= (entry.product!.lowStockThreshold ?? 0) ? "destructive" : "secondary"}>
                        {entry.product!.stock <= (entry.product!.lowStockThreshold ?? 0) ? "Low" : "Healthy"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-10 text-center text-neutral-500">
                      No sales items yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Operational Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Products</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{products.length}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Low Stock</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{metrics.lowStockProducts.length}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Customers</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{customers.length}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Suppliers</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{suppliers.length}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Paid Invoices</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{metrics.paidInvoices}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Overdue Invoices</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{metrics.overdueInvoices}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4 sm:col-span-2">
              <p className="text-sm text-neutral-500">Open Quotes</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{metrics.activeQuotes.length}</p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4 sm:col-span-2">
              <p className="text-sm text-neutral-500">Payments Recorded</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(metrics.paymentsTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Recent Inventory Movements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-black/5 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">When</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Qty</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((row) => (
                  <tr key={row.movement.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-3 py-4 text-neutral-600">{toDateLabel(row.movement.occurredAt)}</td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-neutral-950">{row.productName}</p>
                      <p className="text-xs text-neutral-500">{row.variantLabel}</p>
                    </td>
                    <td className="px-3 py-4 text-neutral-700">{row.movement.quantity > 0 ? `+${row.movement.quantity}` : row.movement.quantity}</td>
                    <td className="px-3 py-4 text-neutral-700">{toStatusLabel(row.movement.movementType)}</td>
                  </tr>
                ))}
                {recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-10 text-center text-neutral-500">
                      No movements recorded yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-black/5 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Project</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-3 py-4">
                      <p className="font-medium text-neutral-950">{quote.customerName}</p>
                      <p className="text-xs text-neutral-500">{quote.phone}</p>
                    </td>
                    <td className="px-3 py-4 text-neutral-700">{toStatusLabel(quote.projectType)}</td>
                    <td className="px-3 py-4">
                      <Badge variant={getQuoteBadgeVariant(quote.status)}>{toStatusLabel(quote.status)}</Badge>
                    </td>
                    <td className="px-3 py-4 text-neutral-600">{toDateLabel(quote.createdAt ?? new Date().toISOString())}</td>
                  </tr>
                ))}
                {recentQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-10 text-center text-neutral-500">
                      No quote requests yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Recent Sales Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-black/5 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Invoice</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-3 py-4 font-medium text-neutral-950">{invoice.invoiceNumber}</td>
                    <td className="px-3 py-4 text-neutral-700">{invoice.customerName}</td>
                    <td className="px-3 py-4">
                      <Badge variant={getInvoiceBadgeVariant(invoice.status)}>{toStatusLabel(invoice.status)}</Badge>
                    </td>
                    <td className="px-3 py-4 text-neutral-700">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="px-3 py-4 text-amber-700">{formatCurrency(invoice.balanceDue)}</td>
                  </tr>
                ))}
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-neutral-500">
                      No sales invoices yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-black/5 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Brand</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-3 py-4 font-medium text-neutral-950">{product.name}</td>
                    <td className="px-3 py-4 text-neutral-700">{product.brand}</td>
                    <td className="px-3 py-4 text-neutral-700">{product.stock}</td>
                    <td className="px-3 py-4 text-neutral-700">{product.lowStockThreshold ?? 0}</td>
                  </tr>
                ))}
                {metrics.lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-10 text-center text-neutral-500">
                      No low stock alerts.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
