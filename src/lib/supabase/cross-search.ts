import { supabase } from './client';

export interface DienstleisterResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  profile_photo_url: string | null;
  plz: string | null;
  city: string | null;
  street: string | null;
  user_type: string;
  premium_badge: boolean | null;
  plan_type: string | null;
  bio: string | null;
  hourly_rate: number | null;
  experience_years: number | null;
  is_verified: boolean | null;
  rating: number | null;
  review_count: number | null;
  kategorie_name: string | null;
  kategorie_beschreibung: string | null;
  kategorie_icon: string | null;
  dienstleister_typ: string | null;
  spezialisierungen: string[] | null;
  behandlungsmethoden: string[] | null;
  beratungsarten: string[] | null;
  fachgebiete: string[] | null;
  freie_dienstleistung: string | null;
  notfall_bereitschaft: boolean | null;
  portfolio_urls: string[] | null;
  stil_beschreibung: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CrossSearchFilters {
  location?: string;
  petType?: string;
  service?: string;
  serviceCategory?: string;
  minRating?: string;
  maxPrice?: number;
}

/**
 * Service-Mapping zwischen Betreuer-Services und Dienstleister-Kategorien
 */
const SERVICE_MAPPING: Record<string, string[]> = {
  // Betreuer-Services -> Dienstleister-Kategorien
  'Hundesitting': ['Hundetrainer', 'Hundephysiotherapeut', 'Tierfotograf'],
  'Katzensitting': ['Tierarzt', 'Tierfotograf', 'Ernährungsberater'],
  'Gassi gehen': ['Hundetrainer', 'Hundephysiotherapeut'],
  'Tierbetreuung zu Hause': ['Tierarzt', 'Ernährungsberater', 'Tierfotograf'],
  'Übernachtungsbetreuung': ['Tierarzt', 'Ernährungsberater'],
  'Tierpflege': ['Tierfriseur', 'Tierarzt', 'Ernährungsberater'],
  'Training': ['Hundetrainer', 'Verhaltenstherapeut'],
  'Medizinische Betreuung': ['Tierarzt', 'Hundephysiotherapeut', 'Ernährungsberater'],
  'Notfallbetreuung': ['Tierarzt', 'Hundetrainer'],
  'Tierarztbesuche': ['Tierarzt', 'Hundephysiotherapeut'],
  'Fellpflege': ['Tierfriseur', 'Tierarzt'],
  'Fütterung': ['Ernährungsberater', 'Tierarzt'],
  'Spielzeit': ['Hundetrainer', 'Tierfotograf'],
  'Sozialisierung': ['Hundetrainer', 'Verhaltenstherapeut'],
  'Welpenbetreuung': ['Hundetrainer', 'Tierarzt', 'Ernährungsberater'],
  'Seniorenbetreuung': ['Tierarzt', 'Hundephysiotherapeut', 'Ernährungsberater']
};

/**
 * Tierart-Mapping zu relevanten Dienstleister-Kategorien
 */
const PET_TYPE_MAPPING: Record<string, string[]> = {
  'Hund': ['Hundetrainer', 'Hundephysiotherapeut', 'Tierfriseur', 'Tierarzt', 'Ernährungsberater', 'Tierfotograf', 'Verhaltenstherapeut'],
  'Katze': ['Tierarzt', 'Ernährungsberater', 'Tierfotograf', 'Verhaltenstherapeut'],
  'Kleintier': ['Tierarzt', 'Ernährungsberater', 'Tierfotograf'],
  'Vogel': ['Tierarzt', 'Ernährungsberater'],
  'Reptil': ['Tierarzt', 'Ernährungsberater'],
  'Fisch': ['Tierarzt', 'Ernährungsberater'],
  'Pferd': ['Tierarzt', 'Ernährungsberater', 'Tierfotograf', 'Hundephysiotherapeut'], // Physiotherapeut auch für Pferde
  'Nutztier': ['Tierarzt', 'Ernährungsberater']
};

/**
 * Allgemeine Service-Kategorie-Mapping
 */
const CATEGORY_MAPPING: Record<string, string[]> = {
  'Betreuung': ['Tierarzt', 'Ernährungsberater', 'Tierfotograf'],
  'Pflege': ['Tierfriseur', 'Tierarzt', 'Ernährungsberater'],
  'Training': ['Hundetrainer', 'Verhaltenstherapeut'],
  'Medizin': ['Tierarzt', 'Hundephysiotherapeut', 'Ernährungsberater'],
  'Ernährung': ['Ernährungsberater', 'Tierarzt'],
  'Verhalten': ['Hundetrainer', 'Verhaltenstherapeut', 'Tierarzt'],
  'Notfall': ['Tierarzt', 'Hundetrainer'],
  'Wellness': ['Tierfriseur', 'Hundephysiotherapeut', 'Tierfotograf']
};

