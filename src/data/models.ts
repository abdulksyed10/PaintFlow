export type EntityId = string;

export type EntityStatus = "active" | "inactive";

export type Role = "owner" | "manager" | "sales";

export type Permission =
  | "manage_users"
  | "manage_products"
  | "manage_categories"
  | "manage_brands"
  | "manage_inventory"
  | "create_sales_invoices"
  | "edit_sales_invoices"
  | "void_invoices"
  | "manage_purchases"
  | "manage_customers"
  | "manage_suppliers"
  | "view_reports"
  | "view_profit"
  | "manage_settings"
  | "export_data"
  | "import_data"
  | "adjust_stock"
  | "delete_products"
  | "view_invoice_history";

export type ProductClassification = "interior" | "exterior" | "general";

export type ProductFinish =
  | "matte"
  | "satin"
  | "silk"
  | "sheen"
  | "gloss"
  | "high gloss"
  | "textured"
  | "base coat"
  | "custom";

export type InventoryMovementType =
  | "opening stock"
  | "purchase"
  | "sale"
  | "sales return"
  | "purchase return"
  | "manual adjustment increase"
  | "manual adjustment decrease"
  | "damaged"
  | "leaked"
  | "expired"
  | "correction";

export type InvoiceStatus = "draft" | "finalized" | "partially paid" | "paid" | "overdue" | "void";

export type QuoteStatus =
  | "new"
  | "contacted"
  | "preparing quote"
  | "quoted"
  | "accepted"
  | "declined"
  | "closed";

export type PaymentMethod = "cash" | "upi" | "card" | "bank transfer" | "credit" | "other";

export type ProjectType = "interior" | "exterior" | "both" | "other";

export interface EntityMetadata {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isActive?: boolean;
}

export interface Category extends EntityMetadata {
  id: EntityId;
  name: string;
  slug: string;
  description?: string;
  categoryType: ProductClassification | "accessory" | "surface prep" | "base coat";
  storefrontVisible: boolean;
  featured: boolean;
  displayOrder: number;
  imageUrl?: string | null;
}

export interface Brand extends EntityMetadata {
  id: EntityId;
  name: string;
  slug: string;
  description?: string;
  storefrontVisible: boolean;
  featured: boolean;
  displayOrder: number;
  logoUrl?: string | null;
}

export interface Product extends EntityMetadata {
  id: EntityId;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string | null;
  brand: string;
  brandId?: EntityId;
  category: string;
  categoryId?: EntityId;
  classification?: ProductClassification;
  finish?: string;
  size: string;
  unit: string;
  price: number;
  stock: number;
  recommendedSurfaces?: string[];
  useCases?: string[];
  tintable: boolean;
  status: "active" | "inactive";
  isFeatured?: boolean;
  isVisibleOnStorefront?: boolean;
  image?: string;
  imageIds?: string[];
  shortDescription?: string;
  description?: string;
  lowStockThreshold?: number;
  variantIds?: string[];
}

export interface ProductVariant extends EntityMetadata {
  id: EntityId;
  productId: EntityId;
  label?: string;
  size: number;
  unit: string;
  sku: string;
  barcode?: string | null;
  purchasePrice: number;
  regularSellingPrice: number;
  salePrice?: number | null;
  gstRate: number;
  currentStock: number;
  lowStockThreshold: number;
  status: EntityStatus;
}

export interface ProductImage extends EntityMetadata {
  id: EntityId;
  productId: EntityId;
  blobKey: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  mimeType?: string;
  fileName?: string;
}

export interface ShadeCollection extends EntityMetadata {
  id: EntityId;
  brandId?: EntityId | null;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  storefrontVisible: boolean;
  displayOrder: number;
}

export interface Shade extends EntityMetadata {
  id: EntityId;
  collectionId?: EntityId | null;
  productId?: EntityId | null;
  code: string;
  name: string;
  hex: string;
  imageUrl?: string | null;
  red?: number;
  green?: number;
  blue?: number;
  notes?: string;
  isCustom: boolean;
}

export interface InventoryMovement extends EntityMetadata {
  id: EntityId;
  productVariantId: EntityId;
  quantity: number;
  movementType: InventoryMovementType;
  referenceNumber?: string;
  linkedInvoiceId?: EntityId | null;
  reason?: string;
  employeeId?: EntityId | null;
  occurredAt: string;
}

