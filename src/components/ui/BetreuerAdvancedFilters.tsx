import { Lock, Crown, Clock, Star, MapPin, Briefcase } from 'lucide-react';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { Link } from 'react-router-dom';

interface BetreuerAdvancedFiltersProps {
  // Current filter values
  availabilityDay?: string;
  availabilityTime?: string;
  minRating?: string;
  radius?: string;
  maxPrice?: number;
  showRelatedServices?: boolean;
  
  // Change handlers
  onAvailabilityDayChange: (value: string) => void;
  onAvailabilityTimeChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onRadiusChange: (value: string) => void;
  onMaxPriceChange?: (value: number) => void;
  onShowRelatedServicesChange?: (value: boolean) => void;
  
  // Control which filters to show
  showPriceFilter?: boolean;
  showAvailabilityFilter?: boolean;
  showServiceFilter?: boolean;
  
  className?: string;
}

export function BetreuerAdvancedFilters({
  availabilityDay = '',
  availabilityTime = '',
  minRating = '',
  radius = '',
  maxPrice = 100,
  showRelatedServices = false,
  onAvailabilityDayChange,
  onAvailabilityTimeChange,
  onMinRatingChange,
  onRadiusChange,
  onMaxPriceChange,
  onShowRelatedServicesChange,
  showPriceFilter = true,
  showAvailabilityFilter = true,
  showServiceFilter = true,
  className = ''
}: BetreuerAdvancedFiltersProps) {
  const { hasAdvancedFilters, subscription } = useFeatureAccess();

  const canUseAdvanced = hasAdvancedFilters();
  const isPremium = subscription?.type === 'premium';

  // Filter options
  const availabilityDayOptions = [
    { value: '', label: 'Alle Tage' },
    { value: 'montag', label: 'Montag' },
    { value: 'dienstag', label: 'Dienstag' },
    { value: 'mittwoch', label: 'Mittwoch' },
    { value: 'donnerstag', label: 'Donnerstag' },
    { value: 'freitag', label: 'Freitag' },
    { value: 'samstag', label: 'Samstag' },
    { value: 'sonntag', label: 'Sonntag' }
  ];

  const availabilityTimeOptions = [
    { value: '', label: 'Alle Zeiten' },
    { value: 'morgens', label: 'Morgens (6-12 Uhr)' },
    { value: 'mittags', label: 'Mittags (12-18 Uhr)' },
    { value: 'abends', label: 'Abends (18-22 Uhr)' },
    { value: 'ganztags', label: 'Ganztags verfügbar' }
  ];

  const ratingOptions = [
    { value: '', label: 'Alle Bewertungen' },
    { value: '4.5', label: '4.5+ Sterne' },
    { value: '4.0', label: '4.0+ Sterne' },
    { value: '3.5', label: '3.5+ Sterne' },
    { value: '3.0', label: '3.0+ Sterne' }
  ];

  const radiusOptions = [
    { value: '', label: 'Alle Entfernungen' },
    { value: '5', label: 'Bis 5 km' },
    { value: '10', label: 'Bis 10 km' },
    { value: '25', label: 'Bis 25 km' },
    { value: '50', label: 'Bis 50 km' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        {/* Verfügbarkeit Tag */}
        {showAvailabilityFilter && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Verfügbarkeit Tag
            </label>
            {canUseAdvanced ? (
              <select
                className="input"
                value={availabilityDay}
                onChange={(e) => onAvailabilityDayChange(e.target.value)}
              >
                {availabilityDayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <select
                  className="input opacity-50 cursor-not-allowed"
                  disabled
                >
                  <option>Alle Tage</option>
                </select>
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                    <Lock className="w-3 h-3 mr-1" />
                    Premium
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verfügbarkeit Zeit */}
        {showAvailabilityFilter && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Verfügbarkeit Zeit
            </label>
            {canUseAdvanced ? (
              <select
                className="input"
                value={availabilityTime}
                onChange={(e) => onAvailabilityTimeChange(e.target.value)}
              >
                {availabilityTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <select
                  className="input opacity-50 cursor-not-allowed"
                  disabled
                >
                  <option>Alle Zeiten</option>
                </select>
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                    <Lock className="w-3 h-3 mr-1" />
                    Premium
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mindestbewertung */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Star className="w-4 h-4 inline mr-1" />
            Mindestbewertung
          </label>
          {canUseAdvanced ? (
            <select
              className="input"
              value={minRating}
              onChange={(e) => onMinRatingChange(e.target.value)}
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <select
                className="input opacity-50 cursor-not-allowed"
                disabled
              >
                <option>Alle Bewertungen</option>
              </select>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Radius */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Umkreis
          </label>
          {canUseAdvanced ? (
            <select
              className="input"
              value={radius}
              onChange={(e) => onRadiusChange(e.target.value)}
            >
              {radiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <select
                className="input opacity-50 cursor-not-allowed"
                disabled
              >
                <option>Alle Entfernungen</option>
              </select>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preis-Filter */}
      {showPriceFilter && onMaxPriceChange && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximaler Stundensatz: €{maxPrice}
          </label>
          {canUseAdvanced ? (
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          ) : (
            <div className="relative">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={100}
                disabled
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>€10</span>
            <span>€100+</span>
          </div>
        </div>
      )}

      {/* NEU: Verwandte Dienstleister Filter */}
      {showServiceFilter && onShowRelatedServicesChange && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Zeige auch verwandte Dienstleister
          </label>
          {isPremium ? (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={showRelatedServices}
                onChange={(e) => onShowRelatedServicesChange(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                Erweitere deine Suche um Tierärzte, Trainer und andere Dienstleister
              </span>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center space-x-3 opacity-50">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 text-gray-400 border-gray-300 rounded cursor-not-allowed"
                />
                <span className="text-sm text-gray-500">
                  Erweitere deine Suche um verwandte Dienstleister
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Upgrade Hinweis */}
      {!canUseAdvanced && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Crown className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                Erweiterte Filter mit Premium
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Nutze erweiterte Suchfilter für Verfügbarkeit, Bewertungen, Umkreis und Preise, um genau den richtigen Betreuer zu finden.
              </p>
              <Link
                to="/mitgliedschaften"
                className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
              >
                <Crown className="w-4 h-4 mr-1" />
                Premium werden
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
