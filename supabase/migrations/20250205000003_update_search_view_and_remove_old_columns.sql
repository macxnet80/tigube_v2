-- Update caretaker_search_view to include availability data and remove old columns
-- This migration updates the view to properly handle availability and removes deprecated columns

-- First, let's update the caretaker_search_view to include proper availability data
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
  -- Get services as string array from new structure
  get_services_as_strings(cp.services_with_categories) as services,
  -- Get prices from new structure
  get_services_prices(cp.services_with_categories) as prices,
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
    ELSE '{}'::jsonb 
  END as monday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Di' 
    THEN (cp.availability->>'Di')::jsonb 
    ELSE '{}'::jsonb 
  END as tuesday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Mi' 
    THEN (cp.availability->>'Mi')::jsonb 
    ELSE '{}'::jsonb 
  END as wednesday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Do' 
    THEN (cp.availability->>'Do')::jsonb 
    ELSE '{}'::jsonb 
  END as thursday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Fr' 
    THEN (cp.availability->>'Fr')::jsonb 
    ELSE '{}'::jsonb 
  END as friday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'Sa' 
    THEN (cp.availability->>'Sa')::jsonb 
    ELSE '{}'::jsonb 
  END as saturday_availability,
  CASE 
    WHEN cp.availability IS NOT NULL AND cp.availability ? 'So' 
    THEN (cp.availability->>'So')::jsonb 
    ELSE '{}'::jsonb 
  END as sunday_availability,
  -- Add approval status
  cp.approval_status,
  cp.created_at,
  cp.updated_at
FROM caretaker_profiles cp
LEFT JOIN users u ON cp.id = u.id
WHERE u.user_type = 'caretaker';

-- Now let's remove the old services and prices columns
-- First, let's make sure all data is properly migrated
DO $$
BEGIN
  -- Check if there are any profiles that still have data in the old columns
  IF EXISTS (
    SELECT 1 FROM caretaker_profiles 
    WHERE (services IS NOT NULL AND services != '[]'::jsonb) 
       OR (prices IS NOT NULL AND prices != '{}'::jsonb)
  ) THEN
    RAISE NOTICE 'Some profiles still have data in old columns. Running merge function again...';
    PERFORM merge_services_and_prices();
  END IF;
END $$;

-- Drop the old columns
ALTER TABLE caretaker_profiles DROP COLUMN IF EXISTS services;
ALTER TABLE caretaker_profiles DROP COLUMN IF EXISTS prices;

-- Update the merge function to handle the case where old columns don't exist
CREATE OR REPLACE FUNCTION merge_services_and_prices()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    merged_services JSONB := '[]'::jsonb;
    service_obj JSONB;
    service_name TEXT;
    service_price NUMERIC;
    default_category_id INTEGER;
BEGIN
    -- Get the "Allgemein" category ID as default
    SELECT id INTO default_category_id FROM service_categories WHERE name = 'Allgemein' LIMIT 1;
    
    -- If no default category exists, create it
    IF default_category_id IS NULL THEN
        INSERT INTO service_categories (name, description, sort_order) 
        VALUES ('Allgemein', 'Grundlegende Betreuungsleistungen', 8)
        RETURNING id INTO default_category_id;
    END IF;

    -- Process each caretaker profile
    FOR profile_record IN 
        SELECT id, services_with_categories
        FROM caretaker_profiles 
        WHERE id IS NOT NULL
    LOOP
        -- If services_with_categories is empty or null, initialize it
        IF profile_record.services_with_categories IS NULL OR profile_record.services_with_categories = '[]'::jsonb THEN
            UPDATE caretaker_profiles 
            SET services_with_categories = '[]'::jsonb
            WHERE id = profile_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments to document the changes
COMMENT ON VIEW caretaker_search_view IS 'Updated view with proper availability data and unified services structure';
COMMENT ON COLUMN caretaker_profiles.services_with_categories IS 'Unified services structure with categories and prices: [{"name": "Service Name", "category_id": 1, "category_name": "Category Name", "price": 15, "price_type": "per_hour"}]';
