import { supabase } from './client';
import {
  getCheapestPricedService,
  isExcludedFromAbPrice,
  priceRecordFromServicesExcludingTravel,
  resolveTravelCostConfig,
} from '../pricing/servicePricing';
import type { TravelCostConfig } from '../types/service-categories';

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
  travelCostConfig?: TravelCostConfig | null;
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
interface CaretakerViewRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  city: string | null;
  plz: string | null;
  profile_photo_url: string | null;
  animal_types: string[] | null;
  services: any;
  services_with_categories: any;
  prices: Record<string, any> | null;
  hourly_rate: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  short_about_me: string | null;
  long_about_me: string | null;
  experience_years: number | null;
  experience_description: string | null;
  qualifications: string[] | null;
  languages: string[] | null;
  service_radius: number | null;
  home_photos: string[] | null;
  is_commercial: boolean | null;
  company_name: string | null;
  tax_number: string | null;
  vat_id: string | null;
  short_term_available: boolean | null;
  overnight_availability: any;
  travel_cost_config?: unknown;
}

function transformCaretakerData(viewData: CaretakerViewRow): CaretakerDisplayData {


  const firstName = viewData.first_name || '';
  const lastName = viewData.last_name || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName[0]}.` : (viewData.full_name || 'Unbekannt');

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

  // Preise verarbeiten - kann JSON object sein (Legacy-View)
  let prices: Record<string, number | string> = {};
  try {
    if (viewData.prices && typeof viewData.prices === 'object') {
      prices = viewData.prices as Record<string, number | string>;
    }
  } catch (error) {
    console.warn('⚠️ Error parsing prices:', error, 'Original value:', viewData.prices);
    prices = {};
  }

  const swcPrices = priceRecordFromServicesExcludingTravel(servicesWithCategories);
  const mergedPrices: Record<string, number | string> = { ...prices, ...swcPrices };

  if (services.length === 0 && servicesWithCategories.length > 0) {
    services = servicesWithCategories
      .map((s: any) => s.name)
      .filter(Boolean)
      .filter((name: string) => !isExcludedFromAbPrice(name));
  } else {
    services = services.filter((name) => !isExcludedFromAbPrice(name));
  }

  const cheapest = getCheapestPricedService(servicesWithCategories);
  const fallbackNumeric =
    getBestPrice(mergedPrices) || Number(viewData.hourly_rate) || 0;
  const bestPrice = cheapest?.price ?? fallbackNumeric;

  const travelCostConfig = resolveTravelCostConfig(viewData.travel_cost_config, servicesWithCategories);

  const result: CaretakerDisplayData = {
    id: viewData.id || '',
    userId: viewData.id || '', // In der View ist die ID direkt verfügbar
    name: fullName,
    avatar: viewData.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'U')}&background=f3f4f6&color=374151`,
    location: viewData.city && viewData.plz ? `${viewData.city} ${viewData.plz}` : (viewData.city || 'Unbekannt'),
    rating: Number(viewData.rating) || 0,
    reviewCount: viewData.review_count || 0,
    hourlyRate: bestPrice, // Verwende den besten Preis aus service-spezifischen Preisen
    prices: mergedPrices,
    services: services,
    servicesWithCategories: servicesWithCategories,
    animalTypes: animalTypes,
    bio: viewData.short_about_me || viewData.long_about_me || 'Keine Beschreibung verfügbar.',
    verified: viewData.is_verified || false,
    isCommercial: viewData.is_commercial || false,
    short_term_available: viewData.short_term_available || false,
    travelCostConfig,
  };


  return result;
}

/**
 * Sucht nach Tierbetreuern mithilfe des caretaker_search_view
 * Der View kombiniert automatisch Daten aus users und caretaker_profiles
 */
export async function searchCaretakers(filters?: SearchFilters): Promise<CaretakerDisplayData[]> {


  try {
    // Verwende die caretaker_search_view direkt
    let query = supabase
      .from('caretaker_search_view')
      .select('*');

    // Optional: Standort-Filter
    if (filters?.location) {
      const location = filters.location.toLowerCase();

      query = query.or(`city.ilike.%${location}%,plz.ilike.%${location}%`);
    }

    // Optional: Tierart-Filter (animal_types)
    if (filters?.petType && filters.petType !== '') {

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

      query = query.contains('services', [filters.service]);
    }

    // Service-Kategorie-Filter wird client-seitig angewendet, da JSONB-Array-Filterung komplex ist
    if (filters?.serviceCategory && filters.serviceCategory !== '') {

    }

    // Optional: Bewertungs-Filter (rating)
    if (filters?.minRating && filters.minRating !== '') {
      const minRating = parseFloat(filters.minRating);

      query = query.gte('rating', minRating);
    }

    // Optional: Verifizierungs-Filter
    if (filters?.verified) {

      query = query.eq('is_verified', true);
    }

    // Optional: Kommerzielle Betreuer-Filter
    if (filters?.commercial) {

      query = query.eq('is_commercial', true);
    }

    // Optional: Kurzfristige Verfügbarkeit
    if (filters?.shortTermAvailable) {

      query = query.eq('short_term_available', true);
    }

    // Nur freigegebene Caretaker anzeigen
    // Das View filtert bereits nach approval_status = 'approved', aber dieser Filter
    // stellt sicher, dass auch bei View-Änderungen nur approved Betreuer angezeigt werden
    query = query.eq('approval_status', 'approved');

    // Preis-Filter wird client-seitig angewendet, da die Preise in JSON-Format sind
    // und hourly_rate null ist

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error searching caretakers:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No caretakers found');
      return [];
    }



    // Transformiere die Daten für die UI
          let transformedData = (data as unknown as CaretakerViewRow[]).map(item => transformCaretakerData(item));


    return transformedData;
  } catch (error) {
    console.error('❌ Exception in searchCaretakers:', error);
    throw error;
  }
}

/**
 * Holt einen spezifischen Tierbetreuer nach ID
 */
export async function getCaretakerById(id: string): Promise<{ data: CaretakerDisplayData | null; error: Error | null }> {
  console.log('🔍 Getting caretaker by ID:', id);

  try {
    const { data, error } = await supabase
      .from('caretaker_profiles')
      .select(`
        id,
        services,
        services_with_categories,
        prices,
        hourly_rate,
        rating,
        review_count,
        is_verified,
        short_about_me,
        long_about_me,
        is_commercial,
        short_term_available,
        animal_types,
        travel_cost_config,
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
        .eq('approval_status', 'approved')
        .single();

    if (error) {
      console.error('❌ Error getting caretaker:', error);
      return { data: null, error: error as Error };
    }

    if (!data) {
      return { data: null, error: new Error('Caretaker not found') };
    }

    console.log('✅ Found caretaker:', data);
    const transformedData = transformCaretakerData(data as unknown as CaretakerViewRow);
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('❌ Exception in getCaretakerById:', error);
    return { data: null, error: error as Error };
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