/**
 * Ermittelt verwandte Dienstleister-Kategorien basierend auf Suchfiltern
 */
function getRelatedCategories(filters: CrossSearchFilters): string[] {
  const categories = new Set<string>();

  // Service-basierte Zuordnung
  if (filters.service) {
    const relatedCategories = SERVICE_MAPPING[filters.service];
    if (relatedCategories) {
      relatedCategories.forEach(cat => categories.add(cat));
    }
  }

  // Tierart-basierte Zuordnung
  if (filters.petType) {
    const relatedCategories = PET_TYPE_MAPPING[filters.petType];
    if (relatedCategories) {
      relatedCategories.forEach(cat => categories.add(cat));
    }
  }

  // Service-Kategorie-basierte Zuordnung
  if (filters.serviceCategory) {
    const relatedCategories = CATEGORY_MAPPING[filters.serviceCategory];
    if (relatedCategories) {
      relatedCategories.forEach(cat => categories.add(cat));
    }
  }

  // Fallback: Wenn keine spezifischen Filter, zeige die häufigsten verwandten Services
  if (categories.size === 0) {
    return ['Tierarzt', 'Hundetrainer', 'Tierfriseur', 'Ernährungsberater'];
  }

  return Array.from(categories);
}

/**
 * Sucht nach verwandten Dienstleistern basierend auf Betreuer-Suchfiltern
 */
export async function searchRelatedDienstleister(filters: CrossSearchFilters): Promise<DienstleisterResult[]> {
  try {
    console.log('🔍 Cross-Search: Searching for related Dienstleister with filters:', filters);

    // Ermittle relevante Kategorien
    const relatedCategories = getRelatedCategories(filters);
    console.log('📋 Related categories:', relatedCategories);

    if (relatedCategories.length === 0) {
      return [];
    }

    // Lade Kategorie-IDs
    const { data: kategorienData, error: kategorienError } = await supabase
      .from('dienstleister_kategorien' as any)
      .select('id, name')
      .in('name', relatedCategories)
      .eq('is_active', true);

    if (kategorienError) {
      console.error('Error loading categories:', kategorienError);
      return [];
    }

    const categoryIds = (kategorienData as any[] || []).map((k: any) => k.id);
    if (categoryIds.length === 0) {
      return [];
    }

    // Baue Dienstleister-Query
    let query = supabase
      .from('dienstleister_search_view' as any)
      .select('*')
      .eq('user_type', 'dienstleister')
      .in('kategorie_id', categoryIds)
      .order('premium_badge', { ascending: false })
      .order('rating', { ascending: false });

    // Location filter
    if (filters.location?.trim()) {
      query = query.or(`plz.ilike.%${filters.location}%,city.ilike.%${filters.location}%`);
    }

    // Rating filter
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      if (!isNaN(minRating)) {
        query = query.gte('rating', minRating);
      }
    }

    // Limitiere Ergebnisse für Performance
    const { data, error } = await query.limit(10);

    if (error) {
      console.error('Error searching Dienstleister:', error);
      return [];
    }

    let results = ((data || []) as unknown as DienstleisterResult[]);

    // Client-side price filtering (vereinfacht)
    if (filters.maxPrice && filters.maxPrice < 100) {
      results = results.filter(d => {
        if (!d.hourly_rate) return true; // Behalte Dienstleister ohne Preis
        return d.hourly_rate <= filters.maxPrice!;
      });
    }

    console.log(`✅ Cross-Search: Found ${results.length} related Dienstleister`);
    return results;

  } catch (error) {
    console.error('Error in cross-search:', error);
    return [];
  }
}

/**
 * Hilfsfunktion: Prüft ob ein Service zu einer Dienstleister-Kategorie passt
 */
export function isServiceRelatedToCategory(service: string, category: string): boolean {
  const relatedCategories = SERVICE_MAPPING[service];
  return relatedCategories ? relatedCategories.includes(category) : false;
}

/**
 * Hilfsfunktion: Ermittelt Relevanz-Score für einen Dienstleister
 */
export function calculateRelevanceScore(
  dienstleister: DienstleisterResult, 
  filters: CrossSearchFilters
): number {
  let score = 0;

  // Basis-Score für Premium
  if (dienstleister.premium_badge) score += 10;

  // Rating-Score
  if (dienstleister.rating) {
    score += dienstleister.rating * 2;
  }

  // Verifizierung
  if (dienstleister.is_verified) score += 5;

  // Notfall-Service (wenn relevant)
  if (dienstleister.notfall_bereitschaft && 
      (filters.service?.includes('Notfall') || filters.serviceCategory === 'Notfall')) {
    score += 15;
  }

  // Location-Match (vereinfacht)
  if (filters.location && dienstleister.plz?.includes(filters.location)) {
    score += 8;
  }

  return score;
}
