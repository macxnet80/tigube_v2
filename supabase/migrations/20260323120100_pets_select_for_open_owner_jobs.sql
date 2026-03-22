-- Tiernamen für öffentlich sichtbare Jobs: authentifizierte Nutzer dürfen minimale Pet-Zeilen lesen,
-- wenn das Tier mit einem offenen Tierhalter-Job verknüpft ist.
CREATE POLICY "pets_select_linked_open_owner_job"
  ON public.pets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.owner_job_pets ojp
      JOIN public.owner_jobs oj ON oj.id = ojp.job_id
      WHERE ojp.pet_id = pets.id
        AND oj.status = 'open'
    )
  );
