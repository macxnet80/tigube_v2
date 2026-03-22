-- Platzhalter-Releases entfernen (Teaser /was-ist-neu); echte Releases bleiben erhalten
DELETE FROM public.content_item_tags
WHERE content_item_id IN (
  SELECT id FROM public.content_items
  WHERE slug IN ('2025-03-15-beispiel-release', '2025-03-22-was-ist-neu')
);

DELETE FROM public.content_item_categories
WHERE content_item_id IN (
  SELECT id FROM public.content_items
  WHERE slug IN ('2025-03-15-beispiel-release', '2025-03-22-was-ist-neu')
);

DELETE FROM public.content_items
WHERE slug IN ('2025-03-15-beispiel-release', '2025-03-22-was-ist-neu');
