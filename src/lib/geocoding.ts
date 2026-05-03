import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';

const ZIPPOPOTAM_DE = (plz: string) =>
  `https://api.zippopotam.us/de/${encodeURIComponent(plz)}`;

type ZippopotamPlace = {
  'place name': string;
  longitude: string;
  latitude: string;
};

type ZippopotamGermanyResponse = {
  'post code': string;
  places: ZippopotamPlace[];
};

/** Deutsche PLZ: genau 5 Ziffern (führende Nullen erlaubt). */
export function normalizeGermanPlz(raw: string): string | null {
  const d = raw.replace(/\s/g, '');
  if (!/^\d{5}$/.test(d)) return null;
  return d;
}

/**
 * Extrahiert eine PLZ aus Freitext (z. B. "10115", "10115 Berlin", "Berlin 10115").
 */
export function extractGermanPlzFromLocationInput(input: string): string | null {
  const t = input.trim();
  const direct = normalizeGermanPlz(t);
  if (direct) return direct;
  const m = t.match(/\b(\d{5})\b/);
  return m ? normalizeGermanPlz(m[1]) : null;
}

function normalizeCityHint(hint: string | null | undefined): string | null {
  if (!hint) return null;
  const t = hint.trim();
  return t.length > 0 ? t : null;
}

function pickPlace(
  places: ZippopotamPlace[],
  cityHint: string | null
): ZippopotamPlace | null {
  if (!places?.length) return null;
  if (!cityHint) return places[0];
  const h = cityHint.toLowerCase();
  const exact = places.find(
    (p) => p['place name'].trim().toLowerCase() === h
  );
  if (exact) return exact;
  const partial = places.find((p) =>
    p['place name'].toLowerCase().includes(h)
  );
  return partial ?? places[0];
}

/**
 * Ruft Koordinaten für eine deutsche PLZ ab (Zippopotam.us, kein API-Key).
 * Optionaler `cityHint` wählt bei Mehrfach-Ort die passende Locality.
 */
export async function geocodeGermanPlz(
  plzRaw: string,
  cityHint?: string | null
): Promise<{
  plz: string;
  city: string;
  latitude: number;
  longitude: number;
} | null> {
  const plz = normalizeGermanPlz(plzRaw);
  if (!plz) return null;
  const hint = normalizeCityHint(cityHint);

  try {
    const res = await fetch(ZIPPOPOTAM_DE(plz), { method: 'GET' });
    if (!res.ok) return null;
    const body = (await res.json()) as ZippopotamGermanyResponse;
    if (!body?.places?.length) return null;
    const place = pickPlace(body.places, hint);
    if (!place) return null;
    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return {
      plz,
      city: place['place name'].trim(),
      latitude: lat,
      longitude: lng,
    };
  } catch {
    return null;
  }
}

/**
 * Schreibt Geokoordinaten in `plzs` (per SECURITY DEFINER-RPC) und füllt ggf. alle
 * noch lat/lng-leeren Zeilen mit derselben PLZ nach.
 */
export async function ensurePlzCoordinatesCached(
  supabase: SupabaseClient<Database>,
  plzRaw: string,
  cityHint?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const plz = normalizeGermanPlz(plzRaw);
  if (!plz) return { ok: false, error: 'invalid_plz' };

  const { data: hit } = await supabase
    .from('plzs')
    .select('plz')
    .eq('plz', plz)
    .not('latitude', 'is', null)
    .limit(1)
    .maybeSingle();

  if (hit) return { ok: true };

  const geo = await geocodeGermanPlz(plz, cityHint);
  if (!geo) return { ok: false, error: 'geocode_failed' };

  const { error } = await supabase.rpc('cache_plz_coordinates', {
    p_plz: geo.plz,
    p_city: geo.city,
    p_lat: geo.latitude,
    p_lng: geo.longitude,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Ortsname aus Freitext neben der PLZ, z. B. "10115 Berlin" → "Berlin". */
export function extractCityHintFromLocationInput(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  const withoutPlz = t.replace(/\b\d{5}\b/g, '').trim();
  return withoutPlz.length > 0 ? withoutPlz : null;
}

/**
 * Liefert alle PLZ-Codes innerhalb des Umkreises (km) um die im Text erkannte PLZ.
 * Nutzt Geocache + RPC `search_nearby_plzs`.
 */
export async function fetchNearbyPlzList(
  supabase: SupabaseClient<Database>,
  locationInput: string,
  radiusKm: number
): Promise<string[]> {
  const plz = extractGermanPlzFromLocationInput(locationInput);
  if (!plz || !Number.isFinite(radiusKm) || radiusKm <= 0) return [];

  const cityHint = extractCityHintFromLocationInput(locationInput);
  const ensured = await ensurePlzCoordinatesCached(supabase, plz, cityHint);
  if (!ensured.ok) {
    console.warn('[fetchNearbyPlzList] Geocache:', ensured.error);
  }

  const { data: rows, error } = await supabase.rpc('search_nearby_plzs', {
    origin_plz: plz,
    radius_km: radiusKm,
  });
  if (error) throw error;

  const set = new Set((rows ?? []).map((r) => r.plz));
  if (set.size === 0) set.add(plz);
  return Array.from(set);
}
