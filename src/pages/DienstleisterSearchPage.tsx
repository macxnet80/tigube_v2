import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Filter, X, Briefcase, Clock, Stethoscope, GraduationCap, Scissors, Activity, Apple, Camera, MoreHorizontal, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AdvertisementBanner from '../components/ui/AdvertisementBanner';
import { BetreuerAdvancedFilters } from '../components/ui/BetreuerAdvancedFilters';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase/client';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

// Dienstleister-Typ
interface DienstleisterData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  plz?: string;
  city?: string;
  street?: string;
  profile_photo_url?: string;
  user_type: string;
  plan_type?: string;
  premium_badge?: boolean;
  
  // Profil-Daten
  bio?: string;
  hourly_rate?: number;
  experience_years?: number;
  is_verified?: boolean;
  rating?: number;
  review_count?: number;
  service_radius?: number;
  qualifications?: string[];
  languages?: string[];
  is_commercial?: boolean;
  company_name?: string;
  short_term_available?: boolean;
  services_with_categories?: any[];
  
  // Dienstleister-spezifische Felder
  kategorie_id?: number;
  kategorie_name?: string;
  kategorie_beschreibung?: string;
  kategorie_icon?: string;
  spezialisierungen?: string[];
  dienstleister_typ?: string;
  notfall_verfuegbar?: boolean;
  behandlungsmethoden?: string[];
  fachgebiete?: string[];
  portfolio_urls?: string[];
  stil_beschreibung?: string;
  beratungsarten?: string[];
  freie_dienstleistung?: string;
}

interface DienstleisterKategorie {
  id: number;
  name: string;
  beschreibung: string;
  icon: string;
  sortierung: number;
}

interface DienstleisterCardProps {
  dienstleister: DienstleisterData;
}

// Icon-Mapping für Kategorien
const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    'stethoscope': Stethoscope,
    'graduation-cap': GraduationCap,
    'scissors': Scissors,
    'activity': Activity,
    'apple': Apple,
    'camera': Camera,
    'briefcase': Briefcase,
    'more-horizontal': MoreHorizontal
  };
  
  const IconComponent = icons[iconName] || Briefcase;
  return <IconComponent className="w-5 h-5" />;
};

