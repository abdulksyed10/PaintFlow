# Future Database Migration

PaintFlow is intentionally written around repository interfaces so the local Dexie implementation can be replaced later.

## Migration path

1. Keep the UI and forms unchanged.
2. Replace Dexie repository implementations with API-backed versions.
3. Move seed/demo data into migration scripts or fixtures.
4. Keep the same TypeScript models and repository method names where practical.

## Recommended targets

- PostgreSQL or Supabase for relational data.
- Object storage for images and invoice attachments.
- Server-side auth for real user management.
