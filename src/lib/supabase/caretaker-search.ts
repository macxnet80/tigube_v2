import { supabase } from './client';
import { ServiceUtils, type CategorizedService } from './service-categories';

export interface SearchFilters {
  petType?: string;
  service?: string;
  serviceCategory?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  availabilityDay?: string;
  availabilityTime?: string;
  minRating?: string;
  radius?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  commercial?: boolean;
  shortTermAvailable?: boolean;
}

// Interface für die Anzeige in der UI (basierend auf der alten CaretakerResult)
export interface CaretakerDisplayData {
  id: string; // caretaker_profiles.id
  userId: string; // users.id (wichtig für Chat/Beziehungen)
  name: string;
  avatar: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  prices?: Record<string, number | string>; // Service-spezifische Preise
  services: string[];
  servicesWithCategories: any[]; // Services mit Kategorien
  animalTypes: string[]; // Tierarten aus der Datenbank
  bio: string;
  verified: boolean;
  isCommercial: boolean;
  short_term_available?: boolean;
}

/**
 * Berechnet den besten/niedrigsten Preis aus den verfügbaren Service-Preisen
 * Anfahrkosten werden ausgeschlossen, da sie zusätzliche Kosten sind
 */
function getBestPrice(prices: Record<string, number | string>): number {
  if (!prices || Object.keys(prices).length === 0) return 0;
  
  console.log('🔍 Calculating best price from:', prices);
  
  // Filtere Anfahrkosten aus der Preisberechnung aus
  const pricesWithoutTravelCosts = Object.entries(prices)
    .filter(([key, price]) => {
      // Schließe "Anfahrkosten" aus der Preisberechnung aus
      if (key === 'Anfahrkosten') {
        console.log('🚗 Excluding travel costs from price calculation:', price);
        return false;
      }
      return price !== '' && price !== null && price !== undefined;
    })
    .map(([key, price]) => {
      const num = typeof price === 'string' ? parseFloat(price) : price;
      return isNaN(num) ? 0 : num;
    })
    .filter(price => price > 0);
  
  const bestPrice = pricesWithoutTravelCosts.length > 0 ? Math.min(...pricesWithoutTravelCosts) : 0;
  console.log('🔍 Best price calculated:', bestPrice, 'from prices (excluding travel costs):', pricesWithoutTravelCosts);
  
  return bestPrice;
}

/**
 * Konvertiert View-Daten in ein UI-freundliches Format
 */
interface CaretakerJoinRow {
  id: string;
  services: any;
  services_with_categories: any;
  animal_types: string[] | null;
  prices: Record<string, any> | null;
  hourly_rate: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  short_about_me: string | null;
  long_about_me: string | null;
  is_commercial: boolean | null;
  short_term_available?: boolean | null;
  languages?: string[] | null;
  home_photos?: string[] | null;
  users: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    city: string | null;
    plz: string | null;
    profile_photo_url: string | null;
    user_type?: string | null;
  };
}

