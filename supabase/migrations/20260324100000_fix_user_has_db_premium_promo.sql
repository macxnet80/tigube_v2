-- owner_jobs RLS: Premium-Erkennung wie im Client (SubscriptionService)
-- - plan_type = premium (case-insensitive) und nicht abgelaufen
-- - ODER: Registrierung vor 2026-05-01 UTC und innerhalb von 3 Monaten nach created_at (Promo)

CREATE OR REPLACE FUNCTION public.user_has_db_premium(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = uid
      AND (
        (
          lower(trim(coalesce(u.plan_type, ''))) = 'premium'
          AND (u.plan_expires_at IS NULL OR u.plan_expires_at > NOW())
        )
        OR
        (
          u.created_at IS NOT NULL
          AND u.created_at < TIMESTAMPTZ '2026-05-01T00:00:00Z'
          AND (u.created_at + INTERVAL '3 months') > NOW()
        )
      )
  );
$$;

COMMENT ON FUNCTION public.user_has_db_premium(UUID) IS
  'RLS: Premium = (plan_type premium + gültiges Ablaufdatum) oder 3-Monats-Promo für Registrierung vor 2026-05-01 UTC (wie SubscriptionService)';
