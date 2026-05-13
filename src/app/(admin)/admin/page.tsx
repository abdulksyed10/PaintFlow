import { dashboardStats, lowStockProducts, recentInvoices } from "@/lib/dummy-data/dashboard";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="rounded-2xl border-black/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
              <p className="mt-2 text-sm text-neutral-500">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-xl border border-black/5 bg-neutral-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-neutral-950">{invoice.id}</p>
                  <p className="text-sm text-neutral-500">{invoice.customer}</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                  <p className="text-sm text-neutral-500">
                    {invoice.status} • {invoice.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-black/5 bg-neutral-50 px-4 py-3"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-neutral-500">
                    {product.brand} • Stock: {product.stock}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No low stock items right now.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}