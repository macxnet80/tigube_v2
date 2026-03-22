-- Tierhalter-Jobs (Premium): Aufträge mit optionalen Haustier-Verknüpfungen
CREATE TABLE IF NOT EXISTS public.owner_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  date_from DATE,
  date_to DATE,
  location_text TEXT,
  service_tags TEXT[] DEFAULT '{}',
  budget_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_jobs_owner_id ON public.owner_jobs(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_jobs_status ON public.owner_jobs(status);
CREATE INDEX IF NOT EXISTS idx_owner_jobs_dates ON public.owner_jobs(date_from, date_to);

CREATE TABLE IF NOT EXISTS public.owner_job_pets (
  job_id UUID NOT NULL REFERENCES public.owner_jobs(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (job_id, pet_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_job_pets_pet_id ON public.owner_job_pets(pet_id);

-- updated_at Trigger (wie üblich)
CREATE OR REPLACE FUNCTION public.update_owner_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_owner_jobs_updated_at ON public.owner_jobs;
CREATE TRIGGER trigger_update_owner_jobs_updated_at
  BEFORE UPDATE ON public.owner_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_owner_jobs_updated_at();

ALTER TABLE public.owner_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_job_pets ENABLE ROW LEVEL SECURITY;

-- Premium: plan_type = premium und (kein Ablaufdatum oder noch nicht abgelaufen)
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
      AND u.plan_type = 'premium'
      AND (u.plan_expires_at IS NULL OR u.plan_expires_at > NOW())
  );
$$;

COMMENT ON FUNCTION public.user_has_db_premium(UUID) IS 'RLS-Hilfe: Premium laut users.plan_type/plan_expires_at (ohne Client-Promo)';

-- owner_jobs: lesen
CREATE POLICY "owner_jobs_select_open_or_own"
  ON public.owner_jobs
  FOR SELECT
  TO authenticated
  USING (
    status = 'open'
    OR owner_id = auth.uid()
  );

-- owner_jobs: anlegen/ändern nur Owner + DB-Premium
CREATE POLICY "owner_jobs_insert_owner_premium"
  ON public.owner_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND public.user_has_db_premium(auth.uid())
  );

CREATE POLICY "owner_jobs_update_owner_premium"
  ON public.owner_jobs
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    AND public.user_has_db_premium(auth.uid())
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND public.user_has_db_premium(auth.uid())
  );

-- Löschen: immer als Owner (z. B. Aufräumen nach Downgrade)
CREATE POLICY "owner_jobs_delete_own"
  ON public.owner_jobs
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- owner_job_pets: lesen wenn Job sichtbar
CREATE POLICY "owner_job_pets_select"
  ON public.owner_job_pets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.owner_jobs j
      WHERE j.id = job_id
        AND (j.status = 'open' OR j.owner_id = auth.uid())
    )
  );

-- Verknüpfung nur wenn Job und Tier demselben Nutzer gehören
CREATE POLICY "owner_job_pets_insert_owner"
  ON public.owner_job_pets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.owner_jobs j
      JOIN public.pets p ON p.id = pet_id
      WHERE j.id = job_id
        AND j.owner_id = auth.uid()
        AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "owner_job_pets_delete_owner"
  ON public.owner_job_pets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.owner_jobs j
      WHERE j.id = job_id
        AND j.owner_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owner_jobs TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.owner_job_pets TO authenticated;
