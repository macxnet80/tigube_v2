-- Kompakter Release-Eintrag für /was-ist-neu und Dashboard-Teaser (content_items.type = release)
INSERT INTO public.content_items (
  type,
  slug,
  title,
  excerpt,
  content,
  status,
  published_at
)
VALUES (
  'release',
  '2026-03-marz-profil-jobs',
  'März 2026: Profil, Jobs & Dashboard',
  'Öffentliches Tierhalter-Profil mit Kurzvorstellung, Premium-Stellenanzeigen mit Chat-Bewerbung und Sidebar im Owner-Dashboard wie bei Betreuern.',
  $release$
• Profil: Kurzvorstellung und „Über mich“ für Tierhalter (eigenes Tab im Dashboard); öffentliche Seite bleibt ohne sensible Kontaktdaten.

• Jobs: Unter /jobs und auf dem öffentlichen Profil; Premium-Betreuer bewerben sich per Chat.

• Dashboard: Owner-Navigation als Sidebar mit Icons, analog zum Betreuer-Dashboard.

• Technik: Spalte short_intro; Premium-Check für Job-RLS inkl. Promo mit der App abgestimmt.
$release$,
  'published',
  timestamptz '2026-03-22 12:00:00+00'
)
ON CONFLICT (slug) DO UPDATE SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();
