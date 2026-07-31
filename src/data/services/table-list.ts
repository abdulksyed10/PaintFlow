import { localDatabase } from "@/data/db";

export const localCollections = {
  users: localDatabase.users,
  categories: localDatabase.categories,
  brands: localDatabase.brands,
  products: localDatabase.products,
  productVariants: localDatabase.productVariants,
  productImages: localDatabase.productImages,
  shadeCollections: localDatabase.shadeCollections,
  shades: localDatabase.shades,
  inventoryMovements: localDatabase.inventoryMovements,
  customers: localDatabase.customers,
  suppliers: localDatabase.suppliers,
  salesInvoices: localDatabase.salesInvoices,
  salesInvoiceItems: localDatabase.salesInvoiceItems,
  purchaseInvoices: localDatabase.purchaseInvoices,
  purchaseInvoiceItems: localDatabase.purchaseInvoiceItems,
  payments: localDatabase.payments,
  quoteRequests: localDatabase.quoteRequests,
  auditLogs: localDatabase.auditLogs,
  businessSettings: localDatabase.businessSettings,
  storefrontSettings: localDatabase.storefrontSettings,
  systemMeta: localDatabase.systemMeta,
} as const;

export const writableCollections = Object.values(localCollections);
