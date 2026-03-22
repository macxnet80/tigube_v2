-- Admins pflegen Kategorien: Schreibrechte für authenticated (RLS beschränkt auf is_admin)
GRANT INSERT, UPDATE, DELETE ON public.marketplace_categories TO authenticated;
