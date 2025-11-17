import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Shield, MessageCircle, Heart, Verified, Briefcase, CheckCircle, Globe, User, Award, Image, DollarSign, GraduationCap } from 'lucide-react';
import AdvertisementBanner from '../components/ui/AdvertisementBanner';
import { DE, GB, FR, ES, IT, PT, NL, RU, PL, TR, AE } from 'country-flag-icons/react/3x2';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AvailabilityDisplay from '../components/ui/AvailabilityDisplay';
import HomePhotosSection from '../components/ui/HomePhotosSection';
import { DienstleisterService } from '../lib/services/dienstleisterService';
import { useAuth } from '../lib/auth/AuthContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useSubscription } from '../lib/auth/useSubscription';
import { getOrCreateConversation } from '../lib/supabase/chatService';
import { ownerCaretakerService, caretakerPartnerService } from '../lib/supabase/db';
import { formatCurrency, isCaretaker } from '../lib/utils';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase/client';
import type { DienstleisterProfil } from '../lib/types/dienstleister';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  user_id: string | null;
  caretaker_response?: string | null;
  caretaker_response_created_at?: string | null;
  users?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

function DienstleisterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, userProfile } = useAuth();
  const { checkFeature, canSendContactRequest, trackUsage, subscription } = useFeatureAccess();
  const { isPremiumUser, subscriptionLoading } = useSubscription();
  
  const [dienstleister, setDienstleister] = useState<DienstleisterProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);

  useEffect(() => {
    const fetchDienstleister = async () => {
      if (!id) {
        setError('Keine Dienstleister-ID angegeben');
        setLoading(false);
        return;
      }

      // Premium-Check: Free-User können nur ihr eigenes Profil sehen
      const isOwnProfile = user && id === user.id;
      if (!isOwnProfile && !isPremiumUser && !subscriptionLoading) {
        setError('Premium-Mitgliedschaft erforderlich');
        setLoading(false);
        navigate('/mitgliedschaften?feature=profile_view');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Übergebe user.id als viewerId, damit das eigene Profil auch ohne Freigabe geladen wird
        const profil = await DienstleisterService.getDienstleisterProfil(id, user?.id);
        
        console.log('🔍 Fetch result:', { profil });
        
        if (!profil) {
          console.error('❌ No data returned');
          // Prüfe ob es das eigene Profil ist
          if (user && id === user.id) {
            setError('Dein Profil konnte nicht geladen werden. Bitte versuche es später erneut.');
          } else {
            setError('Dienstleister nicht gefunden oder noch nicht freigegeben');
          }
          setDienstleister(null);
        } else {
          console.log('✅ Dienstleister data loaded successfully:', profil);
          console.log('📊 Öffnungszeiten:', profil.oeffnungszeiten);
          console.log('🖼️ Portfolio URLs:', profil.portfolio_urls);
          console.log('💼 Erfahrung:', {
            experience_years: profil.experience_years,
            experience_description: profil.experience_description
          });
          setDienstleister(profil);
        }
      } catch (err) {
        console.error('Error fetching dienstleister:', err);
        setError('Unerwarteter Fehler beim Laden des Profils');
        setDienstleister(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDienstleister();
  }, [id, user, isPremiumUser, subscriptionLoading, navigate]);

  // Lade Bewertungen
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      setReviewsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            user_id,
            caretaker_response,
            caretaker_response_created_at,
            users(first_name, last_name)
          `)
          .eq('caretaker_id', id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Formatierung des Namens
  const formatDienstleisterName = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'Unbekannt';
    if (!lastName) return firstName || '';
    return `${firstName || ''} ${lastName.charAt(0)}.`;
  };

  // Kontakt-Button Handler mit Feature Gate
  const handleContactClick = async () => {
    if (!user) {
      navigate('/anmelden?redirect=' + encodeURIComponent(`/dienstleister/${id}`));
      return;
    }

    if (!dienstleister?.id) {
      console.error('Dienstleister ID fehlt');
      return;
    }

    setIsContactLoading(true);

    try {
      const allowed = await canSendContactRequest();

      if (!allowed) {
        setIsContactLoading(false);
        navigate('/mitgliedschaften?feature=contact_request');
        return;
      }

      await trackUsage('contact_request');

      // Für Dienstleister verwenden wir die id als caretaker_id (da sie auch in conversations als caretaker_id gespeichert werden)
      const { data: conversation, error } = await getOrCreateConversation({
        owner_id: user.id,
        caretaker_id: dienstleister.id
      });

      if (conversation && !error) {
        navigate(`/nachrichten/${conversation.id}`);
      } else {
        console.warn('Konversation konnte nicht erstellt/gefunden werden. Öffne Nachrichtenübersicht.', error);
        navigate('/nachrichten');
      }
    } catch (error) {
      console.error('Unerwarteter Fehler beim Kontaktieren:', error);
      navigate('/nachrichten');
    } finally {
      setIsContactLoading(false);
    }
  };

  // Lade Favoriten-Status wenn User eingeloggt ist
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!user || !id) return;
      
      try {
        const { isFavorite: favoriteStatus } = await ownerCaretakerService.isFavorite(user.id, id);
        setIsFavorite(favoriteStatus);
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [user, id]);

  // Lade Partner-Status wenn User eingeloggt ist und ein Dienstleister/Betreuer ist
  useEffect(() => {
    const fetchPartnerStatus = async () => {
      if (!user || !id || !userProfile) return;
      
      // Nur für Dienstleister/Betreuer anzeigen
      const isCaretakerUser = userProfile.user_type === 'caretaker' || 
        (userProfile.user_type && ['hundetrainer', 'tierarzt', 'tierfriseur', 'physiotherapeut', 'ernaehrungsberater', 'tierfotograf', 'sonstige'].includes(userProfile.user_type));
      
      if (!isCaretakerUser) return;
      
      try {
        const { isPartner: partnerStatus } = await caretakerPartnerService.isPartner(user.id, id);
        setIsPartner(partnerStatus);
      } catch (error) {
        console.error('Error fetching partner status:', error);
      }
    };

    fetchPartnerStatus();
  }, [user, id, userProfile]);

  // Favoriten Toggle Handler
  const handleFavoriteToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!user) {
      navigate('/anmelden?redirect=' + encodeURIComponent(`/dienstleister/${id}`));
      return;
    }

    if (!dienstleister?.id) {
      console.error('Dienstleister ID fehlt');
      return;
    }

    setIsFavoriteLoading(true);

    try {
      const { isFavorite: newFavoriteStatus, error } = await ownerCaretakerService.toggleFavorite(user.id, dienstleister.id);
      
      if (error) {
        console.error('Fehler beim Aktualisieren der Favoriten:', error);
        // TODO: Toast-Benachrichtigung anzeigen
        return;
      }

      setIsFavorite(newFavoriteStatus);
      // TODO: Success Toast anzeigen
    } catch (error) {
      console.error('Unerwarteter Fehler beim Favorisieren:', error);
      // TODO: Toast-Benachrichtigung anzeigen
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Partner Toggle Handler (für Dienstleister/Betreuer)
  const handlePartnerToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!user) {
      navigate('/anmelden?redirect=' + encodeURIComponent(`/dienstleister/${id}`));
      return;
    }

    if (!dienstleister?.id) {
      console.error('Dienstleister ID fehlt');
      return;
    }

    setIsPartnerLoading(true);

    try {
      const { isPartner: newPartnerStatus, error } = await caretakerPartnerService.togglePartner(user.id, dienstleister.id);
      
      if (error) {
        console.error('Fehler beim Aktualisieren der Partner:', error);
        return;
      }

      setIsPartner(newPartnerStatus);
    } catch (error) {
      console.error('Unerwarteter Fehler beim Partner-Toggle:', error);
    } finally {
      setIsPartnerLoading(false);
    }
  };

  // Sprach-zu-Code Mapping
  const getLanguageFlag = (language: string) => {
    const languageMap: Record<string, any> = {
      'Deutsch': DE,
      'Englisch': GB,
      'English': GB,
      'Französisch': FR,
      'Français': FR,
      'Spanisch': ES,
      'Español': ES,
      'Italienisch': IT,
      'Italiano': IT,
      'Portugiesisch': PT,
      'Português': PT,
      'Niederländisch': NL,
      'Nederlands': NL,
      'Russisch': RU,
      'Русский': RU,
      'Polnisch': PL,
      'Polski': PL,
      'Türkisch': TR,
      'Türkçe': TR,
      'Arabisch': AE,
      'العربية': AE
    };
    
    return languageMap[language] || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dienstleister) {
    const isPremiumError = error === 'Premium-Mitgliedschaft erforderlich';
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error || 'Dienstleister nicht gefunden'}
        </h1>
        <p className="mb-8">
          {error || 'Der gesuchte Dienstleister existiert nicht oder wurde entfernt.'}
        </p>
        {isPremiumError ? (
          <div className="flex flex-col gap-4 items-center">
            <p className="text-gray-600">
              Um andere Profile anzusehen, benötigst du eine Premium-Mitgliedschaft.
            </p>
            <Link to="/mitgliedschaften?feature=profile_view">
              <Button variant="primary">Jetzt upgraden</Button>
            </Link>
            <Link to="/dienstleister">
              <Button variant="outline">Zurück zur Suche</Button>
            </Link>
          </div>
        ) : (
          <Link to="/dienstleister">
            <Button variant="primary">Zurück zur Suche</Button>
          </Link>
        )}
      </div>
    );
  }

  const displayName = formatDienstleisterName(dienstleister.first_name, dienstleister.last_name);
  const avatarUrl = dienstleister.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f3f4f6&color=374151`;
  const location = `${dienstleister.plz} ${dienstleister.city}`;
  const rating = dienstleister.rating ? Number(dienstleister.rating) : 0;
  const reviewCount = reviews.length;
  
  // Prüfe ob es ein Betreuer ist
  const isCaretakerUser = isCaretaker(
    dienstleister.search_type === 'caretaker' ? 'caretaker' : undefined,
    dienstleister.dienstleister_typ,
    dienstleister.kategorie_id
  );

  // Berechne den niedrigsten Preis aus services_with_categories für Header-Anzeige
  const getHeaderPrice = () => {
    // Wenn hourly_rate vorhanden ist, verwende diesen
    if (dienstleister.hourly_rate && dienstleister.hourly_rate > 0) {
      return `ab ${formatCurrency(dienstleister.hourly_rate)}/Std`;
    }
    
    // Ansonsten suche den niedrigsten Preis aus services_with_categories
    if (dienstleister.services_with_categories && Array.isArray(dienstleister.services_with_categories) && dienstleister.services_with_categories.length > 0) {
      const prices = dienstleister.services_with_categories
        .map((service: any) => {
          if (service.price && Number(service.price) > 0 && service.price_type === 'per_hour') {
            return Number(service.price);
          }
          return null;
        })
        .filter((price: number | null) => price !== null) as number[];
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return `ab ${formatCurrency(minPrice)}/Std`;
      }
    }
    
    return 'Preis auf Anfrage';
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="md:w-1/4 lg:w-1/5">
              <div className="relative rounded-xl overflow-hidden shadow-md">
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-full aspect-square object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f3f4f6&color=374151`;
                  }}
                />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                    {dienstleister.approval_status === 'approved' && (
                      <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
                        <Verified className="h-2.5 w-2.5 mr-1" /> Verifiziert
                      </span>
                    )}
                    {dienstleister.is_commercial && (
                      <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center">
                        <Briefcase className="h-2.5 w-2.5 mr-1" /> Pro
                      </span>
                    )}
                    {dienstleister.short_term_available && (
                      <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
                        <Clock className="h-2.5 w-2.5 mr-1" /> Kurzfristig Verfügbar
                      </span>
                    )}
                    {dienstleister.notfall_bereitschaft && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
                        Notfall
                      </span>
                    )}

                    {/* Herz-Icon neben dem Namen */}
                    <div className="flex items-center gap-2">
                      {/* Favoriten-Herz (für Owner) */}
                      {user && userProfile?.user_type === 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFavoriteToggle}
                          className="p-1 focus:ring-0 focus:ring-offset-0"
                          disabled={isFavoriteLoading}
                          title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                        >
                          {isFavoriteLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                          ) : isFavorite ? (
                            <Heart className="h-5 w-5 text-primary-500 fill-primary-500" />
                          ) : (
                            <Heart className="h-5 w-5 text-primary-500 hover:text-primary-600" />
                          )}
                        </Button>
                      )}
                      {/* Partner-Herz (für Dienstleister/Betreuer) */}
                      {user && userProfile && (userProfile.user_type === 'caretaker' || 
                        (userProfile.user_type && ['hundetrainer', 'tierarzt', 'tierfriseur', 'physiotherapeut', 'ernaehrungsberater', 'tierfotograf', 'sonstige'].includes(userProfile.user_type))) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePartnerToggle}
                          className="p-1 focus:ring-0 focus:ring-offset-0"
                          disabled={isPartnerLoading}
                          title={isPartner ? 'Partner entfernen' : 'Als Partner speichern'}
                        >
                          {isPartnerLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                          ) : isPartner ? (
                            <Heart className="h-5 w-5 text-primary-500 fill-primary-500" />
                          ) : (
                            <Heart className="h-5 w-5 text-primary-500 hover:text-primary-600" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-semibold text-lg">
                        {rating > 0 ? rating.toFixed(1) : '—'}
                      </span>
                      <span className="text-gray-600 ml-1">
                        ({reviewCount} {reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    {dienstleister.kategorie_name && (
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        {dienstleister.kategorie_name}
                      </div>
                    )}
                    <div className="text-2xl font-bold text-primary-600">
                      {getHeaderPrice()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Services / Spezialisierungen */}
              {dienstleister.spezialisierungen && Array.isArray(dienstleister.spezialisierungen) && dienstleister.spezialisierungen.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {dienstleister.spezialisierungen
                    .filter(spec => typeof spec === 'string')
                    .map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {spec}
                      </span>
                    ))}
                </div>
              )}
              
              {/* Kurze Beschreibung im Header */}
              {dienstleister.short_about_me && (
                <p className="text-gray-700 mb-6 whitespace-pre-wrap break-words w-full lg:w-3/5">
                  {dienstleister.short_about_me}
                </p>
              )}
              
              {/* Anmeldung-Aufforderung für nicht eingeloggte Benutzer */}
              {!user && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-blue-800">
                        Melde dich an, um mit {displayName} in Kontakt zu treten
                      </h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Du kannst das Profil ansehen, aber für Nachrichten und Favoriten musst du angemeldet sein.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/anmelden?redirect=' + encodeURIComponent(`/dienstleister/${id}`))}
                    >
                      Anmelden
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/registrieren?redirect=' + encodeURIComponent(`/dienstleister/${id}`))}
                    >
                      Registrieren
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  leftIcon={<MessageCircle className="h-4 w-4" />}
                  onClick={handleContactClick}
                  isLoading={isContactLoading}
                  disabled={isContactLoading}
                >
                  Nachricht senden
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Banner Top */}
      <div className="container-custom py-4">
        <AdvertisementBanner 
          placement="profile_top"
          targetingOptions={{
            petTypes: userProfile?.pet_types || [],
            location: userProfile?.location || '',
            subscriptionType: subscription?.plan_type || 'free'
          }}
        />
      </div>

      {/* Details Tabs */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {(dienstleister.bio || dienstleister.long_about_me) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600" />
                  Über {displayName}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {dienstleister.long_about_me || dienstleister.bio}
                </p>
              </div>
            )}

            {/* Erfahrung */}
            {(dienstleister.experience_description || dienstleister.experience_years) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary-600" />
                  Erfahrung
                </h2>
                {dienstleister.experience_years && (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {Number(dienstleister.experience_years)} Jahre Erfahrung
                  </p>
                )}
                {dienstleister.experience_description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {dienstleister.experience_description}
                  </p>
                )}
              </div>
            )}

            {/* Verfügbarkeit - nur für Betreuer */}
            {isCaretakerUser && dienstleister.availability && (
              <AvailabilityDisplay 
                availability={dienstleister.availability} 
                overnightAvailability={dienstleister.overnight_availability}
              />
            )}

            {/* Öffnungszeiten - für andere Dienstleister */}
            {!isCaretakerUser && dienstleister.oeffnungszeiten && Object.keys(dienstleister.oeffnungszeiten).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Öffnungszeiten
                </h2>
                <div className="space-y-2">
                  {Object.entries(dienstleister.oeffnungszeiten)
                    .filter(([day, hours]) => hours !== null && hours !== undefined) // Filtere null-Werte heraus
                    .map(([day, hours]: [string, any]) => {
                      // Formatierung der Tagesnamen
                      const dayNames: Record<string, string> = {
                        'Mo': 'Montag',
                        'Di': 'Dienstag',
                        'Mi': 'Mittwoch',
                        'Do': 'Donnerstag',
                        'Fr': 'Freitag',
                        'Sa': 'Samstag',
                        'So': 'Sonntag'
                      };
                      const displayDay = dayNames[day] || day;
                      
                      // Prüfe ob geschlossen
                      const isClosed = hours && typeof hours === 'object' && hours.closed === true;
                      
                      return (
                        <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700">{displayDay}</span>
                          <span className="text-gray-600">
                            {isClosed
                              ? 'Geschlossen'
                              : hours && typeof hours === 'object' && hours.open && hours.close
                              ? `${hours.open} - ${hours.close}`
                              : hours && typeof hours === 'string'
                              ? hours
                              : 'Geschlossen'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Umgebungsbilder - nur für Betreuer */}
            {isCaretakerUser && dienstleister.home_photos && dienstleister.home_photos.length > 0 && (
              <HomePhotosSection homePhotos={dienstleister.home_photos} caretakerName={displayName} />
            )}

            {/* Portfolio - für alle Dienstleister */}
            {dienstleister.portfolio_urls && Array.isArray(dienstleister.portfolio_urls) && dienstleister.portfolio_urls.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary-600" />
                  {isCaretakerUser ? 'Umgebungsbilder' : 'Portfolio'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dienstleister.portfolio_urls.map((url, index) => {
                    const urlString = typeof url === 'string' ? url : String(url);
                    return (
                      <div 
                        key={index} 
                        className="aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => {
                          // Lightbox-Funktionalität könnte hier hinzugefügt werden
                          window.open(urlString, '_blank');
                        }}
                      >
                        <img
                          src={urlString}
                          alt={`${isCaretakerUser ? 'Umgebungsbild' : 'Portfolio'} ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x400?text=Bild+fehlt';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {dienstleister.portfolio_urls.length > 6 && (
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    +{dienstleister.portfolio_urls.length - 6} weitere Bilder
                  </p>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary-600" />
                Bewertungen ({reviews.length})
              </h2>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} dienstleisterName={displayName} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Noch keine Bewertungen vorhanden.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leistungen & Preise */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                Leistungen & Preise
              </h2>
              <div className="space-y-6">
                {dienstleister.services_with_categories && Array.isArray(dienstleister.services_with_categories) && dienstleister.services_with_categories.length > 0 ? (
                  dienstleister.services_with_categories.map((service: any, index: number) => {
                    const serviceName = service.name || 'Unbekannte Leistung';
                    const servicePrice = service.price;
                    const priceType = service.price_type || 'per_hour';
                    
                    let displayPrice = 'Preis auf Anfrage';
                    if (servicePrice !== null && servicePrice !== undefined && Number(servicePrice) > 0) {
                      if (priceType === 'per_hour') {
                        displayPrice = `${formatCurrency(Number(servicePrice))}/Std`;
                      } else if (priceType === 'per_visit') {
                        // Spezielle Behandlung für Anfahrkosten
                        if (serviceName.toLowerCase().includes('anfahr') || serviceName.toLowerCase().includes('fahrt')) {
                          displayPrice = `${formatCurrency(Number(servicePrice))}/km`;
                        } else {
                          displayPrice = `${formatCurrency(Number(servicePrice))}/Besuch`;
                        }
                      } else if (priceType === 'per_day') {
                        displayPrice = `${formatCurrency(Number(servicePrice))}/Tag`;
                      } else {
                        displayPrice = `${formatCurrency(Number(servicePrice))}`;
                      }
                    }
                    
                    return (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium block">{serviceName}</span>
                          {service.beschreibung && (
                            <span className="text-sm text-gray-600 block mt-1">{service.beschreibung}</span>
                          )}
                        </div>
                        <span className="text-lg font-semibold text-primary-600 ml-4 whitespace-nowrap">
                          {displayPrice}
                        </span>
                      </div>
                    );
                  })
                ) : dienstleister.hourly_rate && dienstleister.hourly_rate > 0 ? (
                  <div className="text-center py-4">
                    <span className="text-lg font-semibold text-primary-600">
                      ab {formatCurrency(dienstleister.hourly_rate)}/Std
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-gray-600">Preis auf Anfrage</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sprachen */}
            {dienstleister.languages && Array.isArray(dienstleister.languages) && dienstleister.languages.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary-600" />
                  Sprachen
                </h2>
                <div className="flex flex-wrap gap-3">
                  {dienstleister.languages.map((language, index) => {
                    const FlagComponent = getLanguageFlag(language);
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                      >
                        {FlagComponent && (
                          <FlagComponent 
                            className="w-5 h-4 rounded-sm border border-gray-300 shadow-sm" 
                            title={language}
                          />
                        )}
                        <span className="text-gray-700 font-medium">{language}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fähigkeiten & Qualifikationen */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                Fähigkeiten & Qualifikationen
              </h2>
              <div className="space-y-3">
                {dienstleister.qualifications && Array.isArray(dienstleister.qualifications) && dienstleister.qualifications.length > 0 ? (
                  dienstleister.qualifications.map((qualification, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                      <span className="text-gray-700">{typeof qualification === 'string' ? qualification : String(qualification)}</span>
                    </div>
                  ))
                ) : dienstleister.zertifikate && Array.isArray(dienstleister.zertifikate) && dienstleister.zertifikate.length > 0 ? (
                  dienstleister.zertifikate.map((zertifikat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                      <span className="text-gray-700">{typeof zertifikat === 'string' ? zertifikat : String(zertifikat)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Keine Qualifikationen hinterlegt.</p>
                )}
              </div>
            </div>

            {/* Advertisement Banner */}
            <AdvertisementBanner 
              placement="profile_sidebar"
              targetingOptions={{
                petTypes: userProfile?.pet_types || [],
                location: userProfile?.location || '',
                subscriptionType: subscription?.plan_type || 'free'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  dienstleisterName: string;
}

function ReviewCard({ review, dienstleisterName }: ReviewCardProps) {
  const formatReviewerName = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'Anonym';
    if (!lastName) return firstName || 'Anonym';
    return `${firstName || ''} ${lastName.charAt(0)}.`;
  };

  const reviewerName = review.users 
    ? formatReviewerName(review.users.first_name, review.users.last_name)
    : 'Anonym';

  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < review.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">
            {reviewerName}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {new Date(review.created_at || '').toLocaleDateString('de-DE')}
        </span>
      </div>
      <p className="text-gray-700">{review.comment || ''}</p>
      
      {/* Dienstleister Antwort */}
      {review.caretaker_response && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-primary-200 bg-primary-50 rounded-r-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium text-primary-800">Antwort von {dienstleisterName}:</div>
            <span className="text-xs text-primary-600">
              {review.caretaker_response_created_at ? new Date(review.caretaker_response_created_at).toLocaleDateString('de-DE') : ''}
            </span>
          </div>
          <p className="text-sm text-primary-700 whitespace-pre-line">{review.caretaker_response}</p>
        </div>
      )}
    </div>
  );
}

export default DienstleisterProfilePage;
