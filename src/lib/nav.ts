import {
  Boxes,
  Landmark,
  LayoutDashboard,
  Layers3,
  Package,
  ReceiptText,
} from "lucide-react";

export const adminNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: Layers3 },
  { title: "Brands", href: "/admin/brands", icon: Landmark },
  { title: "Inventory", href: "/admin/inventory", icon: Boxes },
  { title: "Invoices", href: "/admin/invoices", icon: ReceiptText },
];

export const storefrontNav = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
];