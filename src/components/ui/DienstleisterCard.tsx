import { Star, MapPin, Briefcase, Clock, Verified } from 'lucide-react';
import DienstleisterCategoryIcon, { getCategoryColor } from './DienstleisterCategoryIcon';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { DienstleisterProfil } from '../../lib/types/dienstleister';

interface DienstleisterCardProps {
  dienstleister: DienstleisterProfil;
}

export default function DienstleisterCard({ dienstleister }: DienstleisterCardProps) {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/dienstleister/${dienstleister.id}`);
  };

  const getDisplayPrice = () => {
    if (dienstleister.hourly_rate && dienstleister.hourly_rate > 0) {
      return `ab €${dienstleister.hourly_rate}/Std.`;
    }
    return 'Preis auf Anfrage';
  };

  const fullName = `${dienstleister.first_name || ''} ${dienstleister.last_name || ''}`.trim();
  const displayName = fullName || 'Dienstleister';
  const location = dienstleister.plz && dienstleister.city ? `${dienstleister.plz} ${dienstleister.city}` : dienstleister.city || 'Standort nicht angegeben';
  const bio = dienstleister.bio || dienstleister.short_about_me || '';

  return (
    <div className="card group hover:border-primary-200 transition-all duration-200 w-full max-w-sm h-full flex flex-col">
      <div className="relative flex flex-col h-full">
        {/* Quadratisches Bild */}
        <div className="relative w-full aspect-square">
          {dienstleister.profile_photo_url ? (
            <img
              src={dienstleister.profile_photo_url}
              alt={displayName}
              className="w-full h-full object-cover object-center rounded-t-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f3f4f6&color=374151&size=400`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-xl flex items-center justify-center">
              <span className="text-4xl font-semibold text-gray-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-center">
            {/* is_verified könnte je nach Datenstruktur variieren - optional anzeigen wenn vorhanden */}
            {(dienstleister as any).is_verified && (
              <div className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full text-center">
                Verifiziert
              </div>
            )}
            {dienstleister.is_commercial && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center justify-center">
                <Briefcase className="h-3 w-3 mr-1" /> Pro
              </div>
            )}
            {dienstleister.notfall_bereitschaft && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 mr-1" /> Notfall
              </div>
            )}
          </div>
        </div>

        {/* Info-Bereich - unter dem Bild */}
        <div className="p-5 bg-white rounded-b-xl flex flex-col flex-1">
          {/* Name und Bewertung */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="font-semibold text-base group-hover:text-primary-600 transition-colors truncate" title={displayName}>
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
              
              <p className="text-gray-600 text-xs flex items-center truncate" title={location}>
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" /> 
                <span className="truncate">{location}</span>
              </p>
            </div>
            <div className="flex items-center flex-shrink-0">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium text-sm">
                {dienstleister.rating && dienstleister.rating > 0 ? Number(dienstleister.rating).toFixed(1) : '—'}
              </span>
              {/* Review count ist optional, wird nur angezeigt wenn vorhanden */}
            </div>
          </div>

          {/* Bio - auf 3 Zeilen begrenzt */}
          {bio && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
              {bio}
            </p>
          )}

          {/* Spezialisierungen */}
          {dienstleister.spezialisierungen && dienstleister.spezialisierungen.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {dienstleister.spezialisierungen.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
                >
                  {spec}
                </span>
              ))}
              {dienstleister.spezialisierungen.length > 3 && (
                <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  +{dienstleister.spezialisierungen.length - 3}
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

