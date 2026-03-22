# Release März 2026 (Kurz)

**Canonical:** Eintrag in Supabase `public.content_items`, `type = 'release'`, `slug = 2026-03-marz-profil-jobs`.

- **Öffentlich in der App:** Route `/was-ist-neu` und Detail `/was-ist-neu/2026-03-marz-profil-jobs`
- **Repo-SQL:** `supabase/migrations/20260325120000_seed_release_2026_03_marz.sql` (idempotent per `ON CONFLICT (slug)`)

Textpflege: nicht hier duplizieren — Migration anpassen oder in der DB (Admin) bearbeiten; bei Memory-Updates `.cursorrules` (Supabase-MCP + `content_items`).
