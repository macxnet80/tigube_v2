-- Umkreissuche: PLZ-Geometrie aus lat/lng, RPCs für Cache + Radiusliste
-- PostGIS liegt im Schema `extensions` (Supabase-Standard)

-- Trigger: geography Spalte `location` aus latitude/longitude ableiten
CREATE OR REPLACE FUNCTION public.plzs_set_location()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_plzs_set_location ON public.plzs;
CREATE TRIGGER trg_plzs_set_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.plzs
  FOR EACH ROW
  EXECUTE FUNCTION public.plzs_set_location();

CREATE INDEX IF NOT EXISTS idx_plzs_location ON public.plzs USING GIST (location);

-- Koordinaten schreiben (von Client nach externem Geocoding); füllt alle Zeilen mit gleicher PLZ ohne lat/lng nach
CREATE OR REPLACE FUNCTION public.cache_plz_coordinates(
  p_plz text,
  p_city text,
  p_lat double precision,
  p_lng double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  c text;
BEGIN
  IF p_plz IS NULL OR p_plz !~ '^\d{5}$' THEN
    RAISE EXCEPTION 'invalid plz';
  END IF;
  IF p_lat IS NULL OR p_lng IS NULL THEN
    RAISE EXCEPTION 'invalid coordinates';
  END IF;
  -- Grobe Bounding Box Deutschland (inkl. Rand)
  IF p_lat < 47.0 OR p_lat > 55.5 OR p_lng < 5.5 OR p_lng > 15.5 THEN
    RAISE EXCEPTION 'coordinates outside supported area';
  END IF;

  c := NULLIF(trim(p_city), '');
  IF c IS NULL THEN
    RAISE EXCEPTION 'city required';
  END IF;

  INSERT INTO public.plzs (plz, city, latitude, longitude)
  VALUES (p_plz, c, p_lat, p_lng)
  ON CONFLICT (plz, city) DO UPDATE
  SET latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude;

  UPDATE public.plzs
  SET latitude = p_lat, longitude = p_lng
  WHERE plz = p_plz AND latitude IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.cache_plz_coordinates(text, text, double precision, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cache_plz_coordinates(text, text, double precision, double precision) TO anon;
GRANT EXECUTE ON FUNCTION public.cache_plz_coordinates(text, text, double precision, double precision) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cache_plz_coordinates(text, text, double precision, double precision) TO service_role;

-- Alle PLZ-Codes im Umkreis (km) um eine Ursprungs-PLZ (erste bekannte Koordinate dieser PLZ)
CREATE OR REPLACE FUNCTION public.search_nearby_plzs(
  origin_plz text,
  radius_km double precision DEFAULT 25
)
RETURNS TABLE(plz text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  origin_point geography;
BEGIN
  IF origin_plz IS NULL OR origin_plz !~ '^\d{5}$' THEN
    RETURN;
  END IF;

  SELECT p.location INTO origin_point
  FROM public.plzs p
  WHERE p.plz = origin_plz
    AND p.location IS NOT NULL
  ORDER BY p.city NULLS LAST
  LIMIT 1;

  IF origin_point IS NULL THEN
    RETURN QUERY SELECT origin_plz;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT p.plz::text
  FROM public.plzs p
  WHERE p.location IS NOT NULL
    AND ST_DWithin(p.location, origin_point, radius_km * 1000);
END;
$$;

REVOKE ALL ON FUNCTION public.search_nearby_plzs(text, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_nearby_plzs(text, double precision) TO anon;
GRANT EXECUTE ON FUNCTION public.search_nearby_plzs(text, double precision) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_nearby_plzs(text, double precision) TO service_role;
