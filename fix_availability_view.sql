-- Remove services and prices columns from caretaker_search_view
-- Führe diese SQL-Befehle in deiner Supabase SQL Editor aus

-- Drop and recreate the caretaker_search_view without services and prices columns
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
  END as full_name,
  u.city,
  u.plz,
  u.profile_photo_url,
  cp.animal_types,
  -- Removed: services and prices (now derived from services_with_categories)
  cp.services_with_categories,
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
  -- Add availability data from the availability JSONB column
  cp.availability,
  -- Extract specific availability fields for easier access
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Mo' 
    THEN (cp.availability->>'Mo')::jsonb 
    ELSE '[]'::jsonb 
  END as monday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Di' 
    THEN (cp.availability->>'Di')::jsonb 
    ELSE '[]'::jsonb 
  END as tuesday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Mi' 
    THEN (cp.availability->>'Mi')::jsonb 
    ELSE '[]'::jsonb 
  END as wednesday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Do' 
    THEN (cp.availability->>'Do')::jsonb 
    ELSE '[]'::jsonb 
  END as thursday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Fr' 
    THEN (cp.availability->>'Fr')::jsonb 
    ELSE '[]'::jsonb 
  END as friday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Sa' 
    THEN (cp.availability->>'Sa')::jsonb 
    ELSE '[]'::jsonb 
  END as saturday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'So' 
    THEN (cp.availability->>'So')::jsonb 
    ELSE '[]'::jsonb 
  END as sunday_availability,
  -- Add approval status
  cp.approval_status,
  cp.created_at,
  cp.updated_at
FROM caretaker_profiles cp
LEFT JOIN users u ON cp.id = u.id
WHERE u.user_type = 'caretaker';

-- Add comments to document the changes
COMMENT ON VIEW caretaker_search_view IS 'Updated view without services and prices columns - use services_with_categories instead';
COMMENT ON COLUMN caretaker_search_view.services_with_categories IS 'Unified services structure with categories and prices - use this instead of separate services/prices columns';
