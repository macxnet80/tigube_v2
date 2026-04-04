-- Admin: Tierhalter-Gesuche (owner_jobs) löschen mit Hinweis für den Nutzer (analog Marktplatz)

CREATE TABLE IF NOT EXISTS public.owner_job_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id UUID,
  job_title_snapshot TEXT,
  notice_type TEXT NOT NULL CHECK (notice_type IN ('job_deleted')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_owner_job_notices_user_id ON public.owner_job_notices(user_id);
CREATE INDEX IF NOT EXISTS idx_owner_job_notices_unread ON public.owner_job_notices(user_id) WHERE read_at IS NULL;

ALTER TABLE public.owner_job_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_job_notices_select_own" ON public.owner_job_notices;
CREATE POLICY "owner_job_notices_select_own"
  ON public.owner_job_notices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_job_notices_update_own_read" ON public.owner_job_notices;
CREATE POLICY "owner_job_notices_update_own_read"
  ON public.owner_job_notices
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, UPDATE ON public.owner_job_notices TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_owner_job(
  p_job_id UUID,
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

  SELECT owner_id, title INTO v_owner, v_title
  FROM public.owner_jobs
  WHERE id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.owner_job_notices (
    user_id,
    job_id,
    job_title_snapshot,
    notice_type,
    reason
  )
  VALUES (
    v_owner,
    NULL,
    v_title,
    'job_deleted',
    trim(p_reason)
  );

  DELETE FROM public.owner_jobs WHERE id = p_job_id;
END;
$$;

COMMENT ON FUNCTION public.admin_delete_owner_job(UUID, TEXT) IS 'Admin: Gesuch löschen; Tierhalter erhält Hinweis mit Grund';

GRANT EXECUTE ON FUNCTION public.admin_delete_owner_job(UUID, TEXT) TO authenticated;
