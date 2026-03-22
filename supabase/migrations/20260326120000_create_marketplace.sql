-- Haustier-Zubehör-Marktplatz (kein Tierhandel): Kategorien, Anzeigen, Bilder, Favoriten

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT,
  parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_categories_parent_id ON public.marketplace_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_sort ON public.marketplace_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_active ON public.marketplace_categories(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2),
  price_type TEXT NOT NULL DEFAULT 'festpreis'
    CHECK (price_type IN ('kostenlos', 'festpreis', 'verhandelbar')),
  listing_type TEXT NOT NULL DEFAULT 'biete'
    CHECK (listing_type IN ('biete', 'suche', 'verschenke')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'sold', 'expired')),
  location_city TEXT,
  location_zip TEXT,
  condition TEXT CHECK (condition IS NULL OR condition IN ('neu', 'wie_neu', 'gut', 'akzeptabel')),
  suitable_for TEXT[] NOT NULL DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user_id ON public.marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category_id ON public.marketplace_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created ON public.marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location_zip ON public.marketplace_listings(location_zip);

CREATE TABLE IF NOT EXISTS public.marketplace_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_images_listing_id ON public.marketplace_images(listing_id);

CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_listing_id ON public.marketplace_favorites(listing_id);

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_marketplace_categories_updated_at ON public.marketplace_categories;
CREATE TRIGGER trigger_marketplace_categories_updated_at
  BEFORE UPDATE ON public.marketplace_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_updated_at();

DROP TRIGGER IF EXISTS trigger_marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER trigger_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_updated_at();

-- ---------------------------------------------------------------------------
-- View-Zähler (öffentlich, nur aktive Anzeigen)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_marketplace_listing_view(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET view_count = view_count + 1
  WHERE id = p_listing_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;

COMMENT ON FUNCTION public.increment_marketplace_listing_view(UUID) IS 'Erhöht view_count nur für aktive, nicht abgelaufene Anzeigen';

GRANT EXECUTE ON FUNCTION public.increment_marketplace_listing_view(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_marketplace_listing_view(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Seed-Kategorien (Zubehör, kein Tierhandel)
-- ---------------------------------------------------------------------------

INSERT INTO public.marketplace_categories (name, slug, icon_name, sort_order, is_active)
VALUES
  ('Leinen & Halsbänder', 'leinen-halsbaender', 'Link', 10, true),
  ('Betten & Körbe', 'betten-koerbe', 'Armchair', 20, true),
  ('Spielzeug', 'spielzeug', 'ToyBrick', 30, true),
  ('Futter & Snacks', 'futter-snacks', 'Cookie', 40, true),
  ('Pflegeprodukte', 'pflegeprodukte', 'Sparkles', 50, true),
  ('Transportboxen & Taschen', 'transport-taschen', 'Package', 60, true),
  ('Kleidung & Accessoires', 'kleidung-accessoires', 'Shirt', 70, true),
  ('Käfige & Gehege', 'kaefige-gehege', 'Fence', 80, true),
  ('Aquaristik & Terraristik', 'aquaristik-terraristik', 'Fish', 90, true),
  ('Stalltechnik & Pferdezubehör', 'stall-pferdezubehoer', 'Warehouse', 100, true),
  ('Bücher & Medien', 'buecher-medien', 'BookOpen', 110, true),
  ('Sonstiges', 'sonstiges', 'CircleDot', 999, true)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage: Listing-Bilder
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-listing-images', 'marketplace-listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Öffentliches Lesen
DROP POLICY IF EXISTS "marketplace_images_public_read" ON storage.objects;
CREATE POLICY "marketplace_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-listing-images');

-- Upload nur im eigenen Ordner: {auth.uid()}/...
DROP POLICY IF EXISTS "marketplace_images_authenticated_insert_own_folder" ON storage.objects;
CREATE POLICY "marketplace_images_authenticated_insert_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marketplace-listing-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS "marketplace_images_authenticated_update_own_folder" ON storage.objects;
CREATE POLICY "marketplace_images_authenticated_update_own_folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marketplace-listing-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS "marketplace_images_authenticated_delete_own_folder" ON storage.objects;
CREATE POLICY "marketplace_images_authenticated_delete_own_folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'marketplace-listing-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;

-- Kategorien: lesen (aktiv für alle; inaktiv nur Admin)
DROP POLICY IF EXISTS "marketplace_categories_select_public" ON public.marketplace_categories;
CREATE POLICY "marketplace_categories_select_public"
  ON public.marketplace_categories
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );

DROP POLICY IF EXISTS "marketplace_categories_admin_all" ON public.marketplace_categories;
CREATE POLICY "marketplace_categories_admin_all"
  ON public.marketplace_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = true)
  );

-- Listings: öffentlich lesen wenn aktiv & nicht abgelaufen; eigene immer
DROP POLICY IF EXISTS "marketplace_listings_select" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_select"
  ON public.marketplace_listings
  FOR SELECT
  TO anon, authenticated
  USING (
    user_id = auth.uid()
    OR (
      status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

DROP POLICY IF EXISTS "marketplace_listings_insert_own" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_insert_own"
  ON public.marketplace_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_listings_update_own" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_update_own"
  ON public.marketplace_listings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_listings_delete_own" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_delete_own"
  ON public.marketplace_listings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Bilder: lesen wenn Listing sichtbar
DROP POLICY IF EXISTS "marketplace_images_select" ON public.marketplace_images;
CREATE POLICY "marketplace_images_select"
  ON public.marketplace_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id
        AND (
          l.user_id = auth.uid()
          OR (
            l.status = 'active'
            AND (l.expires_at IS NULL OR l.expires_at > NOW())
          )
        )
    )
  );

DROP POLICY IF EXISTS "marketplace_images_insert_owner" ON public.marketplace_images;
CREATE POLICY "marketplace_images_insert_owner"
  ON public.marketplace_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id AND l.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "marketplace_images_delete_owner" ON public.marketplace_images;
CREATE POLICY "marketplace_images_delete_owner"
  ON public.marketplace_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id AND l.user_id = auth.uid()
    )
  );

-- Favoriten
DROP POLICY IF EXISTS "marketplace_favorites_select_own" ON public.marketplace_favorites;
CREATE POLICY "marketplace_favorites_select_own"
  ON public.marketplace_favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_favorites_insert_own" ON public.marketplace_favorites;
CREATE POLICY "marketplace_favorites_insert_own"
  ON public.marketplace_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_favorites_delete_own" ON public.marketplace_favorites;
CREATE POLICY "marketplace_favorites_delete_own"
  ON public.marketplace_favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT SELECT ON public.marketplace_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT SELECT ON public.marketplace_listings TO anon;
GRANT SELECT, INSERT, DELETE ON public.marketplace_images TO authenticated;
GRANT SELECT ON public.marketplace_images TO anon;
GRANT SELECT, INSERT, DELETE ON public.marketplace_favorites TO authenticated;

-- Verkäufer von aktiven Anzeigen: eingeschränkte öffentliche Sichtbarkeit (bestehende users-RLS bleibt für andere Fälle)
DROP POLICY IF EXISTS "Public can view marketplace listing sellers" ON public.users;
CREATE POLICY "Public can view marketplace listing sellers"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.marketplace_listings l
      WHERE l.user_id = users.id
        AND l.status = 'active'
        AND (l.expires_at IS NULL OR l.expires_at > NOW())
    )
  );
