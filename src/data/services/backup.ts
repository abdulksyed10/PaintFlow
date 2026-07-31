import type { DemoSeedSnapshot } from "@/data/models";
import { localDatabase } from "@/data/db";
import { localCollections, writableCollections } from "@/data/services/table-list";

export interface LocalBackupPayload extends DemoSeedSnapshot {
  version: string;
  exportedAt: string;
}

async function clearAllLocalData() {
  await localDatabase.transaction("rw", writableCollections, async () => {
    await Promise.all(writableCollections.map((collection) => collection.clear()));
  });
}

export async function resetLocalData() {
  await clearAllLocalData();
}

export async function exportLocalData(): Promise<LocalBackupPayload> {
  return {
    version: "1",
    exportedAt: new Date().toISOString(),
    categories: await localCollections.categories.toArray(),
    brands: await localCollections.brands.toArray(),
    products: await localCollections.products.toArray(),
    productVariants: await localCollections.productVariants.toArray(),
    productImages: await localCollections.productImages.toArray(),
    shadeCollections: await localCollections.shadeCollections.toArray(),
    shades: await localCollections.shades.toArray(),
    inventoryMovements: await localCollections.inventoryMovements.toArray(),
    customers: await localCollections.customers.toArray(),
    suppliers: await localCollections.suppliers.toArray(),
    salesInvoices: await localCollections.salesInvoices.toArray(),
    salesInvoiceItems: await localCollections.salesInvoiceItems.toArray(),
    purchaseInvoices: await localCollections.purchaseInvoices.toArray(),
    purchaseInvoiceItems: await localCollections.purchaseInvoiceItems.toArray(),
    payments: await localCollections.payments.toArray(),
    quoteRequests: await localCollections.quoteRequests.toArray(),
    auditLogs: await localCollections.auditLogs.toArray(),
    users: await localCollections.users.toArray(),
    businessSettings: await localCollections.businessSettings.toArray(),
    storefrontSettings: await localCollections.storefrontSettings.toArray(),
    systemMeta: await localCollections.systemMeta.toArray(),
  };
}

export async function importLocalData(snapshot: LocalBackupPayload) {
  if (snapshot.version !== "1") {
    throw new Error(`Unsupported backup version: ${snapshot.version}`);
  }

  await clearAllLocalData();

  await localDatabase.transaction("rw", writableCollections, async () => {
    await localCollections.categories.bulkPut(snapshot.categories);
    await localCollections.brands.bulkPut(snapshot.brands);
    await localCollections.products.bulkPut(snapshot.products);
    await localCollections.productVariants.bulkPut(snapshot.productVariants);
    await localCollections.productImages.bulkPut(snapshot.productImages);
    await localCollections.shadeCollections.bulkPut(snapshot.shadeCollections);
    await localCollections.shades.bulkPut(snapshot.shades);
    await localCollections.inventoryMovements.bulkPut(snapshot.inventoryMovements);
    await localCollections.customers.bulkPut(snapshot.customers);
    await localCollections.suppliers.bulkPut(snapshot.suppliers);
    await localCollections.salesInvoices.bulkPut(snapshot.salesInvoices);
    await localCollections.salesInvoiceItems.bulkPut(snapshot.salesInvoiceItems);
    await localCollections.purchaseInvoices.bulkPut(snapshot.purchaseInvoices);
    await localCollections.purchaseInvoiceItems.bulkPut(snapshot.purchaseInvoiceItems);
    await localCollections.payments.bulkPut(snapshot.payments);
    await localCollections.quoteRequests.bulkPut(snapshot.quoteRequests);
    await localCollections.auditLogs.bulkPut(snapshot.auditLogs);
    await localCollections.users.bulkPut(snapshot.users);
    await localCollections.businessSettings.bulkPut(snapshot.businessSettings);
    await localCollections.storefrontSettings.bulkPut(snapshot.storefrontSettings);
    await localCollections.systemMeta.bulkPut(snapshot.systemMeta);
  });
}
