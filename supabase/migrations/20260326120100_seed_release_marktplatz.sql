-- Release-Hinweis für /was-ist-neu (Zubehör-Marktplatz)
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
  '2026-03-marktplatz-zubehoer',
  'Zubehör-Marktplatz',
  'Neuer Bereich /marktplatz: Leinen, Betten, Futter & Co. von der Community — ohne Tierverkauf. Kategorien in Supabase pflegbar.',
  $release$
• Marktplatz unter /marktplatz mit Kategorien (Leinen, Betten, Spielzeug, Futter, …), Filter und Sortierung.

• Anzeigen erstellen mit Fotos (Storage-Bucket marketplace-listing-images), Merkliste und Kontakt per bestehenden Nachrichten.

• Kategorien sind in der Datenbank verwaltbar (Admins); ausdrücklich kein Handel mit lebenden Tieren.
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
