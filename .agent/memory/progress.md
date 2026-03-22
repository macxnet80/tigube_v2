# Progress

## Completed (Auszug, Stand 2026-03)

### Öffentliches Tierhalter-Profil & Dashboard
- [x] `about_me`, Share-Settings, Public-Profil mit Datenschutz (kein Kontakt auf Public Page)
- [x] `short_intro` (Kurzvorstellung), Migration + Dashboard + Public Hero
- [x] Öffentliches Profil: Layout an Betreuer-Profil (Hero, Grid, Karten)
- [x] Bearbeitung Kurzvorstellung / Über mich: **Stift**, **Speichern** / **Abbrechen** (wie Caretaker)
- [x] Tab **„Öffentliches Profil“** im Owner-Dashboard; H2 „Öffentliches Profil“ im Inhalt entfernt

### Datenbank / RLS (Nachziehen auf allen Umgebungen)
- [x] Spalte **`users.short_intro`** (Profil Hero / Dashboard)
- [x] **`user_has_db_premium`**: Promo + `plan_type` premium (Fix „row-level security policy“ beim Job-Anlegen)

### Tierhalter-Jobs (Premium)
- [x] DB: `owner_jobs`, `owner_job_pets`, RLS, `user_has_db_premium`, Policy auf `pets` für Job-Kontext
- [x] `ownerJobService`, `ownerJobApply`, Typen `PublicOwnerJob`, Einbindung in `ownerPublicService`
- [x] `FEATURE_MATRIX`: `post_owner_jobs`, `apply_owner_jobs`
- [x] Owner-Dashboard Tab **Jobs** (`OwnerDashboardJobsTab`), Seite **`/jobs`**, Header-Link
- [x] `OwnerJobCard`, Bewerbung → Chat + Navigation zu `/nachrichten/:id`
- [x] OwnerJobsPage: „Zurück“-Link entfernt (nur Kopfbereich mit Titel)

### Owner-Dashboard Navigation
- [x] Umstellung von horizontaler Tab-Leiste auf **Sidebar-Layout** wie Caretaker-Dashboard (`lg:grid-cols-4`, sticky Nav)
- [x] **Icons** für alle Sidebar-Einträge (u. a. Share2, BookUser, HelpCircle)

### Technik / Repo
- [x] `database.types.ts` als normale TS-Datei (kein JSON-Wrapper)
- [x] `OWNER_SERVICE_TAGS` in `src/lib/constants/ownerServices.ts`
- [x] `isCaretakerLikeUserType` in `lib/utils.ts`

### Dokumentation
- [x] `user_roles.md` (Rollenüberblick, wo vorhanden)

## Pending / Backlog

- [ ] Mobile-Optimierung Dashboards (Owner/Caretaker) — teils durch Sidebar-Horizontalscroll gemildert
- [ ] Automatisierte E2E-Tests (Playwright o. ä.)

## Known Issues
- Keine umfassende Test-Suite; Verifikation primär `npm run build` + manuelle Flows
- CaretakerDashboard: esbuild-Warnung **doppelter Key `Hausbesuch`** in einem Objekt-Literal (bestehend, niedrig prioritär)

## Migrationen (Referenz, Repo)
- `20260322120000_add_short_intro_to_users.sql`
- `20260323120000_create_owner_jobs.sql`, `20260323120100_pets_select_for_open_owner_jobs.sql`
- `20260324100000_fix_user_has_db_premium_promo.sql`
- Remote kann andere Timestamp-Namen haben (MCP `apply_migration`) — SQL-Inhalt ist maßgeblich
