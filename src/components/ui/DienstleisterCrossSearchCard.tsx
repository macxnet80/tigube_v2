import { Star, MapPin, Briefcase, Clock, Verified } from 'lucide-react';
import DienstleisterCategoryIcon, { getCategoryColor } from './DienstleisterCategoryIcon';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/utils';
import type { DienstleisterResult } from '../../lib/supabase/cross-search';

interface DienstleisterCrossSearchCardProps {
  dienstleister: DienstleisterResult;
}

export default function DienstleisterCrossSearchCard({ dienstleister }: DienstleisterCrossSearchCardProps) {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/dienstleister/${dienstleister.id}`);
  };

  const getDisplayPrice = () => {
    if (dienstleister.hourly_rate && dienstleister.hourly_rate > 0) {
      return formatCurrency(dienstleister.hourly_rate) + '/Std.';
    }
    return 'Preis auf Anfrage';
  };

  const fullName = `${dienstleister.first_name || ''} ${dienstleister.last_name || ''}`.trim();
  const displayName = fullName || 'Dienstleister';
  const location = dienstleister.plz && dienstleister.city ? `${dienstleister.plz} ${dienstleister.city}` : dienstleister.city || 'Standort nicht angegeben';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 hover:border-blue-300 transition-all duration-200 w-full max-w-sm h-full flex flex-col relative">
      {/* Cross-Search Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Briefcase className="w-3 h-3 mr-1" />
          Dienstleister
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {dienstleister.profile_photo_url ? (
                <img
                  src={dienstleister.profile_photo_url}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-500">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {displayName}
            </h3>
            
            {/* Category */}
            {dienstleister.kategorie_name && (
              <div className="flex items-center gap-1 mb-1">
                {dienstleister.kategorie_icon && (
                  <DienstleisterCategoryIcon 
                    iconName={dienstleister.kategorie_icon} 
                    size="sm" 
                    className={getCategoryColor(dienstleister.kategorie_name)}
                  />
                )}
                <p className={cn("text-xs font-medium", getCategoryColor(dienstleister.kategorie_name))}>
                  {dienstleister.kategorie_name}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            {/* Rating */}
            {dienstleister.rating && (
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3 h-3',
                        i < Math.floor(dienstleister.rating!)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  {dienstleister.rating.toFixed(1)} ({dienstleister.review_count || 0})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {dienstleister.is_verified && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Verified className="w-3 h-3 mr-1" />
              Verifiziert
            </span>
          )}
          {dienstleister.premium_badge && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Star className="w-3 h-3 mr-1" />
              Premium
            </span>
          )}
          {dienstleister.notfall_verfuegbar && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Clock className="w-3 h-3 mr-1" />
              Notfall
            </span>
          )}
        </div>

        {/* Specializations */}
        {dienstleister.spezialisierungen && dienstleister.spezialisierungen.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {dienstleister.spezialisierungen.slice(0, 2).map((spec, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {spec}
                </span>
              ))}
              {dienstleister.spezialisierungen.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                  +{dienstleister.spezialisierungen.length - 2} weitere
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {dienstleister.bio && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">
            {dienstleister.bio}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="text-sm font-semibold text-gray-900">
            {getDisplayPrice()}
          </div>
          
          <button
            onClick={handleViewProfile}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Profil ansehen
          </button>
        </div>
      </div>
    </div>
  );
}
