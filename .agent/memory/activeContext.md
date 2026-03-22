# Active Context

## Current Focus
- **Stabilisierung Produktion**: DB-Migrationen (`short_intro`, `owner_jobs`, `user_has_db_premium`-Update) auf allen Umgebungen ausrollen
- **Owner-Dashboard**: Sidebar wie Caretaker, vollständige Nav-Icons
- **Tierhalter-Jobs** + **öffentliches Profil**: Feature-sätig; RLS und Client-Premium (inkl. Promo) sind in `user_has_db_premium` abgestimmt

## Recent Implementation (Stand 2026-03)

### Owner Jobs (Premium)
- Tabellen: `owner_jobs`, `owner_job_pets`; RLS inkl. `user_has_db_premium`; Zusatz-Policy auf `pets` für Tiernamen bei offenen Jobs
- `ownerJobService`, `ownerJobApply` (Konversation + erste Nachricht), `FEATURE_MATRIX`: `post_owner_jobs`, `apply_owner_jobs`
- **Routes**: `/jobs` (`OwnerJobsPage`), Header-Link „Jobs“
- **UI**: Tab „Jobs“ im Owner-Dashboard (`OwnerDashboardJobsTab`), Karten `OwnerJobCard` auf Profil und Jobs-Seite

### Owner Dashboard Navigation
- **Keine horizontale Tab-Leiste mehr**: `lg:grid-cols-4` mit **Sidebar** (`aside`, `lg:sticky`) + **Content** (`section`), analog Caretaker-Dashboard
- Alle Sidebar-Einträge mit **Lucide-Icons** (inkl. Affiliate `Share2`, Kontaktdaten `BookUser`, Hilfe `HelpCircle`)

### Öffentliches Profil / Dashboard Texte
- Eigenes Tab **„Öffentliches Profil“** für Kurzvorstellung + „Über mich“
- Bearbeitung mit **Stift-Icon**, **Speichern** / **Abbrechen** pro Block (Caretaker-Pattern)
- Überschrift „Öffentliches Profil“ im Tab-Inhalt entfernt (nur noch Unterüberschriften)

### Produktions-Fixes (2026-03)
- **`users.short_intro` fehlte** → Migration `add_short_intro_to_users` / `20260322120000_add_short_intro_to_users.sql`; ohne Spalte bricht `getPublicOwnerProfile` beim Profilaufruf
- **RLS `owner_jobs` INSERT** → `user_has_db_premium` erweitert: gleiche **Promo-Logik** wie `SubscriptionService` (Registrierung vor 2026-05-01 UTC + 3 Monate) **oder** `plan_type = premium` + gültiges `plan_expires_at`; Migration `20260324100000_fix_user_has_db_premium_promo.sql`

### Technik-Hinweise
- `database.types.ts`: gültige **TypeScript-Datei** (kein JSON-Wrapper); bei Schema-Änderungen anpassen oder generieren
- Supabase-Migrationen im Repo unter `supabase/migrations/`; Remote-Apply z. B. MCP `apply_migration` auf Projekt **tigube**

### Release-Text („Was ist neu“)
- Nutzerrelevante Releases als **`content_items`** mit `type = 'release'`, `status = 'published'` (siehe `.cursorrules` → Supabase-MCP). März-2026-Eintrag: `slug = 2026-03-marz-profil-jobs`, Seed-Migration `20260325120000_seed_release_2026_03_marz.sql`.

## Next Steps (optional)
- Mobile-Feinschliff Sidebars (horizontale Scroll-Leiste auf kleinen Screens ist vorhanden)
- E2E-Tests für Job anlegen / bewerben
- `npm run build` / manuelle Checks nach DB-Migrationen

## Key Files (Orientierung)
- Owner-Dashboard: `src/pages/OwnerDashboardPage.tsx`
- Jobs-Seite: `src/pages/OwnerJobsPage.tsx`
- Owner Public: `src/pages/OwnerPublicProfilePage.tsx`
- Services: `src/lib/supabase/ownerJobService.ts`, `ownerJobApply.ts`, `ownerPublicService.ts`
- Konstanten Service-Tags: `src/lib/constants/ownerServices.ts`
- Caretaker-Referenz-Layout: `src/pages/CaretakerDashboardPage.tsx` (Sidebar ab ~2666)
- DB: `supabase/migrations/` — u. a. `20260322120000_add_short_intro_to_users.sql`, `20260323120000_create_owner_jobs.sql`, `20260323120100_pets_select_for_open_owner_jobs.sql`, `20260324100000_fix_user_has_db_premium_promo.sql`
