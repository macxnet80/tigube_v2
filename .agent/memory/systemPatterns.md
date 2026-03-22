# System Patterns: Tigube v2

## Architektur-Patterns

### Container & Layout
- `container-custom` für max-width und Padding
- Mobile-First, Breakpoints sm / md / lg / xl

### Dashboard: Sidebar + Hauptinhalt (Caretaker & Owner)
- **Grid**: `grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8`
- **Sidebar**: `aside.lg:col-span-1`, Nav in `bg-white rounded-xl shadow`, `lg:sticky lg:top-4`
- **Inhalt**: `section.lg:col-span-3 min-w-0`
- **Mobile**: `ul` mit `flex-row lg:flex-col` + horizontal scroll (`overflow-x-auto scrollbar-hide`) für kompakte Nav
- **Aktiver Eintrag**: `bg-primary-50 text-primary-700 border border-primary-200`
- **Icons**: Lucide, typisch `h-4 w-4 shrink-0 opacity-80` neben Label; `aria-current="page"` auf aktivem Button

### Privacy & Share-Settings (Owner)

```typescript
// Kernidee in owner_preferences (JSONB) + Defaults im Code
// Eigenes Profil: Anzeige ungefiltert; fremdes Profil: Share-Settings aus DB
```

- Öffentliche Owner-Page: **keine** Telefon/E-Mail/Adresse; Kontakt nur über **Chat**
- Namensformat auf Public Page: **„Vorname N.“** (`formatOwnerName`)

### Tierhalter-Jobs
- **Daten**: `owner_jobs` + n:m `owner_job_pets`
- **RLS**: Lesen offener Jobs für `authenticated`; INSERT/UPDATE nur `owner_id = auth.uid()` und **`user_has_db_premium(auth.uid())`**
- **`user_has_db_premium`**: `SECURITY DEFINER`, soll mit **Client-Premium** übereinstimmen — `plan_type` (lowercase) `premium` + gültiges `plan_expires_at` **oder** **Promo** wie `SubscriptionService`: `created_at < 2026-05-01 UTC` und `created_at + 3 Monate > now()`
- **App**: `ownerJobService`, `ownerJobApply` → `getOrCreateConversation` + `sendMessage`
- **Gating UI**: `FEATURE_MATRIX` `post_owner_jobs` / `apply_owner_jobs` + `user_type` / `isCaretakerLikeUserType`
- **`pets`**: Zusätzliche SELECT-Policy für Zeilen, die an **offene** Jobs gekoppelt sind (Tiernamen in Job-Karten)

### Datenbank / Service
- Wo nötig: **getrennte Queries** statt eines komplexen Joins (RLS, Lesbarkeit)
- Auth: Session/User-ID aus Supabase Auth für RLS-Kontext

### Marktplatz-UI (`MarketplacePage`)
- **Layout** an **Betreuer-Suche** (`SearchPage`) angeglichen: `bg-gray-50 min-h-screen`, linke Spalte `lg:w-80`, **`sticky top-8`**
- **Zwei Karten** statt einer: (1) **Kategorie** — vertikale Liste via `MarketplaceCategoryBrowser` `variant="sidebar"` (Links mit `?kategorie=`), optional `max-h` + Scroll; (2) **Weitere Filter** — **ausklappbar** (`filtersExpanded`), Kopfzeile mit `SlidersHorizontal`, Chevron, Hinweis auf aktive Zusatzfilter; Inhalt = `MarketplaceFilters` **`layout="search"`** (Labels/Inputs wie SearchPage: Icons links, `py-2.5`, `focus:ring-primary-500`)
- `MarketplaceFilters`: zusätzliche Layouts **`horizontal`** (Standard-Grid), **`sidebar`** (kompakt), **`search`** (Suche-Stil)

### Footer
- **`lg:grid-cols-5`**: Logo + Spalten **Für Tierhalter**, **Unternehmen**, **Marktplatz** (Link **Nutzungsbedingungen** → `/marktplatz/nutzungsbedingungen`)

### Marktplatz-Recht & Formular
- `MarketplaceTermsPage`: statische NB tigube-Marktplatz
- `CreateListingForm`: bei **neuer** Anzeige Checkbox Zustimmung NB (Link in neuem Tab), Submit gesperrt ohne Zustimmung

### Branding (Copy)
- Schreibweise **tigube** durchgängig **klein** in UI- und Rechtstexten (Ausnahme: rechtliche Form „tigube UG“ wo nötig)

### UI
- Modals statt `alert` wo möglich
- Formulare: controlled components, konsistente Button-/Input-Klassen (`input`, Tailwind)

## Coding-Standards

### TypeScript
- Strikte Typen, `any` vermeiden
- `Database`-Typ aus `database.types.ts` für Supabase-Tabellen

### React (Vite SPA)
- Funktionale Komponenten + Hooks
- **Lazy loading** für Routen in `App.tsx`
- Kein Next.js App Router in diesem Repo

### Supabase
- RLS auf Tabellen aktiv
- Client: `src/lib/supabase/client.ts`
