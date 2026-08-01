"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import type { PaymentMethod, ProjectType, QuoteStatus } from "@/data/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function createId() {
  return crypto.randomUUID();
}

const projectTypes: ProjectType[] = ["interior", "exterior", "both", "other"];
const contactMethods: Array<PaymentMethod | "whatsapp" | "call" | "email"> = [
  "whatsapp",
  "call",
  "email",
  "cash",
  "upi",
  "card",
  "bank transfer",
  "credit",
  "other",
];

function toLabel(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function QuoteRequestForm() {
  const products = useLiveQuery(() => repositories.products.getAll(), [], []);
  const variants = useLiveQuery(() => repositories.productVariants.getAll(), [], []);
  const categories = useLiveQuery(() => repositories.categories.getAll(), [], []);
  const brands = useLiveQuery(() => repositories.brands.getAll(), [], []);
  const storefrontSettings = useLiveQuery(() => repositories.settings.storefront.get(), [], undefined);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("interior");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [shadeCode, setShadeCode] = useState("");
  const [shadeName, setShadeName] = useState("");
  const [shadeHex, setShadeHex] = useState("");
  const [estimatedQuantity, setEstimatedQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<PaymentMethod | "whatsapp" | "call" | "email">("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProductsLabel = useMemo(
    () => selectedProducts.map((id) => products.find((entry) => entry.id === id)?.name).filter(Boolean).join(", "),
    [products, selectedProducts]
  );

  const selectedVariantsLabel = useMemo(
    () =>
      selectedVariants
        .map((id) => {
          const variant = variants.find((entry) => entry.id === id);
          const product = variant ? products.find((entry) => entry.id === variant.productId) : undefined;
          return product ? `${product.name} - ${variant?.label ?? `${variant?.size} ${variant?.unit}`}` : undefined;
        })
        .filter(Boolean)
        .join(", "),
    [products, selectedVariants, variants]
  );

  function toggleSelection(entryId: string, collection: string[], setter: (value: string[]) => void) {
    setter(collection.includes(entryId) ? collection.filter((id) => id !== entryId) : [...collection, entryId]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }

    if (!selectedProducts.length && !selectedVariants.length) {
      toast.error("Select at least one product or variant");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const request = {
        id: createId(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        location: location.trim() || undefined,
        projectType,
        selectedProductIds: selectedProducts,
        selectedVariantIds: selectedVariants,
        shadeCode: shadeCode.trim() || undefined,
        shadeName: shadeName.trim() || undefined,
        shadeHex: shadeHex.trim() || undefined,
        estimatedQuantity: estimatedQuantity.trim() || undefined,
        message: message.trim() || undefined,
        preferredContactMethod,
        status: "new" as QuoteStatus,
        notes: undefined,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await repositories.quoteRequests.create(request);

      setCustomerName("");
      setPhone("");
      setEmail("");
      setLocation("");
      setProjectType("interior");
      setSelectedProducts([]);
      setSelectedVariants([]);
      setShadeCode("");
      setShadeName("");
      setShadeHex("");
      setEstimatedQuantity("");
      setMessage("");
      setPreferredContactMethod("whatsapp");

      toast.success("Quote request submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit quote request");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!storefrontSettings?.quoteRequestEnabled) {
    return (
      <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="p-10 text-center text-slate-500">
          Quote requests are currently disabled.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Products Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{products.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{brands.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{categories.length}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[1.75rem] border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Request a Quote</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Tell us what you need, and we’ll prepare a tailored estimate for your project.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <select
                id="projectType"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={projectType}
                onChange={(event) => setProjectType(event.target.value as ProjectType)}
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {toLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact</Label>
              <select
                id="preferredContactMethod"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={preferredContactMethod}
                onChange={(event) => setPreferredContactMethod(event.target.value as PaymentMethod | "whatsapp" | "call" | "email")}
              >
                {contactMethods.map((method) => (
                  <option key={method} value={method}>
                    {toLabel(method)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Products</Label>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelection(product.id, selectedProducts, setSelectedProducts)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-orange-600"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">{product.name}</span>
                      <span className="block text-xs text-slate-500">{product.brand}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Variants</Label>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {variants.map((variant) => {
                  const product = products.find((entry) => entry.id === variant.productId);

                  return (
                    <label
                      key={variant.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVariants.includes(variant.id)}
                        onChange={() => toggleSelection(variant.id, selectedVariants, setSelectedVariants)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-orange-600"
                      />
                      <span>
                        <span className="block font-medium text-slate-900">{product?.name ?? "Unknown product"}</span>
                        <span className="block text-xs text-slate-500">
                          {variant.label ?? `${variant.size} ${variant.unit}`} • Stock {variant.currentStock}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadeCode">Shade Code</Label>
              <Input id="shadeCode" value={shadeCode} onChange={(event) => setShadeCode(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadeName">Shade Name</Label>
              <Input id="shadeName" value={shadeName} onChange={(event) => setShadeName(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadeHex">Shade Hex</Label>
              <Input id="shadeHex" value={shadeHex} onChange={(event) => setShadeHex(event.target.value)} placeholder="#AABBCC" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedQuantity">Estimated Quantity</Label>
              <Input id="estimatedQuantity" value={estimatedQuantity} onChange={(event) => setEstimatedQuantity(event.target.value)} placeholder="e.g. 20 L" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message">Project Notes</Label>
              <Textarea id="message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div>
                <p className="font-medium text-slate-900">Selected Products</p>
                <p>{selectedProductsLabel || "None selected yet"}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Selected Variants</p>
                <p>{selectedVariantsLabel || "None selected yet"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Quote Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
