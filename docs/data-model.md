# PaintFlow Data Model

The first local-first phase seeds a realistic but fictional paint-shop dataset.

## Core entities

- `User`, `Role`, and `Permission` for local employee access.
- `Category` and `Brand` for storefront and catalog organization.
- `Product`, `ProductVariant`, `ProductImage`, `ShadeCollection`, and `Shade` for item and tinting support.
- `InventoryMovement` for the stock ledger.
- `Customer` and `Supplier` for sales and purchasing workflows.
- `SalesInvoice`, `SalesInvoiceItem`, `PurchaseInvoice`, `PurchaseInvoiceItem`, and `Payment` for billing.
- `QuoteRequest` for public inquiry capture.
- `AuditLog` for local activity history.
- `BusinessSettings` and `StorefrontSettings` for configurable shop behavior.

## Notes

- Products keep the current flat fields used by the existing UI so the current pages continue to work.
- Variants, shades, and images are present in the local model so the UI can be expanded without changing the storage layer.
- All sample data is fictional and intended for development only.
