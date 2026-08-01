"use client";

import type { FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import type { BusinessSettings, StorefrontSettings } from "@/data/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function parseNumber(value: FormDataEntryValue | null) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);

      await repositories.settings.business.save({
        shopName: String(formData.get("shopName") ?? "").trim(),
        legalName: String(formData.get("legalName") ?? "").trim(),
        logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
        address: String(formData.get("address") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        gstin: String(formData.get("gstin") ?? "").trim(),
        state: String(formData.get("state") ?? "").trim(),
        invoicePrefix: String(formData.get("invoicePrefix") ?? "").trim(),
        currency: String(formData.get("currency") ?? "INR").trim(),
        financialYearStartMonth: parseNumber(formData.get("financialYearStartMonth")),
        gstRegistered: parseBoolean(formData.get("gstRegistered")),
        defaultTaxRate: parseNumber(formData.get("defaultTaxRate")),
        inclusivePricing: parseBoolean(formData.get("inclusivePricing")),
        cgstSgstEnabled: parseBoolean(formData.get("cgstSgstEnabled")),
        invoiceFooter: String(formData.get("invoiceFooter") ?? "").trim(),
        terms: String(formData.get("terms") ?? "").trim(),
        showPricesOnStorefront: parseBoolean(formData.get("showPricesOnStorefront")),
      });

      toast.success("Business settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save business settings");
    }
  }

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">Business Settings</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} key={settings.id} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input id="shopName" name="shopName" defaultValue={settings.shopName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input id="legalName" name="legalName" defaultValue={settings.legalName} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl ?? ""} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" rows={3} defaultValue={settings.address} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={settings.phone} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={settings.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" name="gstin" defaultValue={settings.gstin} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={settings.state} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
            <Input id="invoicePrefix" name="invoicePrefix" defaultValue={settings.invoicePrefix} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={settings.currency} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="financialYearStartMonth">Financial Year Start Month</Label>
            <Input id="financialYearStartMonth" name="financialYearStartMonth" type="number" min="1" max="12" defaultValue={settings.financialYearStartMonth} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTaxRate">Default Tax Rate</Label>
            <Input id="defaultTaxRate" name="defaultTaxRate" type="number" min="0" step="0.01" defaultValue={settings.defaultTaxRate} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="invoiceFooter">Invoice Footer</Label>
            <Textarea id="invoiceFooter" name="invoiceFooter" rows={3} defaultValue={settings.invoiceFooter} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="terms">Terms</Label>
            <Textarea id="terms" name="terms" rows={3} defaultValue={settings.terms} />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="gstRegistered" defaultChecked={settings.gstRegistered} />
            GST Registered
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="inclusivePricing" defaultChecked={settings.inclusivePricing} />
            Inclusive Pricing
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="cgstSgstEnabled" defaultChecked={settings.cgstSgstEnabled} />
            CGST/SGST Enabled
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="showPricesOnStorefront" defaultChecked={settings.showPricesOnStorefront} />
            Show Prices on Storefront
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">Save Business Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StorefrontSettingsForm({ settings }: { settings: StorefrontSettings }) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);

      await repositories.settings.storefront.save({
        heroHeading: String(formData.get("heroHeading") ?? "").trim(),
        heroDescription: String(formData.get("heroDescription") ?? "").trim(),
        contactInfo: String(formData.get("contactInfo") ?? "").trim(),
        whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim(),
        socialLinks: {
          instagram: String(formData.get("instagram") ?? "").trim() || undefined,
          facebook: String(formData.get("facebook") ?? "").trim() || undefined,
          youtube: String(formData.get("youtube") ?? "").trim() || undefined,
          website: String(formData.get("website") ?? "").trim() || undefined,
        },
        featuredCategoryIds: String(formData.get("featuredCategoryIds") ?? "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        featuredBrandIds: String(formData.get("featuredBrandIds") ?? "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        launchBannerEnabled: parseBoolean(formData.get("launchBannerEnabled")),
        launchBannerText: String(formData.get("launchBannerText") ?? "").trim(),
        announcementDate: String(formData.get("announcementDate") ?? "").trim(),
        quoteRequestEnabled: parseBoolean(formData.get("quoteRequestEnabled")),
      });

      toast.success("Storefront settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save storefront settings");
    }
  }

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">Storefront Settings</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} key={settings.id} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="heroHeading">Hero Heading</Label>
            <Input id="heroHeading" name="heroHeading" defaultValue={settings.heroHeading} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="heroDescription">Hero Description</Label>
            <Textarea id="heroDescription" name="heroDescription" rows={3} defaultValue={settings.heroDescription} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contactInfo">Contact Info</Label>
            <Textarea id="contactInfo" name="contactInfo" rows={3} defaultValue={settings.contactInfo} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcementDate">Announcement Date</Label>
            <Input id="announcementDate" name="announcementDate" type="date" defaultValue={settings.announcementDate} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="launchBannerText">Launch Banner Text</Label>
            <Input id="launchBannerText" name="launchBannerText" defaultValue={settings.launchBannerText} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="featuredCategoryIds">Featured Category IDs</Label>
            <Input
              id="featuredCategoryIds"
              name="featuredCategoryIds"
              defaultValue={settings.featuredCategoryIds.join(", ")}
              placeholder="cat-interior, cat-exterior"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="featuredBrandIds">Featured Brand IDs</Label>
            <Input
              id="featuredBrandIds"
              name="featuredBrandIds"
              defaultValue={settings.featuredBrandIds.join(", ")}
              placeholder="brand-asian-paints, brand-berger"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" defaultValue={settings.socialLinks.instagram ?? ""} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" defaultValue={settings.socialLinks.facebook ?? ""} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" name="youtube" defaultValue={settings.socialLinks.youtube ?? ""} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={settings.socialLinks.website ?? ""} />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="launchBannerEnabled" defaultChecked={settings.launchBannerEnabled} />
            Launch Banner Enabled
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="quoteRequestEnabled" defaultChecked={settings.quoteRequestEnabled} />
            Quote Request Enabled
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">Save Storefront Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function SettingsWorkbench() {
  const businessSettings = useLiveQuery(() => repositories.settings.business.get(), [], undefined);
  const storefrontSettings = useLiveQuery(() => repositories.settings.storefront.get(), [], undefined);

  if (!businessSettings || !storefrontSettings) {
    return (
      <Card className="rounded-2xl border-black/5 shadow-sm">
        <CardContent className="p-10 text-center text-neutral-500">Loading settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{businessSettings.shopName}</p>
            <p className="mt-2 text-sm text-neutral-500">{businessSettings.state}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Invoice Prefix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{businessSettings.invoicePrefix}</p>
            <p className="mt-2 text-sm text-neutral-500">Tax rate {businessSettings.defaultTaxRate}%</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Launch Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{storefrontSettings.launchBannerEnabled ? "Enabled" : "Hidden"}</p>
            <p className="mt-2 text-sm text-neutral-500">{storefrontSettings.announcementDate}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BusinessSettingsForm settings={businessSettings} />
        <StorefrontSettingsForm settings={storefrontSettings} />
      </section>
    </div>
  );
}
