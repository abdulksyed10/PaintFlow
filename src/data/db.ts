import Dexie, { type Table } from "dexie";
import type {
  AuditLog,
  Brand,
  BusinessSettings,
  Category,
  Customer,
  InventoryMovement,
  Payment,
  Product,
  ProductImage,
  ProductVariant,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  QuoteRequest,
  SalesInvoice,
  SalesInvoiceItem,
  Shade,
  ShadeCollection,
  StorefrontSettings,
  Supplier,
  SystemMetaEntry,
  User,
} from "@/data/models";

export class PaintFlowDatabase extends Dexie {
  users!: Table<User, string>;
  categories!: Table<Category, string>;
  brands!: Table<Brand, string>;
  products!: Table<Product, string>;
  productVariants!: Table<ProductVariant, string>;
  productImages!: Table<ProductImage, string>;
  shadeCollections!: Table<ShadeCollection, string>;
  shades!: Table<Shade, string>;
  inventoryMovements!: Table<InventoryMovement, string>;
  customers!: Table<Customer, string>;
  suppliers!: Table<Supplier, string>;
  salesInvoices!: Table<SalesInvoice, string>;
  salesInvoiceItems!: Table<SalesInvoiceItem, string>;
  purchaseInvoices!: Table<PurchaseInvoice, string>;
  purchaseInvoiceItems!: Table<PurchaseInvoiceItem, string>;
  payments!: Table<Payment, string>;
  quoteRequests!: Table<QuoteRequest, string>;
  auditLogs!: Table<AuditLog, string>;
  businessSettings!: Table<BusinessSettings, string>;
  storefrontSettings!: Table<StorefrontSettings, string>;
  systemMeta!: Table<SystemMetaEntry, string>;

  constructor() {
    super("paintflow-local");

    this.version(1).stores({
      users: "id, username, email, role, isActive",
      categories: "id, slug, displayOrder, storefrontVisible, isActive",
      brands: "id, slug, displayOrder, storefrontVisible, isActive",
      products: "id, slug, brandId, categoryId, tintable, isVisibleOnStorefront, status, isActive",
      productVariants: "id, productId, sku, status, currentStock, isActive",
      productImages: "id, productId, isPrimary, sortOrder, isActive",
      shadeCollections: "id, brandId, storefrontVisible, displayOrder, isActive",
      shades: "id, collectionId, productId, code, name, isActive",
      inventoryMovements: "id, productVariantId, movementType, occurredAt, linkedInvoiceId, isActive",
      customers: "id, phone, email, isActive",
      suppliers: "id, companyName, phone, email, isActive",
      salesInvoices: "id, invoiceNumber, customerId, status, invoiceDate, isActive",
      salesInvoiceItems: "id, salesInvoiceId, productId, productVariantId, isActive",
      purchaseInvoices: "id, invoiceNumber, supplierId, status, invoiceDate, isActive",
      purchaseInvoiceItems: "id, purchaseInvoiceId, productId, productVariantId, isActive",
      payments: "id, invoiceType, invoiceId, recordedAt, method, isActive",
      quoteRequests: "id, status, phone, email, createdAt, isActive",
      auditLogs: "id, entityType, entityId, action, occurredAt, isActive",
      businessSettings: "id, isActive",
      storefrontSettings: "id, isActive",
      systemMeta: "key",
    });
  }
}

export const localDatabase = new PaintFlowDatabase();