export interface Customer extends EntityMetadata {
  id: EntityId;
  name: string;
  phone: string;
  email?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  gstin?: string;
  customerType?: string;
  notes?: string;
  openingBalance: number;
}

export interface Supplier extends EntityMetadata {
  id: EntityId;
  companyName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  openingBalance: number;
}

export interface SalesInvoice extends EntityMetadata {
  id: EntityId;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  customerId?: EntityId | null;
  customerName: string;
  customerPhone?: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
}

export interface SalesInvoiceItem extends EntityMetadata {
  id: EntityId;
  salesInvoiceId: EntityId;
  productId: EntityId;
  productVariantId: EntityId;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  itemDiscount: number;
  gstRate: number;
  taxAmount: number;
  lineTotal: number;
  shadeCode?: string;
  shadeName?: string;
  shadeHex?: string;
  shadeNotes?: string;
}

export interface PurchaseInvoice extends EntityMetadata {
  id: EntityId;
  invoiceNumber: string;
  supplierId?: EntityId | null;
  supplierName: string;
  supplierInvoiceNumber?: string;
  internalReference?: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: InvoiceStatus;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
}

export interface PurchaseInvoiceItem extends EntityMetadata {
  id: EntityId;
  purchaseInvoiceId: EntityId;
  productId: EntityId;
  productVariantId: EntityId;
  productName: string;
  variantLabel: string;
  quantity: number;
  purchaseCost: number;
  gstRate: number;
  lineTotal: number;
}

export interface Payment extends EntityMetadata {
  id: EntityId;
  invoiceType: "sales" | "purchase";
  invoiceId: EntityId;
  amount: number;
  method: PaymentMethod;
  recordedAt: string;
  referenceNumber?: string;
  notes?: string;
}

export interface QuoteRequest extends EntityMetadata {
  id: EntityId;
  customerName: string;
  phone: string;
  email?: string;
  location?: string;
  projectType: ProjectType;
  selectedProductIds: string[];
  selectedVariantIds: string[];
  shadeCode?: string;
  shadeName?: string;
  shadeHex?: string;
  estimatedQuantity?: string;
  message?: string;
  preferredContactMethod?: PaymentMethod | "whatsapp" | "call" | "email";
  status: QuoteStatus;
  notes?: string;
}

export interface AuditLog extends EntityMetadata {
  id: EntityId;
  entityType: string;
  entityId: EntityId;
  action: string;
  summary: string;
  userId?: EntityId;
  userName?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface BusinessSettings extends EntityMetadata {
  id: EntityId;
  shopName: string;
  legalName: string;
  logoUrl?: string | null;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  state: string;
  invoicePrefix: string;
  currency: string;
  financialYearStartMonth: number;
  gstRegistered: boolean;
  defaultTaxRate: number;
  inclusivePricing: boolean;
  cgstSgstEnabled: boolean;
  invoiceFooter: string;
  terms: string;
  showPricesOnStorefront: boolean;
}

export interface StorefrontSettings extends EntityMetadata {
  id: EntityId;
  heroHeading: string;
  heroDescription: string;
  contactInfo: string;
  whatsappNumber: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  featuredCategoryIds: string[];
  featuredBrandIds: string[];
  launchBannerEnabled: boolean;
  launchBannerText: string;
  announcementDate: string;
  quoteRequestEnabled: boolean;
}

export interface User extends EntityMetadata {
  id: EntityId;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  role: Role;
  permissions: Permission[];
  phone?: string;
}

export interface SystemMetaEntry {
  key: string;
  value: string;
}

export interface DemoSeedSnapshot {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  productVariants: ProductVariant[];
  productImages: ProductImage[];
  shadeCollections: ShadeCollection[];
  shades: Shade[];
  inventoryMovements: InventoryMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  salesInvoices: SalesInvoice[];
  salesInvoiceItems: SalesInvoiceItem[];
  purchaseInvoices: PurchaseInvoice[];
  purchaseInvoiceItems: PurchaseInvoiceItem[];
  payments: Payment[];
  quoteRequests: QuoteRequest[];
  auditLogs: AuditLog[];
  users: User[];
  businessSettings: BusinessSettings[];
  storefrontSettings: StorefrontSettings[];
  systemMeta: SystemMetaEntry[];
}
