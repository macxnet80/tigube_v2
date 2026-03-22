-- Allow release notes as content type (separate from blog/news)
ALTER TABLE public.content_items DROP CONSTRAINT IF EXISTS content_items_type_check;
ALTER TABLE public.content_items
  ADD CONSTRAINT content_items_type_check
  CHECK (type IN ('blog', 'news', 'release'));
