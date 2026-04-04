-- Tierhalter-Freischaltung: Spalten auf users + RLS für owner_jobs

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS owner_approval_status TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS owner_approval_requested_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS owner_approval_notes TEXT;

UPDATE public.users
SET owner_approval_status = 'not_requested'
WHERE owner_approval_status IS NULL;

ALTER TABLE public.users ALTER COLUMN owner_approval_status SET DEFAULT 'not_requested';

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_owner_approval_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_owner_approval_status_check
  CHECK (owner_approval_status IN ('not_requested', 'pending', 'approved', 'rejected'));

COMMENT ON COLUMN public.users.owner_approval_status IS 'Freigabe Tierhalter-Profil/Gesuche: not_requested | pending | approved | rejected';

CREATE OR REPLACE FUNCTION public.user_has_owner_approval(uid UUID)
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
      AND u.owner_approval_status = 'approved'
  );
$$;

COMMENT ON FUNCTION public.user_has_owner_approval(UUID) IS 'RLS: Tierhalter darf Gesuche erstellen, wenn freigegeben';

-- owner_jobs: SELECT — offene Jobs nur von freigegebenen Tierhaltern (eigene Jobs immer sichtbar)
DROP POLICY IF EXISTS "owner_jobs_select_open_or_own" ON public.owner_jobs;
CREATE POLICY "owner_jobs_select_open_or_own"
  ON public.owner_jobs
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR (
      status = 'open'
      AND EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = owner_jobs.owner_id
          AND u.owner_approval_status = 'approved'
      )
    )
  );

-- owner_jobs: INSERT — Premium + Freischaltung
DROP POLICY IF EXISTS "owner_jobs_insert_owner_premium" ON public.owner_jobs;
CREATE POLICY "owner_jobs_insert_owner_premium"
  ON public.owner_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND public.user_has_db_premium(auth.uid())
    AND public.user_has_owner_approval(auth.uid())
  );

-- owner_jobs: UPDATE — nur mit Premium + Freischaltung (konsistent mit Anlegen)
DROP POLICY IF EXISTS "owner_jobs_update_owner_premium" ON public.owner_jobs;
CREATE POLICY "owner_jobs_update_owner_premium"
  ON public.owner_jobs
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    AND public.user_has_db_premium(auth.uid())
    AND public.user_has_owner_approval(auth.uid())
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND public.user_has_db_premium(auth.uid())
    AND public.user_has_owner_approval(auth.uid())
  );
