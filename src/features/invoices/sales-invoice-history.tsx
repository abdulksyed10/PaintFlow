"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { repositories } from "@/data/repositories";
import type { InvoiceStatus } from "@/data/models";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function toDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusBadgeVariant(status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "overdue" || status === "void") return "destructive";
  if (status === "draft") return "outline";
  return "secondary";
}

function toStatusLabel(status: InvoiceStatus) {
  return status
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function SalesInvoiceHistory() {
  const [search, setSearch] = useState("");
  const invoices = useLiveQuery(() => repositories.salesInvoices.getAll(), [], []);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort(
      (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    );
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sortedInvoices;

    return sortedInvoices.filter((invoice) => {
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query)
      );
    });
  }, [search, sortedInvoices]);

  const summary = useMemo(() => {
    return sortedInvoices.reduce(
      (acc, invoice) => {
        acc.total += invoice.grandTotal;
        acc.received += invoice.amountPaid;
        acc.balance += invoice.balanceDue;
        if (invoice.status === "overdue") {
          acc.overdue += 1;
        }
        return acc;
      },
      {
        total: 0,
        received: 0,
        balance: 0,
        overdue: 0,
      }
    );
  }, [sortedInvoices]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{sortedInvoices.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Gross Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight">{formatCurrency(summary.total)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Amount Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight text-emerald-700">{formatCurrency(summary.received)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight text-amber-700">{formatCurrency(summary.balance)}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-black/5 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold tracking-tight">Sales Invoice History</CardTitle>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by invoice number, customer, or status"
            className="max-w-md"
          />
        </CardHeader>

        <CardContent className="space-y-3 overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-black/5 text-neutral-500">
              <tr>
                <th className="px-3 py-3 font-medium">Invoice</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Grand Total</th>
                <th className="px-3 py-3 font-medium">Paid</th>
                <th className="px-3 py-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-3 py-4 font-medium text-neutral-950">{invoice.invoiceNumber}</td>
                  <td className="px-3 py-4 text-neutral-600">{toDateLabel(invoice.invoiceDate)}</td>
                  <td className="px-3 py-4 text-neutral-700">{invoice.customerName}</td>
                  <td className="px-3 py-4">
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {toStatusLabel(invoice.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-neutral-800">{formatCurrency(invoice.grandTotal)}</td>
                  <td className="px-3 py-4 text-emerald-700">{formatCurrency(invoice.amountPaid)}</td>
                  <td className="px-3 py-4 text-amber-700">{formatCurrency(invoice.balanceDue)}</td>
                </tr>
              ))}
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-neutral-500" colSpan={7}>
                    No invoices matched your search.
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
