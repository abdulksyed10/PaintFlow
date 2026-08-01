import {
  Boxes,
  LayoutDashboard,
  Layers3,
  Package,
  Settings2,
  BarChart3,
  Landmark,
  Users,
  Truck,
  ReceiptText,
} from "lucide-react";

export const adminNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: Layers3 },
  { title: "Brands", href: "/admin/brands", icon: Landmark },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Suppliers", href: "/admin/suppliers", icon: Truck },
  { title: "Inventory", href: "/admin/inventory", icon: Boxes },
  { title: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings2 },
];

export const storefrontNav = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
];