function transformCaretakerData(viewData: CaretakerJoinRow): CaretakerDisplayData {
  console.log('🔄 Transforming joined data:', viewData);

  const firstName = viewData.users?.first_name || '';
  const lastName = viewData.users?.last_name || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName[0]}.` : (firstName || 'Unbekannt');

  // Services korrekt verarbeiten - kann JSON string oder Array sein
  let services: string[] = [];
  try {
    const rawServices = viewData.services;
    if (rawServices) {
      if (Array.isArray(rawServices)) {
        services = (rawServices as string[]).filter(s => typeof s === 'string');
      } else if (typeof rawServices === 'string') {
        services = JSON.parse(rawServices).filter((s: any) => typeof s === 'string');
      } else if (typeof rawServices === 'object') {
        services = Object.values(rawServices).filter(s => typeof s === 'string') as string[];
      }
    }
  } catch (error) {
    console.warn('⚠️ Error parsing services:', error, 'Original value:', viewData.services);
    services = [];
  }

  // Animal types verarbeiten
  let animalTypes: string[] = [];
  try {
    if (viewData.animal_types && Array.isArray(viewData.animal_types)) {
      animalTypes = viewData.animal_types.filter(s => typeof s === 'string');
    }
  } catch (error) {
    console.warn('⚠️ Error parsing animal_types:', error, 'Original value:', viewData.animal_types);
    animalTypes = [];
  }

  // Services with categories verarbeiten
  let servicesWithCategories: any[] = [];
  try {
    if (viewData.services_with_categories) {
      if (Array.isArray(viewData.services_with_categories)) {
        servicesWithCategories = viewData.services_with_categories;
      } else if (typeof viewData.services_with_categories === 'string') {
        servicesWithCategories = JSON.parse(viewData.services_with_categories);
      }
    }
  } catch (error) {
    console.warn('⚠️ Error parsing services_with_categories:', error, 'Original value:', viewData.services_with_categories);
    servicesWithCategories = [];
  }

  // Preise verarbeiten - kann JSON object sein
  let prices: Record<string, number | string> = {};
  try {
    if (viewData.prices && typeof viewData.prices === 'object') {
      prices = viewData.prices as Record<string, number | string>;
    }
  } catch (error) {
    console.warn('⚠️ Error parsing prices:', error, 'Original value:', viewData.prices);
    prices = {};
  }

  const bestPrice = getBestPrice(prices) || Number(viewData.hourly_rate) || 0;

  const result: CaretakerDisplayData = {
    id: viewData.id || '',
    userId: viewData.users?.id || '',
    name: fullName,
    avatar: viewData.users?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'U')}&background=f3f4f6&color=374151`,
    location: viewData.users?.city && viewData.users?.plz ? `${viewData.users.city} ${viewData.users.plz}` : (viewData.users?.city || 'Unbekannt'),
    rating: Number(viewData.rating) || 0,
    reviewCount: viewData.review_count || 0,
    hourlyRate: bestPrice, // Verwende den besten Preis aus service-spezifischen Preisen
    prices: prices,
    services: services,
    servicesWithCategories: servicesWithCategories,
    animalTypes: animalTypes,
    bio: viewData.short_about_me || viewData.long_about_me || 'Keine Beschreibung verfügbar.',
    verified: viewData.is_verified || false,
    isCommercial: viewData.is_commercial || false,
    short_term_available: viewData.short_term_available || false,
  };

  console.log('✅ Transformed result:', result);
  console.log('🎯 Prices data:', {
    original_prices: viewData.prices,
    parsed_prices: prices,
    hourly_rate: viewData.hourly_rate,
    final_hourly_rate: result.hourlyRate
  });
  return result;
}

/**
 * Sucht nach Tierbetreuern mithilfe des caretaker_search_view
 * Der View kombiniert automatisch Daten aus users und caretaker_profiles
 */
