# PaintFlow Local Storage

This project uses Dexie over IndexedDB for structured local persistence.

## What is stored locally

- Categories
- Brands
- Products and variants
- Product images
- Shades and shade collections
- Inventory movements
- Customers
- Suppliers
- Sales and purchase invoices
- Payments
- Quote requests
- Audit logs
- Business and storefront settings
- Local demo users

## Utilities

- `seedDemoData()` creates the initial demo dataset.
- `ensureDemoData()` seeds the database on first launch.
- `exportLocalData()` creates a JSON backup.
- `importLocalData()` restores a JSON backup.
- `resetLocalData()` clears the local store.

## Development login note

The local demo admin account is seeded for the future auth phase. Passwords are hashed with a simple demonstration SHA-256 helper and are not production security.
