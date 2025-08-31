-- Simplify services structure by integrating prices into services_with_categories
-- This migration consolidates services, prices, and services_with_categories into one unified structure

-- First, let's create a function to merge existing data
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
        SELECT id, services, prices, services_with_categories
        FROM caretaker_profiles 
        WHERE id IS NOT NULL
    LOOP
        merged_services := '[]'::jsonb;
        
        -- Start with existing services_with_categories
        IF profile_record.services_with_categories IS NOT NULL AND profile_record.services_with_categories != '[]'::jsonb THEN
            merged_services := profile_record.services_with_categories;
        END IF;
        
        -- Add services from legacy services field (if not already present)
        IF profile_record.services IS NOT NULL THEN
            FOR service_name IN 
                SELECT jsonb_array_elements_text(profile_record.services::jsonb)
            LOOP
                -- Check if this service is already in merged_services
                IF NOT EXISTS (
                    SELECT 1 FROM jsonb_array_elements(merged_services) AS existing_service
                    WHERE jsonb_extract_path_text(existing_service, 'name') = service_name
                ) THEN
                    -- Get price for this service
                    service_price := NULL;
                    IF profile_record.prices IS NOT NULL THEN
                        service_price := (profile_record.prices->service_name)::numeric;
                    END IF;
                    
                    -- Create service object
                    service_obj := jsonb_build_object(
                        'name', service_name,
                        'category_id', default_category_id,
                        'category_name', 'Allgemein'
                    );
                    
                    -- Add price if available
                    IF service_price IS NOT NULL THEN
                        service_obj := service_obj || jsonb_build_object(
                            'price', service_price,
                            'price_type', 'per_hour'
                        );
                    END IF;
                    
                    merged_services := merged_services || jsonb_build_array(service_obj);
                END IF;
            END LOOP;
        END IF;
        
        -- Add services from prices field (if not already present)
        IF profile_record.prices IS NOT NULL THEN
            FOR service_name, service_price IN 
                SELECT key, value::numeric 
                FROM jsonb_each(profile_record.prices)
            LOOP
                -- Check if this service is already in merged_services
                IF NOT EXISTS (
                    SELECT 1 FROM jsonb_array_elements(merged_services) AS existing_service
                    WHERE jsonb_extract_path_text(existing_service, 'name') = service_name
                ) THEN
                    -- Create service object
                    service_obj := jsonb_build_object(
                        'name', service_name,
                        'category_id', default_category_id,
                        'category_name', 'Allgemein',
                        'price', service_price,
                        'price_type', 'per_hour'
                    );
                    
                    merged_services := merged_services || jsonb_build_array(service_obj);
                END IF;
            END LOOP;
        END IF;
        
        -- Update the profile with merged services
        UPDATE caretaker_profiles 
        SET services_with_categories = merged_services
        WHERE id = profile_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the merge function
SELECT merge_services_and_prices();

-- Update the get_services_as_strings function to work with new structure
CREATE OR REPLACE FUNCTION get_services_as_strings(profile_services_with_categories JSONB)
RETURNS TEXT[] AS $$
BEGIN
    IF profile_services_with_categories IS NULL OR profile_services_with_categories = '[]'::jsonb THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    RETURN ARRAY(
        SELECT jsonb_extract_path_text(service, 'name')
        FROM jsonb_array_elements(profile_services_with_categories) AS service
        WHERE jsonb_extract_path_text(service, 'name') IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to get prices from the new structure
CREATE OR REPLACE FUNCTION get_services_prices(profile_services_with_categories JSONB)
RETURNS JSONB AS $$
BEGIN
    IF profile_services_with_categories IS NULL OR profile_services_with_categories = '[]'::jsonb THEN
        RETURN '{}'::jsonb;
    END IF;
    
    RETURN (
        SELECT jsonb_object_agg(
            jsonb_extract_path_text(service, 'name'),
            jsonb_extract_path_text(service, 'price')
        )
        FROM jsonb_array_elements(profile_services_with_categories) AS service
        WHERE jsonb_extract_path_text(service, 'price') IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the caretaker_search_view to use the new structure
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
  cp.overnight_availability
FROM caretaker_profiles cp
LEFT JOIN users u ON cp.id = u.id
WHERE u.user_type = 'caretaker';

-- Drop the merge function as it's no longer needed
DROP FUNCTION IF EXISTS merge_services_and_prices();

-- Add comments to document the new structure
COMMENT ON COLUMN caretaker_profiles.services_with_categories IS 'Unified services structure with categories and prices: [{"name": "Service Name", "category_id": 1, "category_name": "Category Name", "price": 15, "price_type": "per_hour"}]';
COMMENT ON COLUMN caretaker_profiles.services IS 'DEPRECATED: Use services_with_categories instead';
COMMENT ON COLUMN caretaker_profiles.prices IS 'DEPRECATED: Prices are now integrated into services_with_categories';
