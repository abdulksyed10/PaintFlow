# PaintFlow Architecture

PaintFlow is organized as a Next.js App Router application with separate storefront and admin route groups. The current phase focuses on a local-first foundation so the UI can later connect to PostgreSQL or Supabase without changing the component layer.

## Current direction

- `src/app/(storefront)` contains the customer-facing website.
- `src/app/(admin)` contains the internal admin area.
- `src/data` now owns the local storage model, seed data, repository abstractions, and backup/bootstrap services.
- `src/lib/dummy-data` is now a thin compatibility layer over the shared seed data.

## Storage approach

- IndexedDB via Dexie is the structured data store for products, invoices, customers, suppliers, users, and related records.
- `localStorage` is reserved for lightweight UI preferences and future demo auth session state.
- File blobs are intended to stay in IndexedDB during this phase.

## Migration intent

The repository layer hides storage details behind async methods. That lets the app swap the Dexie implementation for API-backed repositories later without rewriting the pages and form components.
