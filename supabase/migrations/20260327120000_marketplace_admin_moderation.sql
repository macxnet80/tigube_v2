-- Admin-Moderation Marktplatz: deaktivieren (mit Grund), löschen (mit Grund + Hinweis für Nutzer)

-- Status um 'inactive' erweitern (vom Admin gesetzt, nicht öffentlich sichtbar)
ALTER TABLE public.marketplace_listings
  DROP CONSTRAINT IF EXISTS marketplace_listings_status_check;

ALTER TABLE public.marketplace_listings
  ADD CONSTRAINT marketplace_listings_status_check
  CHECK (status IN ('draft', 'active', 'sold', 'expired', 'inactive'));

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS admin_deactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_deactivation_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_deactivated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.marketplace_listings.admin_deactivation_reason IS 'Vom Admin gesetzter Grund bei Deaktivierung; für Anzeigeninhaber sichtbar';

-- Benachrichtigungen für Inhaber (auch nach Löschen der Anzeige lesbar)
CREATE TABLE IF NOT EXISTS public.marketplace_listing_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID,
  listing_title_snapshot TEXT,
  notice_type TEXT NOT NULL CHECK (notice_type IN ('listing_deactivated', 'listing_deleted')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_notices_user_id ON public.marketplace_listing_notices(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_notices_unread ON public.marketplace_listing_notices(user_id) WHERE read_at IS NULL;

ALTER TABLE public.marketplace_listing_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_notices_select_own" ON public.marketplace_listing_notices;
CREATE POLICY "marketplace_notices_select_own"
  ON public.marketplace_listing_notices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_notices_update_own_read" ON public.marketplace_listing_notices;
CREATE POLICY "marketplace_notices_update_own_read"
  ON public.marketplace_listing_notices
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, UPDATE ON public.marketplace_listing_notices TO authenticated;

-- Admin: Anzeige deaktivieren (Hinweis + Status inactive)
CREATE OR REPLACE FUNCTION public.admin_deactivate_marketplace_listing(
  p_listing_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_title TEXT;
BEGIN
  IF NOT public.check_admin_access(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'reason_too_short' USING ERRCODE = '22023';
  END IF;

  SELECT user_id, title INTO v_owner, v_title
  FROM public.marketplace_listings
  WHERE id = p_listing_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'listing_not_found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.marketplace_listings
  SET
    status = 'inactive',
    admin_deactivation_reason = trim(p_reason),
    admin_deactivated_at = NOW(),
    admin_deactivated_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_listing_id;

  INSERT INTO public.marketplace_listing_notices (
    user_id,
    listing_id,
    listing_title_snapshot,
    notice_type,
    reason
  )
  VALUES (
    v_owner,
    p_listing_id,
    v_title,
    'listing_deactivated',
    trim(p_reason)
  );
END;
$$;

COMMENT ON FUNCTION public.admin_deactivate_marketplace_listing(UUID, TEXT) IS 'Admin: Marktplatz-Anzeige ausblenden, Inhaber erhält Hinweis mit Grund';

-- Admin: Anzeige löschen (Hinweis vor Löschen persistieren)
CREATE OR REPLACE FUNCTION public.admin_delete_marketplace_listing(
  p_listing_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_title TEXT;
BEGIN
  IF NOT public.check_admin_access(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'reason_too_short' USING ERRCODE = '22023';
  END IF;

  SELECT user_id, title INTO v_owner, v_title
  FROM public.marketplace_listings
  WHERE id = p_listing_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'listing_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.marketplace_listing_notices (
    user_id,
    listing_id,
    listing_title_snapshot,
    notice_type,
    reason
  )
  VALUES (
    v_owner,
    NULL,
    v_title,
    'listing_deleted',
    trim(p_reason)
  );

  DELETE FROM public.marketplace_listings WHERE id = p_listing_id;
END;
$$;

COMMENT ON FUNCTION public.admin_delete_marketplace_listing(UUID, TEXT) IS 'Admin: Anzeige löschen; Inhaber sieht Grund unter „Was ist passiert?“';

GRANT EXECUTE ON FUNCTION public.admin_deactivate_marketplace_listing(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_marketplace_listing(UUID, TEXT) TO authenticated;