export async function searchCaretakers(filters?: SearchFilters): Promise<CaretakerDisplayData[]> {
  console.log('🔍 Starting caretaker search with filters:', filters);

  try {
    // Direkt über caretaker_profiles + Join auf users (ohne View)
    let query = supabase
      .from('caretaker_profiles')
      .select(`
        id,
        services,
        services_with_categories,
        animal_types,
        prices,
        hourly_rate,
        rating,
        review_count,
        is_verified,
        short_about_me,
        long_about_me,
        is_commercial,
        short_term_available,
        users!inner(
          id,
          first_name,
          last_name,
          city,
          plz,
          profile_photo_url,
          user_type
        )
      `)
      .eq('users.user_type', 'caretaker');

    // Optional: Standort-Filter
    if (filters?.location) {
      const location = filters.location.toLowerCase();
      console.log('📍 Adding location filter:', location);
      query = query.or(`users.city.ilike.%${location}%,users.plz.ilike.%${location}%`);
    }

    // Optional: Tierart-Filter (animal_types)
    if (filters?.petType && filters.petType !== '') {
      console.log('🐾 Adding pet type filter:', filters.petType);
      // Konvertiere deutsche Tierart-Namen zu Datenbank-Werten
      const petTypeMapping: { [key: string]: string } = {
        'Hund': 'Hunde',
        'Katze': 'Katzen',
        'Kleintier': 'Kleintiere',
        'Vogel': 'Vögel',
        'Reptil': 'Reptilien',
        'Sonstiges': 'Sonstige'
      };
      const dbPetType = petTypeMapping[filters.petType] || filters.petType;
      query = query.contains('animal_types', [dbPetType]);
    }

    // Optional: Service-Filter (services)
    if (filters?.service && filters.service !== '') {
      console.log('🔧 Adding service filter:', filters.service);
      query = query.contains('services', [filters.service]);
    }

    // Service-Kategorie-Filter wird client-seitig angewendet, da JSONB-Array-Filterung komplex ist
    if (filters?.serviceCategory && filters.serviceCategory !== '') {
      console.log('🏷️ Service category filter will be applied client-side');
    }

    // Optional: Bewertungs-Filter (rating)
    if (filters?.minRating && filters.minRating !== '') {
      const minRating = parseFloat(filters.minRating);
      console.log('⭐ Adding min rating filter:', minRating);
      query = query.gte('rating', minRating);
    }

    // Optional: Verifizierungs-Filter
    if (filters?.verified) {
      console.log('✅ Adding verified filter');
      query = query.eq('is_verified', true);
    }

    // Optional: Kommerzielle Betreuer-Filter
    if (filters?.commercial) {
      console.log('🏢 Adding commercial filter');
      query = query.eq('is_commercial', true);
    }

    // Optional: Kurzfristige Verfügbarkeit
    if (filters?.shortTermAvailable) {
      console.log('⏰ Adding short term availability filter');
      query = query.eq('short_term_available', true);
    }

    // Preis-Filter wird client-seitig angewendet, da die Preise in JSON-Format sind
    // und hourly_rate null ist
    console.log('💰 Price filters will be applied client-side');

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error searching caretakers:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No caretakers found');
      return [];
    }

    console.log(`✅ Found ${data.length} caretakers from database`);

    // Transformiere die Daten für die UI
    let transformedData = (data as unknown as CaretakerJoinRow[]).map(item => transformCaretakerData(item));

    console.log(`🎯 Final result: ${transformedData.length} caretakers`);
    return transformedData;
  } catch (error) {
    console.error('❌ Exception in searchCaretakers:', error);
    throw error;
  }
}

/**
 * Holt einen spezifischen Tierbetreuer nach ID
 */
export async function getCaretakerById(id: string): Promise<CaretakerDisplayData | null> {
  console.log('🔍 Getting caretaker by ID:', id);

  try {
    const { data, error } = await supabase
      .from('caretaker_profiles')
      .select(`
        id,
        services,
        prices,
        hourly_rate,
        rating,
        review_count,
        is_verified,
        short_about_me,
        long_about_me,
        is_commercial,
        short_term_available,
        users!inner(
          id,
          first_name,
          last_name,
          city,
          plz,
          profile_photo_url,
          user_type
        )
      `)
      .eq('id', id)
      .eq('users.user_type', 'caretaker')
      .single();

    if (error) {
      console.error('❌ Error getting caretaker:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    console.log('✅ Found caretaker:', data);
    return transformCaretakerData(data as unknown as CaretakerJoinRow);
  } catch (error) {
    console.error('❌ Exception in getCaretakerById:', error);
    throw error;
  }
}

export const getAvailableServices = async (): Promise<{
  data: string[];
  error: any;
}> => {
  try {
    const { data: profiles, error } = await supabase
      .from('caretaker_profiles')
      .select('services')
      .not('services', 'is', null);

    if (error) {
      return { data: [], error };
    }

    const allServices = new Set<string>();
    profiles?.forEach(profile => {
      if (Array.isArray(profile.services)) {
        profile.services.forEach(service => {
          if (typeof service === 'string') {
            allServices.add(service);
          }
        });
      }
    });

    return { data: Array.from(allServices), error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
};