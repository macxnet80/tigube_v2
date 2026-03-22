-- Kurzvorstellung für öffentliches Tierhalter-Profil (Hero), getrennt von about_me (langer Text)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS short_intro TEXT DEFAULT NULL;

COMMENT ON COLUMN public.users.short_intro IS 'Kurzer Teaser für das öffentliche Owner-Profil (Hero)';
