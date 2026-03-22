# Tech Context: Tigube v2

## Stack (Ist)

### Frontend
- **Vite 5** (Dev-Server, Build)
- **React 18** + **TypeScript**
- **react-router-dom** v6 (Routing, Lazy Routes)
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Headless UI**, eigene UI-Komponenten (`components/ui/`)
- **Zustand** (globaler State wo genutzt)
- **react-hot-toast**, **Stripe.js**, weitere siehe `package.json`

### Backend / Daten
- **Supabase**: `@supabase/supabase-js` — Auth, Postgres, RLS, Storage, Realtime je nach Feature
- Typen: **`src/lib/supabase/database.types.ts`** — mit `Database` für Typed Client

### Tooling
- **npm** (Scripts: `dev`, `build`, `lint`, `preview`)
- **ESLint** 9
- **TypeScript** strict (tsconfig über `tsconfig.app.json`)

## Architektur

### SPA
- Ein **React-Baum** unter `src/main.tsx` / `App.tsx`
- **Layout**-Wrapper (Header, Footer)
- **Geschützte Routen**: `SafeProtectedRoute` (Owner/Caretaker-Flags)
- **Deutsche URLs** z. B. `/suche`, `/anmelden`, `/dashboard-owner`, `/jobs`, `/owner/:userId`

### Supabase
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Migrationen: `supabase/migrations/*.sql` — u. a. `short_intro`, `owner_jobs` / `owner_job_pets`, Fix **`user_has_db_premium`** (Promo + Premium, März 2026)
- Services in `src/lib/supabase/` (`db.ts`, `chatService.ts`, `ownerPublicService.ts`, `ownerJobService.ts`, …)

### Styling
- Utility-First Tailwind
- `cn()` aus `lib/utils` (clsx + tailwind-merge)
- `container-custom` in CSS/Tailwind config

## Constraints

- **Keine Secrets** im Frontend-Bundle
- **RLS** ist maßgeblich für Datenzugriff
- **Performance**: Lazy Routes, Vite code-splitting

## Deployment
- Statischer/SPA-Build (`vite build`, Output `dist/`)
- Typisch **Vercel** oder **Netlify** mit SPA-Fallback für Client-Routing
