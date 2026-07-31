import { demoProducts, demoSalesInvoices } from "@/data/seed/demo-data";
import { formatCurrency } from "@/lib/format";

export const dashboardStats = [
  {
    title: "Total Products",
    value: demoProducts.length.toString(),
    change: "+12 this month",
  },
  {
    title: "Low Stock Items",
    value: demoProducts
      .filter((product) => product.stock <= (product.lowStockThreshold ?? 0))
      .length.toString(),
    change: "Needs attention",
  },
  {
    title: "Today's Sales",
    value: formatCurrency(
      demoSalesInvoices
        .filter((invoice) => invoice.status === "paid")
        .reduce((total, invoice) => total + invoice.grandTotal, 0)
    ),
    change: "+8.2% vs yesterday",
  },
  {
    title: "Invoices This Week",
    value: demoSalesInvoices.length.toString(),
    change: "+5 new",
  },
];

export const recentInvoices = demoSalesInvoices.map((invoice) => ({
  id: invoice.invoiceNumber,
  customer: invoice.customerName,
  amount: invoice.grandTotal,
  status: invoice.status === "draft" ? "Pending" : invoice.status === "paid" ? "Paid" : "Open",
  date: invoice.invoiceDate === demoSalesInvoices[0]?.invoiceDate ? "Today" : "Yesterday",
}));

export const lowStockProducts = demoProducts.filter(
  (product) => product.stock <= (product.lowStockThreshold ?? 0)
);