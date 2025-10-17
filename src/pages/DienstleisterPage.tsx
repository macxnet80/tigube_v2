import React, { useState, useEffect } from 'react';
import { MapPin, Star, Filter, X, ChevronDown, PawPrint, Briefcase, Clock, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { cn } from '../lib/utils';

export default function DienstleisterPage() {
  // Filter States
  const [location, setLocation] = useState('');
  const [selectedKategorie, setSelectedKategorie] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedMinRating, setSelectedMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Kategorie-Optionen
  const kategorieOptions = [
    { value: '', label: 'Alle Kategorien' },
    { value: 'betreuer', label: 'Betreuer' },
    { value: 'tierarzt', label: 'Tierarzt' },
    { value: 'hundetrainer', label: 'Hundetrainer' },
    { value: 'tierfriseur', label: 'Tierfriseur' },
    { value: 'physiotherapeut', label: 'Physiotherapeut' },
    { value: 'ernaehrungsberater', label: 'Ernährungsberater' },
    { value: 'tierfotograf', label: 'Tierfotograf' }
  ];

  // Service-Optionen
  const serviceOptions = [
    { value: '', label: 'Alle Services' },
    { value: 'notfall', label: 'Notfall' },
    { value: 'chirurgie', label: 'Chirurgie' },
    { value: 'impfung', label: 'Impfung' },
    { value: 'untersuchung', label: 'Untersuchung' },
    { value: 'training', label: 'Training' },
    { value: 'verhalten', label: 'Verhaltensberatung' },
    { value: 'pflege', label: 'Pflege' },
    { value: 'styling', label: 'Styling' }
  ];

  // Bewertungs-Optionen
  const ratingOptions = [
    { value: '', label: 'Alle Bewertungen' },
    { value: '4.5', label: '4.5+ Sterne' },
    { value: '4.0', label: '4.0+ Sterne' },
    { value: '3.5', label: '3.5+ Sterne' },
    { value: '3.0', label: '3.0+ Sterne' }
  ];

  const clearAllFilters = () => {
    setLocation('');
    setSelectedKategorie('');
    setSelectedService('');
    setSelectedMinRating('');
    setMaxPrice(100);
  };

  const hasActiveFilters = location.trim() || selectedKategorie || selectedService || selectedMinRating || maxPrice < 100;

  const performSearch = async () => {
    setLoading(true);
    // Hier würde die echte Suche implementiert werden
    setTimeout(() => {
      setResults([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [location, selectedKategorie, selectedService, selectedMinRating, maxPrice]);

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
                      value={selectedKategorie}
                      onChange={(e) => setSelectedKategorie(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {kategorieOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <div className="relative">
                    <PawPrint className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {serviceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {results.length} Dienstleister gefunden
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hier würden die Dienstleister-Cards gerendert werden */}
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