function DienstleisterCard({ dienstleister }: DienstleisterCardProps) {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/betreuer/${dienstleister.id}`);
  };

  const getDisplayPrice = () => {
    // Neue Preisermittlung aus services_with_categories
    if (dienstleister.services_with_categories && Array.isArray(dienstleister.services_with_categories)) {
      const validPrices = dienstleister.services_with_categories
        .filter(service => 
          service.price && 
          service.price !== '' && 
          service.price !== null && 
          service.price !== undefined &&
          service.name !== 'Anfahrkosten'
        )
        .map(service => {
          const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
          return isNaN(price) ? 0 : price;
        })
        .filter(price => price > 0);
      
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        return `ab €${minPrice}/Std.`;
      }
    }
    
    // Fallback zu hourlyRate
    if (dienstleister.hourly_rate && dienstleister.hourly_rate > 0) {
      return `ab €${dienstleister.hourly_rate}/Std.`;
    }
    
    return 'Preis auf Anfrage';
  };

  return (
    <div className="card group hover:border-primary-200 transition-all duration-200 w-full max-w-sm h-full flex flex-col">
      <div className="relative flex flex-col h-full">
        {/* Quadratisches Bild */}
        <div className="relative w-full aspect-square">
          <img
            src={dienstleister.profile_photo_url || '/api/placeholder/300/300'}
            alt={`${dienstleister.first_name} ${dienstleister.last_name}`}
            className="w-full h-full object-cover rounded-t-xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/300/300';
            }}
          />
          
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {dienstleister.premium_badge && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-md">
                Premium
              </span>
            )}
            {dienstleister.is_verified && (
              <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
                Verifiziert
              </span>
            )}
            {dienstleister.short_term_available && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md">
                <Clock className="w-3 h-3 mr-1" />
                Kurzfristig
              </span>
            )}
          </div>
          
          {/* Kategorie-Badge */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700">
              {dienstleister.kategorie_icon && getCategoryIcon(dienstleister.kategorie_icon)}
              <span>{dienstleister.kategorie_name}</span>
            </div>
          </div>
        </div>

        {/* Info-Bereich */}
        <div className="p-5 bg-white rounded-b-xl flex flex-col flex-1">
          {/* Name und Bewertung */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {dienstleister.first_name} {dienstleister.last_name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{dienstleister.plz} {dienstleister.city}</span>
              </div>
            </div>
            {dienstleister.rating && dienstleister.review_count && dienstleister.review_count > 0 && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {dienstleister.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  ({dienstleister.review_count})
                </span>
              </div>
            )}
          </div>

          {/* Bio - auf 3 Zeilen begrenzt, flexibel */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
            {dienstleister.bio || `${dienstleister.kategorie_name} mit ${dienstleister.experience_years || 0} Jahren Erfahrung.`}
          </p>

          {/* Spezialisierungen */}
          {dienstleister.spezialisierungen && dienstleister.spezialisierungen.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {dienstleister.spezialisierungen.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-md"
                >
                  {spec}
                </span>
              ))}
              {dienstleister.spezialisierungen.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                  +{dienstleister.spezialisierungen.length - 3} weitere
                </span>
              )}
            </div>
          )}

          {/* Preis und Button - immer am unteren Rand */}
          <div className="mt-auto space-y-3">
            <p className="font-semibold text-primary-600 text-sm text-center">
              {getDisplayPrice()}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleViewProfile}
            >
              Profil ansehen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DienstleisterSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { subscription } = useFeatureAccess();
  const isFirstRender = useRef(true);
  
  // Initialize filters from URL params
  const initialLocation = searchParams.get('location') || '';
  const initialKategorie = searchParams.get('kategorie') || '';
  const initialMaxPrice = parseInt(searchParams.get('maxPrice') || '100');
  
  // States
  const [location, setLocation] = useState(initialLocation);
  const [selectedKategorie, setSelectedKategorie] = useState(initialKategorie);
  const [selectedMinRating, setSelectedMinRating] = useState(searchParams.get('minRating') || '');
  const [selectedRadius, setSelectedRadius] = useState(searchParams.get('radius') || '');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Data states
  const [dienstleister, setDienstleister] = useState<DienstleisterData[]>([]);
  const [kategorien, setKategorien] = useState<DienstleisterKategorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const { data, error } = await supabase
          .from('dienstleister_kategorien' as any)
          .select('id, name, beschreibung, icon, sortierung')
          .eq('is_active', true)
          .order('sortierung');
        
        if (error) throw error;
        setKategorien((data as unknown as DienstleisterKategorie[]) || []);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
      }
    };
    
    loadKategorien();
  }, []);

  // Search function
  const performSearch = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('dienstleister_search_view' as any)
        .select('*')
        .eq('user_type', 'dienstleister')
        .order('premium_badge', { ascending: false })
        .order('rating', { ascending: false });

      // Location filter
      if (location.trim()) {
        query = query.or(`plz.ilike.%${location}%,city.ilike.%${location}%`);
      }

      // Category filter
      if (selectedKategorie) {
        const kategorie = kategorien.find(k => k.name === selectedKategorie);
        if (kategorie) {
          query = query.eq('kategorie_id', kategorie.id);
        }
      }

      // Rating filter
      if (selectedMinRating) {
        const minRating = parseFloat(selectedMinRating);
        query = query.gte('rating', minRating);
      }

      // Radius filter (simplified)
      if (selectedRadius) {
        // TODO: Implement proper geo-location based filtering
        // For now, we'll use a simplified approach
      }

      // Price filter - simplified client-side filtering will be applied later
      // Server-side price filtering would require more complex logic with services_with_categories

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      let filteredData = ((data || []) as unknown as DienstleisterData[]);
      
      // Client-side price filtering
      if (maxPrice < 100) {
        filteredData = filteredData.filter(dienstleister => {
          // Check services_with_categories for prices
          if (dienstleister.services_with_categories && Array.isArray(dienstleister.services_with_categories)) {
            const validPrices = dienstleister.services_with_categories
              .filter((service: any) => 
                service.price && 
                service.price !== '' && 
                service.price !== null && 
                service.price !== undefined &&
                service.name !== 'Anfahrkosten'
              )
              .map((service: any) => {
                const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
                return isNaN(price) ? 0 : price;
              })
              .filter((price: number) => price > 0);
            
            if (validPrices.length > 0) {
              const minPrice = Math.min(...validPrices);
              return minPrice <= maxPrice;
            }
          }
          
          // Fallback to hourly_rate
          if (dienstleister.hourly_rate && dienstleister.hourly_rate > 0) {
            return dienstleister.hourly_rate <= maxPrice;
          }
          
          return false;
        });
      }
      
      setDienstleister(filteredData);
      
      // URL aktualisieren
      const newParams = new URLSearchParams();
      if (location.trim()) newParams.set('location', location.trim());
      if (selectedKategorie) newParams.set('kategorie', selectedKategorie);
      if (selectedMinRating) newParams.set('minRating', selectedMinRating);
      if (selectedRadius) newParams.set('radius', selectedRadius);
      if (maxPrice < 100) newParams.set('maxPrice', maxPrice.toString());
      
      setSearchParams(newParams);
    } catch (err: any) {
      console.error('Fehler bei der Suche:', err);
      setError('Bei der Suche ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Beim Mount suchen
  useEffect(() => {
    performSearch();
  }, []); // Nur beim Mount ausführen

  // Live-Suche bei Filter-Änderungen (aber nicht beim ersten Mount)
  useEffect(() => {
    // Skip first render to avoid double search
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // 300ms Debounce
    
    return () => clearTimeout(timeoutId);
  }, [location, selectedKategorie, selectedMinRating, selectedRadius, maxPrice]); // Dependencies für Live-Suche

  // Reset filters
  const clearAllFilters = () => {
    setLocation('');
    setSelectedKategorie('');
    setSelectedMinRating('');
    setSelectedRadius('');
    setMaxPrice(100);
    setHasSearched(false);
  };

  // Create advertisement items between results
  const createResultsWithAds = () => {
    const items: React.ReactNode[] = [];
    
    dienstleister.forEach((dienstleister, index) => {
      // Add dienstleister card
      items.push(
        <DienstleisterCard key={dienstleister.id} dienstleister={dienstleister} />
      );
      
      // Add advertisement after every 5th dienstleister
      if ((index + 1) % 5 === 0) {
        items.push(
          <AdvertisementBanner
            key={`ad-${index}`}
            placement="search_results"
            targetingOptions={{
              petTypes: undefined,
              location: location || undefined,
              subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
            }}
          />
        );
      }
    });
    
    // Add advertisement at the end if we have results but less than 5 or not divisible by 5
    if (dienstleister.length > 0 && (dienstleister.length < 5 || dienstleister.length % 5 !== 0)) {
      items.push(
        <AdvertisementBanner
          key="ad-end"
          placement="search_results"
          targetingOptions={{
            petTypes: undefined,
            location: location || undefined,
            subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
          }}
        />
      );
    }
    
    return items;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content Layout */}
      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-6">Filter</h2>
              
              <div className="space-y-6">
                {/* PLZ/Stadt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standort</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="PLZ oder Stadt"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Kategorie Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={selectedKategorie}
                      onChange={(e) => setSelectedKategorie(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="">Alle Kategorien</option>
                      {kategorien.map((kategorie) => (
                        <option key={kategorie.id} value={kategorie.name}>
                          {kategorie.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Advanced Filter Toggle */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={cn(
                      "w-full",
                      showAdvancedFilters && "bg-primary-50 border-primary-300 text-primary-700"
                    )}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Erweiterte Filter
                  </Button>
                </div>

                {/* Premium Filter (nur sichtbar wenn showAdvancedFilters true ist) */}
                {showAdvancedFilters && (
                  <div className="border-t pt-6">
                    <BetreuerAdvancedFilters
                      availabilityDay=""
                      availabilityTime=""
                      minRating={selectedMinRating}
                      radius={selectedRadius}
                      maxPrice={maxPrice}
                      showRelatedServices={false}
                      onAvailabilityDayChange={() => {}}
                      onAvailabilityTimeChange={() => {}}
                      onMinRatingChange={setSelectedMinRating}
                      onRadiusChange={setSelectedRadius}
                      onMaxPriceChange={setMaxPrice}
                      onShowRelatedServicesChange={() => {}}
                      showPriceFilter={true}
                      showAvailabilityFilter={false}
                      showServiceFilter={false}
                    />
                  </div>
                )}
                
                {/* Clear Filters Button */}
                {(location || selectedKategorie || selectedMinRating || selectedRadius || maxPrice !== 100) && (
                  <div className="border-t pt-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-600 hover:text-gray-900 w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Alle Filter zurücksetzen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Results Area */}
          <div className="flex-1">
            {/* Advertisement Banner */}
            <div className="mb-6">
              <AdvertisementBanner
                placement="search_filters"
                targetingOptions={{
                  petTypes: undefined,
                  location: location || undefined,
                  subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
                }}
              />
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span className="text-gray-600">Suche läuft...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-600">{error}</p>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dienstleister in allen Orten</h1>
                    <p className="text-gray-600">
                      {dienstleister.length} {dienstleister.length === 1 ? 'Dienstleister verfügbar' : 'Dienstleister verfügbar'}
                      {location && ` in ${location}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={performSearch}>
                  Erneut versuchen
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && hasSearched && dienstleister.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Keine Dienstleister gefunden
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Versuche es mit anderen Suchkriterien oder erweitere den Suchbereich.
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Filter zurücksetzen
                  </Button>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!loading && dienstleister.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {createResultsWithAds()}
              </div>
            )}

            {/* Initial State */}
            {!loading && !hasSearched && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bereit für die Suche?
                </h3>
                <p className="text-gray-600">
                  Gib deine Suchkriterien ein und finde den perfekten Dienstleister für deine Haustiere.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DienstleisterSearchPage;
