-- Anfahrtskosten strukturiert: €/km + optionale Frei-Kilometer
ALTER TABLE public.caretaker_profiles
ADD COLUMN IF NOT EXISTS travel_cost_config jsonb DEFAULT NULL;

COMMENT ON COLUMN public.caretaker_profiles.travel_cost_config IS 'Anfahrtskosten als JSON: { "price_per_km": number, "free_km": number (optional, ganze km) }';

-- caretaker_search_view um travel_cost_config erweitern
DROP VIEW IF EXISTS caretaker_search_view;
CREATE VIEW caretaker_search_view AS
SELECT
  u.id,
  u.first_name,
  u.last_name,
  CASE
    WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
    THEN u.first_name || ' ' || LEFT(u.last_name, 1) || '.'
    WHEN u.first_name IS NOT NULL
    THEN u.first_name
    ELSE 'Unbekannt'
  END AS full_name,
  u.city,
  u.plz,
  u.profile_photo_url,
  cp.animal_types,
  cp.services_with_categories,
  cp.travel_cost_config,
  cp.hourly_rate,
  cp.rating,
  cp.review_count,
  cp.is_verified,
  cp.short_about_me,
  cp.long_about_me,
  cp.experience_years,
  cp.experience_description,
  cp.qualifications,
  cp.languages,
  cp.service_radius,
  cp.home_photos,
  cp.is_commercial,
  cp.company_name,
  cp.tax_number,
  cp.vat_id,
  cp.short_term_available,
  cp.overnight_availability,
  cp.availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Mo'
    THEN (cp.availability->>'Mo')::jsonb
    ELSE '[]'::jsonb
  END AS monday_availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Di'
    THEN (cp.availability->>'Di')::jsonb
    ELSE '[]'::jsonb
  END AS tuesday_availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Mi'
    THEN (cp.availability->>'Mi')::jsonb
    ELSE '[]'::jsonb
  END AS wednesday_availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Do'
    THEN (cp.availability->>'Do')::jsonb
    ELSE '[]'::jsonb
  END AS thursday_availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Fr'
    THEN (cp.availability->>'Fr')::jsonb
    ELSE '[]'::jsonb
  END AS friday_availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Sa'
    THEN (cp.availability->>'Sa')::jsonb
    ELSE '[]'::jsonb
  END AS saturday_availability,
  CASE
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'So'
    THEN (cp.availability->>'So')::jsonb
    ELSE '[]'::jsonb
  END AS sunday_availability,
  cp.approval_status,
  cp.created_at,
  cp.updated_at
FROM caretaker_profiles cp
LEFT JOIN users u ON cp.id = u.id
WHERE u.user_type = 'caretaker'
  AND cp.approval_status = 'approved';

GRANT SELECT ON caretaker_search_view TO authenticated;
GRANT SELECT ON caretaker_search_view TO anon;
