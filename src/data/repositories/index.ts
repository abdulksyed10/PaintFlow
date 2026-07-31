import { localDatabase } from "@/data/db";
import type { BusinessSettings, StorefrontSettings } from "@/data/models";
import {
  createDexieRepository,
  type CrudRepository,
  type CreateInput,
  type UpdateInput,
} from "@/data/repositories/create-dexie-repository";

export const categoryRepository = createDexieRepository(localDatabase.categories);
export const brandRepository = createDexieRepository(localDatabase.brands);
export const productRepository = createDexieRepository(localDatabase.products);
export const productVariantRepository = createDexieRepository(localDatabase.productVariants);
export const productImageRepository = createDexieRepository(localDatabase.productImages);
export const shadeCollectionRepository = createDexieRepository(localDatabase.shadeCollections);
export const shadeRepository = createDexieRepository(localDatabase.shades);
export const inventoryRepository = createDexieRepository(localDatabase.inventoryMovements);
export const customerRepository = createDexieRepository(localDatabase.customers);
export const supplierRepository = createDexieRepository(localDatabase.suppliers);
export const salesInvoiceRepository = createDexieRepository(localDatabase.salesInvoices);
export const salesInvoiceItemRepository = createDexieRepository(localDatabase.salesInvoiceItems);
export const purchaseInvoiceRepository = createDexieRepository(localDatabase.purchaseInvoices);
export const purchaseInvoiceItemRepository = createDexieRepository(localDatabase.purchaseInvoiceItems);
export const paymentRepository = createDexieRepository(localDatabase.payments);
export const quoteRequestRepository = createDexieRepository(localDatabase.quoteRequests);
export const auditLogRepository = createDexieRepository(localDatabase.auditLogs);
export const userRepository = createDexieRepository(localDatabase.users);

function createSingletonRepository<TEntity extends { id: string }>(
  tableRepository: CrudRepository<TEntity>,
  recordId: string
) {
  return {
    async get() {
      return tableRepository.getById(recordId);
    },
    async save(input: Partial<Omit<TEntity, "id">>) {
      const existing = await tableRepository.getById(recordId);

      if (!existing) {
        return tableRepository.create({ id: recordId, ...input } as CreateInput<TEntity>);
      }

      return tableRepository.update(recordId, input as UpdateInput<TEntity>);
    },
  };
}

export const businessSettingsRepository = createSingletonRepository<BusinessSettings>(
  createDexieRepository(localDatabase.businessSettings),
  "business-settings"
);

export const storefrontSettingsRepository = createSingletonRepository<StorefrontSettings>(
  createDexieRepository(localDatabase.storefrontSettings),
  "storefront-settings"
);

export const repositories = {
  categories: categoryRepository,
  brands: brandRepository,
  products: productRepository,
  productVariants: productVariantRepository,
  productImages: productImageRepository,
  shadeCollections: shadeCollectionRepository,
  shades: shadeRepository,
  inventory: inventoryRepository,
  customers: customerRepository,
  suppliers: supplierRepository,
  salesInvoices: salesInvoiceRepository,
  salesInvoiceItems: salesInvoiceItemRepository,
  purchaseInvoices: purchaseInvoiceRepository,
  purchaseInvoiceItems: purchaseInvoiceItemRepository,
  payments: paymentRepository,
  quoteRequests: quoteRequestRepository,
  auditLogs: auditLogRepository,
  users: userRepository,
  settings: {
    business: businessSettingsRepository,
    storefront: storefrontSettingsRepository,
  },
} as const;
