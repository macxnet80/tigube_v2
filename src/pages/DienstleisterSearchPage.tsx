// Dienstleister-Suchseite

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';
import { DienstleisterKategorieCard } from '../components/dienstleister/DienstleisterKategorieCard';
import { DienstleisterCard } from '../components/dienstleister/DienstleisterCard';
import { CrossServiceEmpfehlungen } from '../components/dienstleister/CrossServiceEmpfehlungen';
import { DienstleisterService } from '../lib/services/dienstleisterService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import type { 
  DienstleisterKategorie, 
  DienstleisterSucheFilter, 
  DienstleisterSucheErgebnis 
} from '../lib/types/dienstleister';

export const DienstleisterSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasAccess } = useFeatureAccess();

  // State
  const [kategorien, setKategorien] = useState<DienstleisterKategorie[]>([]);
  const [suchergebnisse, setSuchergebnisse] = useState<DienstleisterSucheErgebnis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKategorie, setSelectedKategorie] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DienstleisterSucheFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // URL-Parameter laden
  useEffect(() => {
    const kategorieParam = searchParams.get('kategorie');
    const queryParam = searchParams.get('q');
    
    if (kategorieParam) {
      setSelectedKategorie(parseInt(kategorieParam));
    }
    
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  // Kategorien laden
  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const kategorienData = await DienstleisterService.getKategorien();
        setKategorien(kategorienData || []);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };
    
    loadKategorien();
  }, []);

  // Suchergebnisse laden
  useEffect(() => {
    const loadSuchergebnisse = async () => {
      if (selectedKategorie === null) return;

      try {
        setLoading(true);
        const searchFilters: DienstleisterSucheFilter = {
          kategorie_id: selectedKategorie,
          ...filters
        };

        const results = await DienstleisterService.searchDienstleister(searchFilters);
        setSuchergebnisse(results || []);
      } catch (error) {
        console.error('Fehler beim Laden der Suchergebnisse:', error);
    } finally {
      setLoading(false);
    }
  };

    loadSuchergebnisse();
  }, [selectedKategorie, filters]);

  // Kategorie auswählen
  const handleKategorieSelect = (kategorieId: number) => {
    setSelectedKategorie(kategorieId);
    setSearchParams({ kategorie: kategorieId.toString() });
  };

  // Filter anwenden
  const handleFilterChange = (newFilters: Partial<DienstleisterSucheFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Cross-Service-Empfehlung klicken
  const handleEmpfehlungClick = (kategorieId: number) => {
    setSelectedKategorie(kategorieId);
    setSearchParams({ kategorie: kategorieId.toString() });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dienstleister finden
          </h1>
          <p className="text-gray-600">
            Finde qualifizierte Tierärzte, Trainer, Friseure und andere Experten in deiner Nähe
          </p>
        </div>

        {/* Kategorie-Auswahl */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Wähle eine Kategorie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kategorien.map((kategorie) => (
              <DienstleisterKategorieCard
                key={kategorie.id}
                kategorie={kategorie}
                isSelected={selectedKategorie === kategorie.id}
                onClick={() => handleKategorieSelect(kategorie.id)}
              />
            ))}
          </div>
        </div>

        {/* Filter und Suche */}
        {selectedKategorie && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {kategorien.find(k => k.id === selectedKategorie)?.name} in deiner Nähe
              </h3>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>

            {/* Filter-Panel */}
            {showFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Standort-Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standort
                    </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                        placeholder="PLZ oder Ort"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        onChange={(e) => handleFilterChange({ 
                          standort: { ...filters.standort, ort: e.target.value }
                        })}
                    />
                  </div>
                </div>

                  {/* Bewertungs-Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mindest-Bewertung
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      onChange={(e) => handleFilterChange({ 
                        bewertung: { min: parseInt(e.target.value) || undefined }
                      })}
                    >
                      <option value="">Alle Bewertungen</option>
                      <option value="4">4+ Sterne</option>
                      <option value="3">3+ Sterne</option>
                      <option value="2">2+ Sterne</option>
                    </select>
                  </div>

                  {/* Preis-Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Preis pro Stunde
                    </label>
                    <input
                      type="number"
                      placeholder="z.B. 50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      onChange={(e) => handleFilterChange({ 
                        preis: { ...filters.preis, max: parseInt(e.target.value) || undefined }
                      })}
                    />
                  </div>
                </div>

                {/* Premium-Filter */}
                {hasAccess('advancedFilters') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Erweiterte Filter
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spezialisierungen
                        </label>
                        <input
                          type="text"
                          placeholder="z.B. Notfall, Chirurgie"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            onChange={(e) => handleFilterChange({ 
                              notfall_bereitschaft: e.target.checked || undefined
                            })}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Notfall-Bereitschaft
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            onChange={(e) => handleFilterChange({ 
                              zertifiziert: e.target.checked || undefined
                            })}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Zertifiziert
                          </span>
                        </label>
                      </div>
                  </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Suchergebnisse */}
        {selectedKategorie && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Hauptinhalt */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                      <div className="flex space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : suchergebnisse ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {suchergebnisse.total_count} Dienstleister gefunden
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suchergebnisse.dienstleister.map((dienstleister) => (
                      <DienstleisterCard
                        key={dienstleister.id}
                        dienstleister={dienstleister}
                        onClick={() => {
                          // Navigation zum Profil
                          window.location.href = `/dienstleister/${dienstleister.id}`;
                        }}
                      />
                    ))}
                  </div>
                  
                  {suchergebnisse.dienstleister.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Keine Dienstleister gefunden
                      </h3>
                    <p className="text-gray-600">
                        Versuche es mit anderen Suchkriterien oder erweitere deinen Suchradius.
                    </p>
                  </div>
                )}
              </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Cross-Service-Empfehlungen (Premium) */}
              {hasAccess('relatedServices') && suchergebnisse?.cross_service_empfehlungen && (
                <CrossServiceEmpfehlungen
                  empfehlungen={suchergebnisse.cross_service_empfehlungen}
                  onEmpfehlungClick={handleEmpfehlungClick}
                />
              )}

              {/* Premium-Upgrade-Hinweis */}
              {!hasAccess('relatedServices') && (
                <div className="bg-primary-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                      <Star className="h-4 w-4 text-primary-600" />
              </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-primary-900">
                        Intelligente Empfehlungen
                      </h4>
                      <p className="mt-1 text-sm text-primary-700">
                        Finde verwandte Services und erhalte personalisierte Empfehlungen.
                      </p>
                      <button className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
                        Starter-Abo ab €9,99/Monat
                      </button>
                    </div>
                  </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};