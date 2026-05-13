import {
  Boxes,
  LayoutDashboard,
  Package,
  ReceiptText,
} from "lucide-react";

export const adminNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Inventory", href: "/admin/inventory", icon: Boxes },
  { title: "Invoices", href: "/admin/invoices", icon: ReceiptText },
];

export const storefrontNav = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
];