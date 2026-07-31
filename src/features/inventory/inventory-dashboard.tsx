"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import type { InventoryMovementType } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const increaseTypes: InventoryMovementType[] = [
  "purchase",
  "manual adjustment increase",
  "correction",
  "sales return",
];

const decreaseTypes: InventoryMovementType[] = [
  "sale",
  "manual adjustment decrease",
  "damaged",
  "leaked",
  "expired",
  "purchase return",
];

const movementTypeOptions: InventoryMovementType[] = [
  ...increaseTypes,
  ...decreaseTypes,
];

function formatMovementTypeLabel(value: InventoryMovementType) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InventoryDashboard() {
  const [variantId, setVariantId] = useState("");
  const [movementType, setMovementType] = useState<InventoryMovementType>("manual adjustment increase");
  const [quantity, setQuantity] = useState("1");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const products = useLiveQuery(() => repositories.products.getAll(), [], []);
  const variants = useLiveQuery(() => repositories.productVariants.getAll(), [], []);
  const movements = useLiveQuery(() => repositories.inventory.getAll(), [], []);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const variantRows = useMemo(() => {
    return variants
      .map((variant) => {
        const product = productMap.get(variant.productId);

        return {
          variant,
          product,
          isLowStock: variant.currentStock <= variant.lowStockThreshold,
        };
      })
      .filter((row) => Boolean(row.product))
      .sort((a, b) => a.product!.name.localeCompare(b.product!.name));
  }, [productMap, variants]);

  const movementRows = useMemo(() => {
    return [...movements]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      )
      .slice(0, 12)
      .map((movement) => {
        const variant = variants.find((entry) => entry.id === movement.productVariantId);
        const product = variant ? productMap.get(variant.productId) : undefined;

        return {
          movement,
          productName: product?.name ?? "Unknown product",
          variantLabel: variant?.label ?? `${variant?.size ?? "?"} ${variant?.unit ?? ""}`,
        };
      });
  }, [movements, productMap, variants]);

  const totalVariants = variantRows.length;
  const lowStockCount = variantRows.filter((row) => row.isLowStock).length;
  const totalUnits = variantRows.reduce((sum, row) => sum + row.variant.currentStock, 0);

  const handleAdjustStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!variantId) {
      toast.error("Choose a product variant first");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0 || !Number.isInteger(parsedQuantity)) {
      toast.error("Quantity must be a positive whole number");
      return;
    }

    const signedQuantity = decreaseTypes.includes(movementType)
      ? -parsedQuantity
      : parsedQuantity;

    const targetVariant = variants.find((entry) => entry.id === variantId);

    if (!targetVariant) {
      toast.error("Selected variant is no longer available");
      return;
    }

    const targetProduct = products.find((entry) => entry.id === targetVariant.productId);

    if (!targetProduct) {
      toast.error("Product for selected variant was not found");
      return;
    }

    const updatedVariantStock = targetVariant.currentStock + signedQuantity;
    const updatedProductStock = targetProduct.stock + signedQuantity;

    if (updatedVariantStock < 0 || updatedProductStock < 0) {
      toast.error("Stock cannot become negative");
      return;
    }

    setIsSaving(true);

    try {
      await repositories.productVariants.update(targetVariant.id, {
        currentStock: updatedVariantStock,
      });

      await repositories.products.update(targetProduct.id, {
        stock: updatedProductStock,
      });

      await repositories.inventory.create({
        productVariantId: targetVariant.id,
        quantity: signedQuantity,
        movementType,
        referenceNumber: referenceNumber.trim() || undefined,
        linkedInvoiceId: null,
        reason: reason.trim() || "Manual admin stock adjustment",
        employeeId: undefined,
        occurredAt: new Date().toISOString(),
      });

      setQuantity("1");
      setReferenceNumber("");
      setReason("");
      toast.success("Stock adjusted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update stock");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Tracked Variants</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold tracking-tight">{totalVariants}</p>
            <PackageCheck className="h-5 w-5 text-neutral-400" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold tracking-tight">{lowStockCount}</p>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Units In Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold tracking-tight">{totalUnits}</p>
            <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Adjust Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAdjustStock}>
              <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <select
                  id="variant"
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                  value={variantId}
                  onChange={(event) => setVariantId(event.target.value)}
                >
                  <option value="">Select variant</option>
                  {variantRows.map((row) => (
                    <option key={row.variant.id} value={row.variant.id}>
                      {row.product!.name} - {row.variant.label ?? `${row.variant.size} ${row.variant.unit}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="movementType">Movement Type</Label>
                  <select
                    id="movementType"
                    className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                    value={movementType}
                    onChange={(event) => setMovementType(event.target.value as InventoryMovementType)}
                  >
                    {movementTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatMovementTypeLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  placeholder="Optional invoice or adjustment reference"
                  value={referenceNumber}
                  onChange={(event) => setReferenceNumber(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  placeholder="Why are you adjusting this stock?"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Apply Adjustment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Current Stock By Variant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="border-b border-black/5 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Variant</th>
                  <th className="px-3 py-3 font-medium">Current</th>
                  <th className="px-3 py-3 font-medium">Threshold</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {variantRows.map((row) => (
                  <tr key={row.variant.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-3 py-4 font-medium text-neutral-950">{row.product!.name}</td>
                    <td className="px-3 py-4 text-neutral-600">
                      {row.variant.label ?? `${row.variant.size} ${row.variant.unit}`}
                    </td>
                    <td className="px-3 py-4 text-neutral-800">{row.variant.currentStock}</td>
                    <td className="px-3 py-4 text-neutral-600">{row.variant.lowStockThreshold}</td>
                    <td className="px-3 py-4">
                      <Badge variant={row.isLowStock ? "destructive" : "secondary"}>
                        {row.isLowStock ? "Low" : "Healthy"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {variantRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-neutral-500">
                      No product variants available yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Recent Inventory Movements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-black/5 text-neutral-500">
              <tr>
                <th className="px-3 py-3 font-medium">When</th>
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Quantity</th>
                <th className="px-3 py-3 font-medium">Reference</th>
                <th className="px-3 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {movementRows.map((row) => (
                <tr key={row.movement.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-3 py-4 text-neutral-600">{toDateLabel(row.movement.occurredAt)}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-neutral-950">{row.productName}</p>
                    <p className="text-xs text-neutral-500">{row.variantLabel}</p>
                  </td>
                  <td className="px-3 py-4 text-neutral-700">{formatMovementTypeLabel(row.movement.movementType)}</td>
                  <td className="px-3 py-4">
                    <span className={row.movement.quantity < 0 ? "text-red-600" : "text-emerald-700"}>
                      {row.movement.quantity < 0 ? <ArrowDownCircle className="mr-1 inline h-4 w-4" /> : <ArrowUpCircle className="mr-1 inline h-4 w-4" />}
                      {row.movement.quantity > 0 ? `+${row.movement.quantity}` : row.movement.quantity}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-neutral-600">{row.movement.referenceNumber ?? "-"}</td>
                  <td className="px-3 py-4 text-neutral-600">{row.movement.reason ?? "-"}</td>
                </tr>
              ))}
              {movementRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-neutral-500">
                    No inventory movements recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
