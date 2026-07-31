import { localDatabase } from "@/data/db";
import { DEMO_SEED_VERSION, buildDemoSeedSnapshot } from "@/data/seed/demo-data";
import { localCollections, writableCollections } from "@/data/services/table-list";

export async function seedDemoData() {
  const snapshot = await buildDemoSeedSnapshot();

  await localDatabase.transaction("rw", writableCollections, async () => {
    await Promise.all(writableCollections.map((collection) => collection.clear()));

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

export async function ensureDemoData() {
  const seedVersion = await localCollections.systemMeta.get("seedVersion");

  if (seedVersion?.value === DEMO_SEED_VERSION) {
    return;
  }

  await seedDemoData();
}
