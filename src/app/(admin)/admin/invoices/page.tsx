import { recentInvoices } from "@/lib/dummy-data/dashboard";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminInvoicesPage() {
  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          Invoice History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-neutral-950">{invoice.id}</p>
              <p className="text-sm text-neutral-500">{invoice.customer}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
                {invoice.status}
              </Badge>
              <span className="text-sm text-neutral-500">{invoice.date}</span>
              <span className="font-semibold text-neutral-950">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}