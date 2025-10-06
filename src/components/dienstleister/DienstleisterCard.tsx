// Dienstleister-Karte für Suchergebnisse

import React from 'react';
import { Star, MapPin, Clock, Phone, Mail, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DienstleisterProfil } from '../../lib/types/dienstleister';

interface DienstleisterCardProps {
  dienstleister: DienstleisterProfil;
  onClick?: () => void;
  className?: string;
}

export const DienstleisterCard: React.FC<DienstleisterCardProps> = ({
  dienstleister,
  onClick,
  className
}) => {
  const getDisplayPrice = () => {
    if (dienstleister.hourly_rate && dienstleister.hourly_rate > 0) {
      return `ab €${dienstleister.hourly_rate}/Std.`;
    }
    return 'Preis auf Anfrage';
  };

  const getRatingDisplay = () => {
    if (!dienstleister.rating || Number(dienstleister.rating) === 0) {
      return 'Neu';
    }
    return `${Number(dienstleister.rating).toFixed(1)} ⭐`;
  };

  const getSpecializations = () => {
    if (!dienstleister.spezialisierungen || !Array.isArray(dienstleister.spezialisierungen) || dienstleister.spezialisierungen.length === 0) {
      return [];
    }
    return dienstleister.spezialisierungen.slice(0, 3);
  };

  const getContactInfo = () => {
    if (!dienstleister.kontakt_info) return null;
    
    const info = dienstleister.kontakt_info as any;
    return {
      telefon: info.telefon,
      email: info.email,
      website: info.website
    };
  };

  const contactInfo = getContactInfo();

  return (
    <div
      className={cn(
        'group h-full flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {/* Header mit Bild und Kategorie */}
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded-t-xl">
          {dienstleister.profile_photo_url ? (
            <img
              src={dienstleister.profile_photo_url}
              alt={`${dienstleister.first_name} ${dienstleister.last_name}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <div className="text-4xl text-gray-400">
                {dienstleister.kategorie_icon === 'paw-print' && '🐾'}
                {dienstleister.kategorie_icon === 'stethoscope' && '🩺'}
                {dienstleister.kategorie_icon === 'graduation-cap' && '🎓'}
                {dienstleister.kategorie_icon === 'scissors' && '✂️'}
                {dienstleister.kategorie_icon === 'activity' && '🏃'}
                {dienstleister.kategorie_icon === 'apple' && '🍎'}
                {dienstleister.kategorie_icon === 'camera' && '📷'}
                {!['paw-print', 'stethoscope', 'graduation-cap', 'scissors', 'activity', 'apple', 'camera'].includes(dienstleister.kategorie_icon) && '👤'}
              </div>
            </div>
          )}
        </div>

        {/* Kategorie-Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
            {dienstleister.kategorie_name}
          </span>
        </div>

        {/* Notfall-Badge */}
        {dienstleister.notfall_bereitschaft && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
              Notfall
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name und Bewertung */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {dienstleister.first_name} {dienstleister.last_name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {getRatingDisplay()}
              </div>
              {dienstleister.experience_years && (
                <span className="text-sm text-gray-500">
                  {Number(dienstleister.experience_years || 0)} Jahre Erfahrung
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Standort */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {dienstleister.plz} {dienstleister.city}
          </span>
        </div>

        {/* Spezialisierungen */}
        {getSpecializations().length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {getSpecializations().map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {typeof spec === 'string' ? spec : String(spec)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {dienstleister.bio && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed flex-1">
            {dienstleister.bio}
          </p>
        )}

        {/* Kontakt-Informationen */}
        {contactInfo && (
          <div className="mb-4 space-y-1">
            {contactInfo.telefon && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{contactInfo.telefon}</span>
              </div>
            )}
            {contactInfo.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{contactInfo.email}</span>
              </div>
            )}
            {contactInfo.website && (
              <div className="flex items-center text-sm text-primary-600">
                <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Website</span>
              </div>
            )}
          </div>
        )}

        {/* Preis und Button */}
        <div className="mt-auto space-y-3">
          <p className="font-semibold text-primary-600 text-sm text-center">
            {getDisplayPrice()}
          </p>
          <button className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
            Profil ansehen
          </button>
        </div>
      </div>
    </div>
  );
};
