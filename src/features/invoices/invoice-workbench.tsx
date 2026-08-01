"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { localDatabase } from "@/data/db";
import { repositories } from "@/data/repositories";
import type {
  InvoiceStatus,
  PaymentMethod,
  ProductVariant,
  PurchaseInvoiceItem,
  SalesInvoiceItem,
  InventoryMovement,
  Payment,
} from "@/data/models";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type SalesLineDraft = {
  id: string;
  productVariantId: string;
  quantity: string;
  unitPrice: string;
  itemDiscount: string;
  gstRate: string;
};

type PurchaseLineDraft = {
  id: string;
  productVariantId: string;
  quantity: string;
  purchaseCost: string;
  gstRate: string;
};

type InvoiceTab = "sales" | "purchase";

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function toInvoiceDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusBadgeVariant(status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "overdue" || status === "void") return "destructive";
  if (status === "draft") return "outline";
  return "secondary";
}

function toStatusLabel(status: InvoiceStatus) {
  return status
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildInvoiceNumber(prefix: string, kind: "S" | "P", sequence: number) {
  return `${prefix}${kind}-${String(sequence).padStart(4, "0")}`;
}

function createId() {
  return crypto.randomUUID();
}

function createSalesLineDraft(variant?: ProductVariant, defaultTaxRate = 18): SalesLineDraft {
  return {
    id: createId(),
    productVariantId: variant?.id ?? "",
    quantity: "1",
    unitPrice: String(variant?.regularSellingPrice ?? 0),
    itemDiscount: "0",
    gstRate: String(defaultTaxRate),
  };
}

function createPurchaseLineDraft(variant?: ProductVariant, defaultTaxRate = 18): PurchaseLineDraft {
  return {
    id: createId(),
    productVariantId: variant?.id ?? "",
    quantity: "1",
    purchaseCost: String(variant?.purchasePrice ?? 0),
    gstRate: String(defaultTaxRate),
  };
}

function isPositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

function getSalesLineTotals(line: SalesLineDraft) {
  const quantity = Number(line.quantity);
  const unitPrice = Number(line.unitPrice);
  const itemDiscount = Number(line.itemDiscount);
  const gstRate = Number(line.gstRate);
  const gross = quantity * unitPrice;
  const net = Math.max(0, gross - itemDiscount);
  const taxAmount = roundMoney((net * gstRate) / 100);
  const lineTotal = roundMoney(net + taxAmount);

  return { quantity, unitPrice, itemDiscount, gstRate, net, taxAmount, lineTotal };
}

function getPurchaseLineTotals(line: PurchaseLineDraft) {
  const quantity = Number(line.quantity);
  const purchaseCost = Number(line.purchaseCost);
  const gstRate = Number(line.gstRate);
  const net = quantity * purchaseCost;
  const taxAmount = roundMoney((net * gstRate) / 100);
  const lineTotal = roundMoney(net + taxAmount);

  return { quantity, purchaseCost, gstRate, net, taxAmount, lineTotal };
}

function getInvoiceStatusByAmount(selectedStatus: InvoiceStatus, amountPaid: number, grandTotal: number) {
  if (amountPaid >= grandTotal && grandTotal > 0) {
    return "paid" as InvoiceStatus;
  }

  if (amountPaid > 0 && selectedStatus === "draft") {
    return "partially paid" as InvoiceStatus;
  }

  return selectedStatus;
}

export function InvoiceWorkbench() {
  const [tab, setTab] = useState<InvoiceTab>("sales");

  const businessSettings = useLiveQuery(() => repositories.settings.business.get(), [], undefined);
  const customers = useLiveQuery(() => repositories.customers.getAll(), [], []);
  const suppliers = useLiveQuery(() => repositories.suppliers.getAll(), [], []);
  const products = useLiveQuery(() => repositories.products.getAll(), [], []);
  const variants = useLiveQuery(() => repositories.productVariants.getAll(), [], []);
  const salesInvoices = useLiveQuery(() => repositories.salesInvoices.getAll(), [], []);
  const purchaseInvoices = useLiveQuery(() => repositories.purchaseInvoices.getAll(), [], []);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const variantMap = useMemo(() => new Map(variants.map((variant) => [variant.id, variant])), [variants]);

  const defaultTaxRate = businessSettings?.defaultTaxRate ?? 18;
  const invoicePrefix = businessSettings?.invoicePrefix ?? "PF-";

  const [salesCustomerId, setSalesCustomerId] = useState("");
  const [salesCustomerName, setSalesCustomerName] = useState("");
  const [salesCustomerPhone, setSalesCustomerPhone] = useState("");
  const [salesInvoiceDate, setSalesInvoiceDate] = useState(toDateInputValue(new Date()));
  const [salesDueDate, setSalesDueDate] = useState(toDateInputValue(addDays(new Date(), 7)));
  const [salesStatus, setSalesStatus] = useState<InvoiceStatus>("draft");
  const [salesPaymentMethod, setSalesPaymentMethod] = useState<PaymentMethod>("cash");
  const [salesAmountPaid, setSalesAmountPaid] = useState("0");
  const [salesNotes, setSalesNotes] = useState("");
  const [salesTerms, setSalesTerms] = useState("");
  const [salesLines, setSalesLines] = useState<SalesLineDraft[]>([]);
  const [isSavingSales, setIsSavingSales] = useState(false);

  const [purchaseSupplierId, setPurchaseSupplierId] = useState("");
  const [purchaseSupplierName, setPurchaseSupplierName] = useState("");
  const [purchaseInvoiceDate, setPurchaseInvoiceDate] = useState(toDateInputValue(new Date()));
  const [purchaseDueDate, setPurchaseDueDate] = useState(toDateInputValue(addDays(new Date(), 14)));
  const [purchaseStatus, setPurchaseStatus] = useState<InvoiceStatus>("draft");
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<PaymentMethod>("cash");
  const [purchaseAmountPaid, setPurchaseAmountPaid] = useState("0");
  const [purchaseSupplierInvoiceNumber, setPurchaseSupplierInvoiceNumber] = useState("");
  const [purchaseInternalReference, setPurchaseInternalReference] = useState("");
  const [purchaseNotes, setPurchaseNotes] = useState("");
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLineDraft[]>([]);
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);

  const recentSalesInvoices = useMemo(
    () => [...salesInvoices].sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()).slice(0, 8),
    [salesInvoices]
  );

  const recentPurchaseInvoices = useMemo(
    () => [...purchaseInvoices].sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()).slice(0, 8),
    [purchaseInvoices]
  );

  const salesSummary = useMemo(() => {
    return salesLines.reduce(
      (acc, line) => {
        const totals = getSalesLineTotals(line);
        acc.subtotal += totals.net;
        acc.taxTotal += totals.taxAmount;
        acc.grandTotal += totals.lineTotal;
        return acc;
      },
      { subtotal: 0, taxTotal: 0, grandTotal: 0 }
    );
  }, [salesLines]);

  const purchaseSummary = useMemo(() => {
    return purchaseLines.reduce(
      (acc, line) => {
        const totals = getPurchaseLineTotals(line);
        acc.subtotal += totals.net;
        acc.taxTotal += totals.taxAmount;
        acc.grandTotal += totals.lineTotal;
        return acc;
      },
      { subtotal: 0, taxTotal: 0, grandTotal: 0 }
    );
  }, [purchaseLines]);

  const salesOpenBalance = salesSummary.grandTotal - Number(salesAmountPaid || 0);
  const purchaseOpenBalance = purchaseSummary.grandTotal - Number(purchaseAmountPaid || 0);

  function updateSalesLine(lineId: string, patch: Partial<SalesLineDraft>) {
    setSalesLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  }

  function updatePurchaseLine(lineId: string, patch: Partial<PurchaseLineDraft>) {
    setPurchaseLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  }

  function addSalesLine() {
    setSalesLines((current) => [...current, createSalesLineDraft(variants[0], defaultTaxRate)]);
  }

  function addPurchaseLine() {
    setPurchaseLines((current) => [...current, createPurchaseLineDraft(variants[0], defaultTaxRate)]);
  }

  function removeSalesLine(lineId: string) {
    setSalesLines((current) => (current.length > 1 ? current.filter((line) => line.id !== lineId) : current));
  }

  function removePurchaseLine(lineId: string) {
    setPurchaseLines((current) => (current.length > 1 ? current.filter((line) => line.id !== lineId) : current));
  }

  function syncSalesCustomer(customerId: string) {
    setSalesCustomerId(customerId);

    const customer = customers.find((entry) => entry.id === customerId);

    if (customer) {
      setSalesCustomerName(customer.name);
      setSalesCustomerPhone(customer.phone);
    }
  }

  function syncPurchaseSupplier(supplierId: string) {
    setPurchaseSupplierId(supplierId);

    const supplier = suppliers.find((entry) => entry.id === supplierId);

    if (supplier) {
      setPurchaseSupplierName(supplier.companyName);
    }
  }

  function syncSalesVariant(lineId: string, variantId: string) {
    const variant = variantMap.get(variantId);
    const product = variant ? productMap.get(variant.productId) : undefined;

    updateSalesLine(lineId, {
      productVariantId: variantId,
      unitPrice: String(variant?.regularSellingPrice ?? product?.price ?? 0),
      gstRate: String(defaultTaxRate),
    });
  }

  function syncPurchaseVariant(lineId: string, variantId: string) {
    const variant = variantMap.get(variantId);
    const product = variant ? productMap.get(variant.productId) : undefined;

    updatePurchaseLine(lineId, {
      productVariantId: variantId,
      purchaseCost: String(variant?.purchasePrice ?? product?.price ?? 0),
      gstRate: String(defaultTaxRate),
    });
  }

  async function persistSalesInvoice() {
    if (!salesCustomerName.trim() || !salesCustomerPhone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }

    if (!salesLines.length || salesLines.some((line) => !line.productVariantId || !isPositiveInteger(line.quantity))) {
      toast.error("Add at least one valid sales line");
      return;
    }

    const parsedAmountPaid = Number(salesAmountPaid || 0);

    if (parsedAmountPaid < 0 || parsedAmountPaid > salesSummary.grandTotal) {
      toast.error("Amount paid must be between 0 and the invoice total");
      return;
    }

    setIsSavingSales(true);

    try {
      const invoiceId = createId();
      const invoiceNumber = buildInvoiceNumber(invoicePrefix, "S", salesInvoices.length + 1);
      const status = getInvoiceStatusByAmount(salesStatus, parsedAmountPaid, salesSummary.grandTotal);
      const now = new Date().toISOString();
      const dueDate = salesDueDate ? new Date(salesDueDate).toISOString() : null;

      const invoiceItems: SalesInvoiceItem[] = salesLines.map((line) => {
        const variant = variantMap.get(line.productVariantId);
        const product = variant ? productMap.get(variant.productId) : undefined;
        const totals = getSalesLineTotals(line);

        return {
          id: createId(),
          salesInvoiceId: invoiceId,
          productId: product?.id ?? variant?.productId ?? "",
          productVariantId: variant?.id ?? line.productVariantId,
          productName: product?.name ?? "Unknown product",
          variantLabel: variant?.label ?? `${variant?.size ?? ""} ${variant?.unit ?? ""}`.trim(),
          quantity: totals.quantity,
          unitPrice: totals.unitPrice,
          itemDiscount: totals.itemDiscount,
          gstRate: totals.gstRate,
          taxAmount: totals.taxAmount,
          lineTotal: totals.lineTotal,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
      });

      const movements: InventoryMovement[] = [];

      await localDatabase.transaction(
        "rw",
        localDatabase.salesInvoices,
        localDatabase.salesInvoiceItems,
        localDatabase.inventoryMovements,
        localDatabase.productVariants,
        localDatabase.products,
        async () => {
          await localDatabase.salesInvoices.add({
            id: invoiceId,
            invoiceNumber,
            invoiceDate: new Date(salesInvoiceDate).toISOString(),
            dueDate,
            customerId: salesCustomerId || null,
            customerName: salesCustomerName.trim(),
            customerPhone: salesCustomerPhone.trim(),
            status,
            paymentMethod: salesPaymentMethod,
            subtotal: roundMoney(salesSummary.subtotal),
            discountTotal: 0,
            taxTotal: roundMoney(salesSummary.taxTotal),
            grandTotal: roundMoney(salesSummary.grandTotal),
            amountPaid: roundMoney(parsedAmountPaid),
            balanceDue: roundMoney(salesOpenBalance),
            notes: salesNotes.trim() || undefined,
            terms: salesTerms.trim() || undefined,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          });

          await localDatabase.salesInvoiceItems.bulkAdd(invoiceItems);

          for (const line of salesLines) {
            const variant = variantMap.get(line.productVariantId);
            const product = variant ? productMap.get(variant.productId) : undefined;
            const totals = getSalesLineTotals(line);

            if (!variant || !product) {
              throw new Error("Unable to resolve product for sales line item");
            }

            const updatedVariantStock = variant.currentStock - totals.quantity;
            const updatedProductStock = product.stock - totals.quantity;

            if (updatedVariantStock < 0 || updatedProductStock < 0) {
              throw new Error(`Not enough stock for ${product.name}`);
            }

            await localDatabase.productVariants.update(variant.id, {
              currentStock: updatedVariantStock,
            });

            await localDatabase.products.update(product.id, {
              stock: updatedProductStock,
            });

            const movement: InventoryMovement = {
              id: createId(),
              productVariantId: variant.id,
              quantity: -totals.quantity,
              movementType: "sale",
              referenceNumber: invoiceNumber,
              linkedInvoiceId: invoiceId,
              reason: `Sales invoice ${invoiceNumber}`,
              employeeId: null,
              occurredAt: new Date(salesInvoiceDate).toISOString(),
              isActive: true,
              createdAt: now,
              updatedAt: now,
            };

            movements.push(movement);
          }

          if (movements.length) {
            await localDatabase.inventoryMovements.bulkAdd(movements);
          }

        }
      );

      if (parsedAmountPaid > 0) {
        const payment: Payment = {
          id: createId(),
          invoiceType: "sales",
          invoiceId,
          amount: roundMoney(parsedAmountPaid),
          method: salesPaymentMethod,
          recordedAt: new Date(salesInvoiceDate).toISOString(),
          notes: `Payment recorded for sales invoice ${invoiceNumber}`,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        await localDatabase.payments.add(payment);
      }

      toast.success(`Sales invoice ${invoiceNumber} created`);
      setSalesCustomerId("");
      setSalesCustomerName("");
      setSalesCustomerPhone("");
      setSalesInvoiceDate(toDateInputValue(new Date()));
      setSalesDueDate(toDateInputValue(addDays(new Date(), 7)));
      setSalesStatus("draft");
      setSalesPaymentMethod("cash");
      setSalesAmountPaid("0");
      setSalesNotes("");
      setSalesTerms("");
      setSalesLines([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create sales invoice");
    } finally {
      setIsSavingSales(false);
    }
  }

  async function persistPurchaseInvoice() {
    if (!purchaseSupplierName.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    if (!purchaseLines.length || purchaseLines.some((line) => !line.productVariantId || !isPositiveInteger(line.quantity))) {
      toast.error("Add at least one valid purchase line");
      return;
    }

    const parsedAmountPaid = Number(purchaseAmountPaid || 0);

    if (parsedAmountPaid < 0 || parsedAmountPaid > purchaseSummary.grandTotal) {
      toast.error("Amount paid must be between 0 and the invoice total");
      return;
    }

    setIsSavingPurchase(true);

    try {
      const invoiceId = createId();
      const invoiceNumber = buildInvoiceNumber(invoicePrefix, "P", purchaseInvoices.length + 1);
      const status = getInvoiceStatusByAmount(purchaseStatus, parsedAmountPaid, purchaseSummary.grandTotal);
      const now = new Date().toISOString();
      const dueDate = purchaseDueDate ? new Date(purchaseDueDate).toISOString() : null;

      const invoiceItems: PurchaseInvoiceItem[] = purchaseLines.map((line) => {
        const variant = variantMap.get(line.productVariantId);
        const product = variant ? productMap.get(variant.productId) : undefined;
        const totals = getPurchaseLineTotals(line);

        return {
          id: createId(),
          purchaseInvoiceId: invoiceId,
          productId: product?.id ?? variant?.productId ?? "",
          productVariantId: variant?.id ?? line.productVariantId,
          productName: product?.name ?? "Unknown product",
          variantLabel: variant?.label ?? `${variant?.size ?? ""} ${variant?.unit ?? ""}`.trim(),
          quantity: totals.quantity,
          purchaseCost: totals.purchaseCost,
          gstRate: totals.gstRate,
          lineTotal: totals.lineTotal,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
      });

      const movements: InventoryMovement[] = [];

      await localDatabase.transaction(
        "rw",
        localDatabase.purchaseInvoices,
        localDatabase.purchaseInvoiceItems,
        localDatabase.inventoryMovements,
        localDatabase.productVariants,
        localDatabase.products,
        async () => {
          await localDatabase.purchaseInvoices.add({
            id: invoiceId,
            invoiceNumber,
            supplierId: purchaseSupplierId || null,
            supplierName: purchaseSupplierName.trim(),
            supplierInvoiceNumber: purchaseSupplierInvoiceNumber.trim() || undefined,
            internalReference: purchaseInternalReference.trim() || undefined,
            invoiceDate: new Date(purchaseInvoiceDate).toISOString(),
            dueDate,
            status,
            subtotal: roundMoney(purchaseSummary.subtotal),
            discountTotal: 0,
            taxTotal: roundMoney(purchaseSummary.taxTotal),
            grandTotal: roundMoney(purchaseSummary.grandTotal),
            amountPaid: roundMoney(parsedAmountPaid),
            balanceDue: roundMoney(purchaseOpenBalance),
            notes: purchaseNotes.trim() || undefined,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          });

          await localDatabase.purchaseInvoiceItems.bulkAdd(invoiceItems);

          for (const line of purchaseLines) {
            const variant = variantMap.get(line.productVariantId);
            const product = variant ? productMap.get(variant.productId) : undefined;
            const totals = getPurchaseLineTotals(line);

            if (!variant || !product) {
              throw new Error("Unable to resolve product for purchase line item");
            }

            const updatedVariantStock = variant.currentStock + totals.quantity;
            const updatedProductStock = product.stock + totals.quantity;

            await localDatabase.productVariants.update(variant.id, {
              currentStock: updatedVariantStock,
            });

            await localDatabase.products.update(product.id, {
              stock: updatedProductStock,
            });

            const movement: InventoryMovement = {
              id: createId(),
              productVariantId: variant.id,
              quantity: totals.quantity,
              movementType: "purchase",
              referenceNumber: invoiceNumber,
              linkedInvoiceId: invoiceId,
              reason: `Purchase invoice ${invoiceNumber}`,
              employeeId: null,
              occurredAt: new Date(purchaseInvoiceDate).toISOString(),
              isActive: true,
              createdAt: now,
              updatedAt: now,
            };

            movements.push(movement);
          }

          if (movements.length) {
            await localDatabase.inventoryMovements.bulkAdd(movements);
          }

        }
      );

      if (parsedAmountPaid > 0) {
        const payment: Payment = {
          id: createId(),
          invoiceType: "purchase",
          invoiceId,
          amount: roundMoney(parsedAmountPaid),
          method: purchasePaymentMethod,
          recordedAt: new Date(purchaseInvoiceDate).toISOString(),
          notes: `Payment recorded for purchase invoice ${invoiceNumber}`,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        await localDatabase.payments.add(payment);
      }

      toast.success(`Purchase invoice ${invoiceNumber} created`);
      setPurchaseSupplierId("");
      setPurchaseSupplierName("");
      setPurchaseInvoiceDate(toDateInputValue(new Date()));
      setPurchaseDueDate(toDateInputValue(addDays(new Date(), 14)));
      setPurchaseStatus("draft");
      setPurchasePaymentMethod("cash");
      setPurchaseAmountPaid("0");
      setPurchaseSupplierInvoiceNumber("");
      setPurchaseInternalReference("");
      setPurchaseNotes("");
      setPurchaseLines([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create purchase invoice");
    } finally {
      setIsSavingPurchase(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Sales Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{salesInvoices.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Purchase Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{purchaseInvoices.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Sales Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight text-amber-700">{formatCurrency(salesOpenBalance)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Purchase Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight text-amber-700">{formatCurrency(purchaseOpenBalance)}</p>
          </CardContent>
        </Card>
      </section>

      <Tabs value={tab} onValueChange={(value) => setTab(value as InvoiceTab)} className="space-y-5">
        <TabsList className="w-full justify-start rounded-2xl bg-white p-1 shadow-sm">
          <TabsTrigger value="sales">Sales Invoice Builder</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Invoice Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">New Sales Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="salesCustomer">Customer</Label>
                      <select
                        id="salesCustomer"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                        value={salesCustomerId}
                        onChange={(event) => syncSalesCustomer(event.target.value)}
                      >
                        <option value="">Select customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesInvoiceDate">Invoice Date</Label>
                      <Input id="salesInvoiceDate" type="date" value={salesInvoiceDate} onChange={(event) => setSalesInvoiceDate(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesCustomerName">Customer Name</Label>
                      <Input id="salesCustomerName" value={salesCustomerName} onChange={(event) => setSalesCustomerName(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesCustomerPhone">Customer Phone</Label>
                      <Input id="salesCustomerPhone" value={salesCustomerPhone} onChange={(event) => setSalesCustomerPhone(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesDueDate">Due Date</Label>
                      <Input id="salesDueDate" type="date" value={salesDueDate} onChange={(event) => setSalesDueDate(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesStatus">Status</Label>
                      <select
                        id="salesStatus"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                        value={salesStatus}
                        onChange={(event) => setSalesStatus(event.target.value as InvoiceStatus)}
                      >
                        <option value="draft">Draft</option>
                        <option value="finalized">Finalized</option>
                        <option value="partially paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="void">Void</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesPaymentMethod">Payment Method</Label>
                      <select
                        id="salesPaymentMethod"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                        value={salesPaymentMethod}
                        onChange={(event) => setSalesPaymentMethod(event.target.value as PaymentMethod)}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="bank transfer">Bank Transfer</option>
                        <option value="credit">Credit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesAmountPaid">Amount Paid</Label>
                      <Input id="salesAmountPaid" type="number" min="0" step="0.01" value={salesAmountPaid} onChange={(event) => setSalesAmountPaid(event.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salesNotes">Notes</Label>
                    <Textarea id="salesNotes" rows={3} value={salesNotes} onChange={(event) => setSalesNotes(event.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salesTerms">Terms</Label>
                    <Textarea id="salesTerms" rows={3} value={salesTerms} onChange={(event) => setSalesTerms(event.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Sales Line Items</CardTitle>
                  <p className="mt-1 text-sm text-neutral-500">Pick variants, quantities, pricing, and discount.</p>
                </div>

                <Button type="button" variant="outline" onClick={addSalesLine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Line
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="border-b border-black/5 text-neutral-500">
                    <tr>
                      <th className="px-2 py-2 font-medium">Variant</th>
                      <th className="px-2 py-2 font-medium">Qty</th>
                      <th className="px-2 py-2 font-medium">Unit Price</th>
                      <th className="px-2 py-2 font-medium">Discount</th>
                      <th className="px-2 py-2 font-medium">GST %</th>
                      <th className="px-2 py-2 font-medium">Line Total</th>
                      <th className="px-2 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesLines.map((line) => {
                      const totals = getSalesLineTotals(line);

                      return (
                        <tr key={line.id} className="border-b border-black/5 last:border-b-0">
                          <td className="px-2 py-3">
                            <select
                              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                              value={line.productVariantId}
                              onChange={(event) => syncSalesVariant(line.id, event.target.value)}
                            >
                              <option value="">Select variant</option>
                              {variants.map((variant) => {
                                const product = productMap.get(variant.productId);

                                return (
                                  <option key={variant.id} value={variant.id}>
                                    {product?.name ?? "Unknown"} - {variant.label ?? `${variant.size} ${variant.unit}`} (Stock {variant.currentStock})
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(event) => updateSalesLine(line.id, { quantity: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(event) => updateSalesLine(line.id, { unitPrice: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.itemDiscount}
                              onChange={(event) => updateSalesLine(line.id, { itemDiscount: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.gstRate}
                              onChange={(event) => updateSalesLine(line.id, { gstRate: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3 font-medium text-neutral-950">{formatCurrency(totals.lineTotal)}</td>
                          <td className="px-2 py-3">
                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSalesLine(line.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="grid gap-3 rounded-2xl border border-black/5 bg-neutral-50 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Subtotal</p>
                    <p className="text-lg font-semibold">{formatCurrency(roundMoney(salesSummary.subtotal))}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">GST</p>
                    <p className="text-lg font-semibold">{formatCurrency(roundMoney(salesSummary.taxTotal))}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Grand Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(roundMoney(salesSummary.grandTotal))}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-neutral-500">
                    Open balance: <span className="font-medium text-neutral-950">{formatCurrency(roundMoney(salesOpenBalance))}</span>
                  </div>

                  <Button type="button" onClick={persistSalesInvoice} disabled={isSavingSales}>
                    {isSavingSales ? "Saving..." : "Create Sales Invoice"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="rounded-2xl border-black/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Recent Sales Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-black/5 text-neutral-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Invoice</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Grand Total</th>
                    <th className="px-3 py-3 font-medium">Paid</th>
                    <th className="px-3 py-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSalesInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-black/5 last:border-b-0">
                      <td className="px-3 py-4 font-medium text-neutral-950">{invoice.invoiceNumber}</td>
                      <td className="px-3 py-4 text-neutral-600">{toInvoiceDateLabel(invoice.invoiceDate)}</td>
                      <td className="px-3 py-4 text-neutral-700">{invoice.customerName}</td>
                      <td className="px-3 py-4">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{toStatusLabel(invoice.status)}</Badge>
                      </td>
                      <td className="px-3 py-4 text-neutral-800">{formatCurrency(invoice.grandTotal)}</td>
                      <td className="px-3 py-4 text-emerald-700">{formatCurrency(invoice.amountPaid)}</td>
                      <td className="px-3 py-4 text-amber-700">{formatCurrency(invoice.balanceDue)}</td>
                    </tr>
                  ))}
                  {recentSalesInvoices.length === 0 ? (
                    <tr>
                      <td className="px-3 py-10 text-center text-neutral-500" colSpan={7}>
                        No sales invoices yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">New Purchase Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="purchaseSupplier">Supplier</Label>
                      <select
                        id="purchaseSupplier"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                        value={purchaseSupplierId}
                        onChange={(event) => syncPurchaseSupplier(event.target.value)}
                      >
                        <option value="">Select supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.companyName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseInvoiceDate">Invoice Date</Label>
                      <Input id="purchaseInvoiceDate" type="date" value={purchaseInvoiceDate} onChange={(event) => setPurchaseInvoiceDate(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseSupplierName">Supplier Name</Label>
                      <Input id="purchaseSupplierName" value={purchaseSupplierName} onChange={(event) => setPurchaseSupplierName(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseSupplierInvoiceNumber">Supplier Invoice Number</Label>
                      <Input id="purchaseSupplierInvoiceNumber" value={purchaseSupplierInvoiceNumber} onChange={(event) => setPurchaseSupplierInvoiceNumber(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseInternalReference">Internal Reference</Label>
                      <Input id="purchaseInternalReference" value={purchaseInternalReference} onChange={(event) => setPurchaseInternalReference(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseDueDate">Due Date</Label>
                      <Input id="purchaseDueDate" type="date" value={purchaseDueDate} onChange={(event) => setPurchaseDueDate(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseStatus">Status</Label>
                      <select
                        id="purchaseStatus"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                        value={purchaseStatus}
                        onChange={(event) => setPurchaseStatus(event.target.value as InvoiceStatus)}
                      >
                        <option value="draft">Draft</option>
                        <option value="finalized">Finalized</option>
                        <option value="partially paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="void">Void</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchasePaymentMethod">Payment Method</Label>
                      <select
                        id="purchasePaymentMethod"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                        value={purchasePaymentMethod}
                        onChange={(event) => setPurchasePaymentMethod(event.target.value as PaymentMethod)}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="bank transfer">Bank Transfer</option>
                        <option value="credit">Credit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseAmountPaid">Amount Paid</Label>
                      <Input id="purchaseAmountPaid" type="number" min="0" step="0.01" value={purchaseAmountPaid} onChange={(event) => setPurchaseAmountPaid(event.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseNotes">Notes</Label>
                    <Textarea id="purchaseNotes" rows={3} value={purchaseNotes} onChange={(event) => setPurchaseNotes(event.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Purchase Line Items</CardTitle>
                  <p className="mt-1 text-sm text-neutral-500">Receive stock into inventory when saving the invoice.</p>
                </div>

                <Button type="button" variant="outline" onClick={addPurchaseLine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Line
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-black/5 text-neutral-500">
                    <tr>
                      <th className="px-2 py-2 font-medium">Variant</th>
                      <th className="px-2 py-2 font-medium">Qty</th>
                      <th className="px-2 py-2 font-medium">Cost</th>
                      <th className="px-2 py-2 font-medium">GST %</th>
                      <th className="px-2 py-2 font-medium">Line Total</th>
                      <th className="px-2 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseLines.map((line) => {
                      const totals = getPurchaseLineTotals(line);

                      return (
                        <tr key={line.id} className="border-b border-black/5 last:border-b-0">
                          <td className="px-2 py-3">
                            <select
                              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                              value={line.productVariantId}
                              onChange={(event) => syncPurchaseVariant(line.id, event.target.value)}
                            >
                              <option value="">Select variant</option>
                              {variants.map((variant) => {
                                const product = productMap.get(variant.productId);

                                return (
                                  <option key={variant.id} value={variant.id}>
                                    {product?.name ?? "Unknown"} - {variant.label ?? `${variant.size} ${variant.unit}`} (Stock {variant.currentStock})
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(event) => updatePurchaseLine(line.id, { quantity: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.purchaseCost}
                              onChange={(event) => updatePurchaseLine(line.id, { purchaseCost: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.gstRate}
                              onChange={(event) => updatePurchaseLine(line.id, { gstRate: event.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3 font-medium text-neutral-950">{formatCurrency(totals.lineTotal)}</td>
                          <td className="px-2 py-3">
                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removePurchaseLine(line.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="grid gap-3 rounded-2xl border border-black/5 bg-neutral-50 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Subtotal</p>
                    <p className="text-lg font-semibold">{formatCurrency(roundMoney(purchaseSummary.subtotal))}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">GST</p>
                    <p className="text-lg font-semibold">{formatCurrency(roundMoney(purchaseSummary.taxTotal))}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Grand Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(roundMoney(purchaseSummary.grandTotal))}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-neutral-500">
                    Open balance: <span className="font-medium text-neutral-950">{formatCurrency(roundMoney(purchaseOpenBalance))}</span>
                  </div>

                  <Button type="button" onClick={persistPurchaseInvoice} disabled={isSavingPurchase}>
                    {isSavingPurchase ? "Saving..." : "Create Purchase Invoice"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="rounded-2xl border-black/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Recent Purchase Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-black/5 text-neutral-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Invoice</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Supplier</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Grand Total</th>
                    <th className="px-3 py-3 font-medium">Paid</th>
                    <th className="px-3 py-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchaseInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-black/5 last:border-b-0">
                      <td className="px-3 py-4 font-medium text-neutral-950">{invoice.invoiceNumber}</td>
                      <td className="px-3 py-4 text-neutral-600">{toInvoiceDateLabel(invoice.invoiceDate)}</td>
                      <td className="px-3 py-4 text-neutral-700">{invoice.supplierName}</td>
                      <td className="px-3 py-4">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{toStatusLabel(invoice.status)}</Badge>
                      </td>
                      <td className="px-3 py-4 text-neutral-800">{formatCurrency(invoice.grandTotal)}</td>
                      <td className="px-3 py-4 text-emerald-700">{formatCurrency(invoice.amountPaid)}</td>
                      <td className="px-3 py-4 text-amber-700">{formatCurrency(invoice.balanceDue)}</td>
                    </tr>
                  ))}
                  {recentPurchaseInvoices.length === 0 ? (
                    <tr>
                      <td className="px-3 py-10 text-center text-neutral-500" colSpan={7}>
                        No purchase invoices yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
