# Active Context

## Current Focus
- **Marktplatz**: UI an SearchPage angeglichen; Kategorie eigene Box als **Liste**; **Weitere Filter** ausklappbar; Footer-Spalte Marktplatz + NB-Link
- **Stabilisierung Produktion**: DB-Migrationen auf allen Umgebungen mit Repo abgleichen (Remote kann andere Migrations-Namen/Zeitstempel haben als Dateien unter `supabase/migrations/`)
- **Admin (tigube-admin)**: Marktplatz-Moderation (Deaktivieren/Löschen, RPCs) — siehe separates Repo

## Recent Implementation (Stand 2026-03)

### Marktplatz (Haupt-App tigube_v2)
- **Routes**: `/marktplatz`, `/marktplatz/neu`, `/marktplatz/meine`, `/marktplatz/bearbeiten/:id`, `/marktplatz/nutzungsbedingungen` (vor dynamischer `/marktplatz/:id`)
- **Seiten/Komponenten**: `MarketplacePage`, `MarketplaceTermsPage`, `CreateListingForm` (NB-Checkbox nur Create), `MarketplaceCategoryBrowser` (`grid` | `sidebar`), `MarketplaceFilters` (`horizontal` | `sidebar` | `search`)
- **DB (Repo)**: u. a. `marketplace_listings`, Kategorien, Favoriten; Admin-Moderation: Status `inactive`, `marketplace_listing_notices`, RPCs `admin_deactivate_marketplace_listing` / `admin_delete_marketplace_listing` (Migration `20260327120000_marketplace_admin_moderation.sql` — auf Remote prüfen ob angewendet)
- **Footer**: Spalte „Marktplatz“ → Nutzungsbedingungen

### Owner Jobs / Profil (weiterhin relevant)
- Tabellen: `owner_jobs`, `owner_job_pets`; RLS inkl. `user_has_db_premium`
- **Routes**: `/jobs`, öffentliches Profil mit Jobs

### Owner Dashboard Navigation
- Sidebar-Layout analog Caretaker; Lucide-Icons pro Eintrag

### Technik-Hinweise
- `database.types.ts`: bei Schema-Änderungen anpassen oder generieren
- Supabase: MCP **`list_migrations`** / **`apply_migration`** nur bei **fehlenden** Remote-Migrationen; Inhalt aus Repo-Dateien, keine DDL per `execute_sql`
- **Release** (`content_items`): nur bei nutzerrelevanten Änderungen (siehe `.cursorrules`)

## Next Steps (optional)
- Remote prüfen: fehlt `marketplace_admin_moderation` → `apply_migration` mit Repo-SQL
- E2E-Tests Marktplatz (Anzeige anlegen, NB, Filter)
- `npm run build` nach größeren UI-Änderungen

## Key Files (Orientierung)
- Marktplatz: `src/pages/MarketplacePage.tsx`, `MarketplaceTermsPage.tsx`, `CreateListingPage.tsx`, `components/marketplace/*`, `lib/supabase/marketplaceService.ts`
- Footer: `src/components/layout/Footer.tsx`
- Betreuer-Suche (UI-Referenz): `src/pages/SearchPage.tsx`
- DB: `supabase/migrations/*marketplace*`
