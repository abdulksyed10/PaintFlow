import { products } from "@/lib/dummy-data/products";

export const dashboardStats = [
  {
    title: "Total Products",
    value: products.length.toString(),
    change: "+12 this month",
  },
  {
    title: "Low Stock Items",
    value: products.filter(
      (product) => product.stock <= (product.lowStockThreshold ?? 0)
    ).length.toString(),
    change: "Needs attention",
  },
  {
    title: "Today's Sales",
    value: "₹12,480",
    change: "+8.2% vs yesterday",
  },
  {
    title: "Invoices This Week",
    value: "34",
    change: "+5 new",
  },
];

export const recentInvoices = [
  {
    id: "INV-1001",
    customer: "Rahul Constructions",
    amount: 8240,
    status: "Paid",
    date: "Today",
  },
  {
    id: "INV-1002",
    customer: "Sri Lakshmi Interiors",
    amount: 5120,
    status: "Pending",
    date: "Today",
  },
  {
    id: "INV-0998",
    customer: "Mahesh Kumar",
    amount: 2380,
    status: "Paid",
    date: "Yesterday",
  },
];

export const lowStockProducts = products.filter(
  (product) => product.stock <= (product.lowStockThreshold ?? 0)
);