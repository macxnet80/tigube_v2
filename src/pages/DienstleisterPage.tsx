import { useState, useEffect, useRef } from 'react';
import { MapPin, Star, X, ChevronDown, Briefcase, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DienstleisterCard from '../components/ui/DienstleisterCard';
import { DienstleisterService } from '../lib/services/dienstleisterService';
import { useAuth } from '../lib/auth/AuthContext';
import { useSubscription } from '../lib/auth/useSubscription';
import type { DienstleisterProfil, DienstleisterKategorie } from '../lib/types/dienstleister';

export default function DienstleisterPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isPremiumUser, subscriptionLoading } = useSubscription();
  const isFirstRender = useRef(true);
  
  // Filter States
  const [location, setLocation] = useState('');
  const [selectedKategorieId, setSelectedKategorieId] = useState<number | undefined>(undefined);
  const [selectedMinRating, setSelectedMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DienstleisterProfil[]>([]);
  const [kategorien, setKategorien] = useState<DienstleisterKategorie[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Bewertungs-Optionen
  const ratingOptions = [
    { value: '', label: 'Alle Bewertungen' },
    { value: '4.5', label: '4.5+ Sterne' },
    { value: '4.0', label: '4.0+ Sterne' },
    { value: '3.5', label: '3.5+ Sterne' },
    { value: '3.0', label: '3.0+ Sterne' }
  ];

  // Kategorien laden (ohne "Betreuer", da die auf der SearchPage sind)
  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const kats = await DienstleisterService.getKategorien();
        // Filtere "Betreuer" heraus (id=1), da die auf der SearchPage sind
        const filteredKats = kats.filter(kat => kat.id !== 1);
        setKategorien(filteredKats);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
      }
    };
    loadKategorien();
  }, []);

  const clearAllFilters = () => {
    setLocation('');
    setSelectedKategorieId(undefined);
    setSelectedMinRating('');
    setMaxPrice(100);
  };

  const hasActiveFilters = location.trim() || selectedKategorieId !== undefined || selectedMinRating || maxPrice < 100;

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: any = {};
      
      // Kategorie-Filter
      if (selectedKategorieId) {
        filters.kategorie_id = selectedKategorieId;
      }
      
      // Standort-Filter
      if (location.trim()) {
        // Prüfe ob es eine PLZ ist (5-stellige Zahl)
        if (/^\d{5}$/.test(location.trim())) {
          filters.standort = { plz: location.trim() };
        } else {
          filters.standort = { ort: location.trim() };
        }
      }
      
      // Bewertungs-Filter
      if (selectedMinRating) {
        filters.bewertung = { min: parseFloat(selectedMinRating) };
      }
      
      // Preis-Filter (nur wenn nicht default)
      if (maxPrice < 100) {
        filters.preis = { max: maxPrice };
      }
      
      // Suche ausführen
      // Die dienstleister_search_view filtert bereits nach:
      // - approval_status = 'approved'
      // - kategorie_id != 1 (Betreuer ausgeschlossen)
      // - user_type != 'caretaker' (oder kategorie_id != 1)
      const searchResult = await DienstleisterService.searchDienstleister(filters, 50, 0);
      
      setResults(searchResult.dienstleister || []);
      setTotalCount(searchResult.total_count);
    } catch (err) {
      console.error('Fehler bei der Dienstleister-Suche:', err);
      setError('Fehler beim Laden der Dienstleister. Bitte versuche es erneut.');
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Live-Suche bei Filter-Änderungen
  useEffect(() => {
    // Skip first render to avoid double search
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, selectedKategorieId, selectedMinRating, maxPrice]);

  // Premium-Check: Zeige Seite nur für Premium-User
  if (authLoading || subscriptionLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/anmelden" replace />;
  }

  if (!isPremiumUser) {
    return <Navigate to="/mitgliedschaften" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
              <h2 className="text-lg font-semibold mb-6">Filter</h2>
              
              <div className="space-y-6">
                {/* Standort */}
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
                
                {/* Kategorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={selectedKategorieId || ''}
                      onChange={(e) => setSelectedKategorieId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="">Alle Kategorien</option>
                      {kategorien.map(kat => (
                        <option key={kat.id} value={kat.id}>
                          {kat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Bewertung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mindestbewertung</label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={selectedMinRating}
                      onChange={(e) => setSelectedMinRating(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Preis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. Preis: €{maxPrice}/Std.
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>€10</span>
                    <span>€100</span>
                  </div>
                </div>

                {/* Filter zurücksetzen */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Ergebnisse */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dienstleister finden
              </h1>
              <p className="text-gray-600">
                Finde qualifizierte Tierärzte, Trainer, Friseure und andere Experten in deiner Nähe
              </p>
            </div>

            {/* Ergebnisse */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={performSearch}>
                  Erneut versuchen
                </Button>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {totalCount} {totalCount === 1 ? 'Dienstleister gefunden' : 'Dienstleister gefunden'}
                  {location && ` in ${location}`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((dienstleister) => (
                    <DienstleisterCard key={dienstleister.id} dienstleister={dienstleister} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Dienstleister gefunden
                </h3>
                <p className="text-gray-600 mb-6">
                  Versuche es mit anderen Suchkriterien oder erweitere deine Suche.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
