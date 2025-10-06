// Dienstleister-Profil-Seite

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Mail, ExternalLink, MessageCircle, Heart } from 'lucide-react';
import { DienstleisterService } from '../lib/services/dienstleisterService';
import { useAuth } from '../lib/auth/AuthContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import type { DienstleisterProfil } from '../lib/types/dienstleister';

export const DienstleisterProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { hasAccess } = useFeatureAccess();
  
  const [dienstleister, setDienstleister] = useState<DienstleisterProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDienstleister = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const profil = await DienstleisterService.getDienstleisterProfil(id);
        if (profil) {
          setDienstleister(profil);
        } else {
          setError('Profil konnte nicht geladen werden.');
        }
      } catch (err) {
        console.error('Fehler beim Laden des Dienstleister-Profils:', err);
        setError('Profil konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    loadDienstleister();
  }, [id]);

  const getDisplayPrice = () => {
    if (dienstleister?.hourly_rate && dienstleister.hourly_rate > 0) {
      return `ab €${dienstleister.hourly_rate}/Std.`;
    }
    return 'Preis auf Anfrage';
  };

  const getRatingDisplay = () => {
    if (!dienstleister?.rating || Number(dienstleister.rating) === 0) {
      return 'Neu';
    }
    return `${Number(dienstleister.rating).toFixed(1)} ⭐`;
  };

  const getContactInfo = () => {
    if (!dienstleister?.kontakt_info) return null;
    
    const info = dienstleister.kontakt_info as any;
    return {
      telefon: info.telefon,
      email: info.email,
      website: info.website
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dienstleister) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil nicht gefunden</h1>
            <p className="text-gray-600 mb-6">
              Das angeforderte Profil konnte nicht geladen werden.
            </p>
            <Link
              to="/dienstleister"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Zurück zur Suche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contactInfo = getContactInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/dienstleister"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              ← Zurück zur Suche
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Profilbild */}
              <div className="flex-shrink-0">
                {dienstleister.profile_photo_url ? (
                  <img
                    src={dienstleister.profile_photo_url}
                    alt={`${dienstleister.first_name} ${dienstleister.last_name}`}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-400">
                      {dienstleister.kategorie_icon === 'paw-print' && '🐾'}
                      {dienstleister.kategorie_icon === 'stethoscope' && '🩺'}
                      {dienstleister.kategorie_icon === 'graduation-cap' && '🎓'}
                      {dienstleister.kategorie_icon === 'scissors' && '✂️'}
                      {dienstleister.kategorie_icon === 'activity' && '🏃'}
                      {dienstleister.kategorie_icon === 'apple' && '🍎'}
                      {dienstleister.kategorie_icon === 'camera' && '📷'}
                      {!['paw-print', 'stethoscope', 'graduation-cap', 'scissors', 'activity', 'apple', 'camera'].includes(dienstleister.kategorie_icon) && '👤'}
                    </span>
                  </div>
                )}
              </div>

              {/* Profil-Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {dienstleister.first_name} {dienstleister.last_name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                        {dienstleister.kategorie_name}
                      </span>
                      {dienstleister.notfall_bereitschaft && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                          Notfall-Bereitschaft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bewertung und Erfahrung */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {getRatingDisplay()}
                  </div>
                  {dienstleister.experience_years && (
                  <div className="text-sm text-gray-600">
                    {Number(dienstleister.experience_years || 0)} Jahre Erfahrung
                  </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {dienstleister.plz} {dienstleister.city}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptinhalt */}
          <div className="lg:col-span-2 space-y-6">
            {/* Über mich */}
            {dienstleister.bio && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Über mich</h2>
                <p className="text-gray-700 leading-relaxed">{dienstleister.bio}</p>
              </div>
            )}

            {/* Spezialisierungen */}
            {dienstleister.spezialisierungen && Array.isArray(dienstleister.spezialisierungen) && dienstleister.spezialisierungen.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Spezialisierungen</h2>
                <div className="flex flex-wrap gap-2">
                  {dienstleister.spezialisierungen.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
                    >
                      {typeof spec === 'string' ? spec : String(spec)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Zertifikate */}
            {dienstleister.zertifikate && Array.isArray(dienstleister.zertifikate) && dienstleister.zertifikate.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Zertifikate & Qualifikationen</h2>
                <div className="space-y-2">
                  {dienstleister.zertifikate.map((zertifikat, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      {typeof zertifikat === 'string' ? zertifikat : String(zertifikat)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {dienstleister.portfolio_urls && Array.isArray(dienstleister.portfolio_urls) && dienstleister.portfolio_urls.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dienstleister.portfolio_urls.slice(0, 6).map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={typeof url === 'string' ? url : String(url)}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kontakt */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h3>
              <div className="space-y-3">
                {contactInfo?.telefon && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{contactInfo.telefon}</span>
                  </div>
                )}
                {contactInfo?.email && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{contactInfo.email}</span>
                  </div>
                )}
                {contactInfo?.website && (
                  <div className="flex items-center text-sm text-primary-600">
                    <ExternalLink className="h-4 w-4 mr-3" />
                    <a href={contactInfo.website} target="_blank" rel="noopener noreferrer">
                      Website besuchen
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Preis */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preise</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {getDisplayPrice()}
                </div>
                <p className="text-sm text-gray-600">
                  Individuelle Preise je nach Service
                </p>
              </div>
            </div>

            {/* Aktionen */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="space-y-3">
                {userProfile ? (
                  <>
                    <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Nachricht senden
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Heart className="h-5 w-5" />
                      Zu Favoriten
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Melde dich an, um Kontakt aufzunehmen
                    </p>
                    <Link
                      to="/anmelden"
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-block text-center"
                    >
                      Jetzt anmelden
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Premium-Features */}
            {!hasAccess('relatedServices') && (
              <div className="bg-primary-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  Verwandte Services
                </h3>
                <p className="text-sm text-primary-700 mb-4">
                  Finde verwandte Dienstleister und erhalte intelligente Empfehlungen.
                </p>
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Starter-Abo ab €9,99/Monat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};