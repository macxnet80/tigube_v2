import React, { useState, useEffect, useRef, useMemo } from 'react';
import { advertisementService, Advertisement, TargetingOptions } from '../../lib/supabase/advertisementService';
import { useAuth } from '../../lib/auth/AuthContext';
import { ExternalLink } from 'lucide-react';

interface AdvertisementBannerProps {
  className?: string;
  targetingOptions?: TargetingOptions;
  placement?: 'profile_sidebar' | 'profile_top' | 'search_results' | 'search_filters' | 'search_filter_box' | 'owner_dashboard' | 'caretaker_dashboard';
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  className = '',
  targetingOptions = {},
  placement = 'profile_sidebar'
}) => {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Memoize targeting options to prevent unnecessary re-renders
  const memoizedTargetingOptions = useMemo(() => {
    return {
      petTypes: targetingOptions.petTypes || [],
      location: targetingOptions.location || '',
      subscriptionType: targetingOptions.subscriptionType || 'free'
    };
  }, [targetingOptions.petTypes, targetingOptions.location, targetingOptions.subscriptionType]);

  // Load advertisement on component mount and when placement changes
  useEffect(() => {
    loadAdvertisement();
  }, [placement]); // Only reload when placement changes, not targeting options

  // Set up intersection observer for impression tracking
  useEffect(() => {
    if (!advertisement || impressionTracked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            trackImpression();
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current);
      }
    };
  }, [advertisement, impressionTracked]);

    const loadAdvertisement = async () => {
    try {
      setIsLoading(true);
      
      // Get user context for targeting
      let userPetTypes: string[] = [];
      let userLocation: string | null = null;
      
      if (user) {
        try {
          userPetTypes = await advertisementService.getUserPetTypes(user.id);
          userLocation = await advertisementService.getUserLocation(user.id);
        } catch (userError) {
          console.warn('Could not load user context for targeting:', userError);
          // Continue with empty targeting options
        }
      }

      // Verwende die memoized Targeting-Optionen oder Standard-Werte
      const finalTargetingOptions: TargetingOptions = {
        petTypes: memoizedTargetingOptions.petTypes.length > 0 ? memoizedTargetingOptions.petTypes : ['Hund', 'Katze'], // Fallback zu häufigen Haustieren
        location: memoizedTargetingOptions.location || 'Deutschland', // Fallback zu Deutschland
        subscriptionType: memoizedTargetingOptions.subscriptionType || 'free'
      };

      // Bestimme den korrekten ad_type basierend auf der Platzierung
      let adType: 'search_card' | 'search_filter' | 'search_card_filter' | 'profile_banner' | 'dashboard_banner';
      
      switch (placement) {
        case 'profile_sidebar':
        case 'profile_top':
          adType = 'profile_banner';
          break;
        case 'search_results':
          adType = 'search_card';
          break;
        case 'search_filters':
          adType = 'search_filter';
          break;
        case 'search_filter_box':
          adType = 'search_card_filter';
          break;
        case 'owner_dashboard':
        case 'caretaker_dashboard':
          adType = 'dashboard_banner';
          break;
        default:
          adType = 'profile_banner';
      }

      // Lade alle passenden Werbungen und filtere nach der spezifischen Platzierung
      console.log('Loading advertisements for placement:', placement, 'with adType:', adType, 'and targeting:', finalTargetingOptions);
      const { data, error } = await advertisementService.getTargetedAdvertisements(
        adType,
        finalTargetingOptions,
        10 // Lade mehr Werbungen, um nach Platzierung zu filtern
      );

      if (error) {
        console.warn('No advertisements available or database function missing:', error);
        setAdvertisement(null); // Explizit null setzen
        return;
      }

      console.log('Raw advertisement data:', data);

      // Filtere nach der spezifischen Platzierung basierend auf dem Format
      let filteredData = data;
      if (data && data.length > 0) {
        // Versuche, eine Werbung mit der passenden Platzierung zu finden
        const placementSpecificAd = data.find(ad => {
          // Prüfe, ob das Format zur Platzierung passt
          if (placement === 'profile_sidebar' && ad.display_width === 300 && ad.display_height === 600) {
            return true; // Profile Banner Sidebar Format
          }
          if (placement === 'profile_top' && ad.display_width === 728 && ad.display_height === 90) {
            return true; // Profile Banner Top Format
          }
          if (placement === 'search_filters' && ad.display_width === 970 && ad.display_height === 90) {
            return true; // Search Filter Banner Format
          }
          if (placement === 'search_filter_box' && ad.display_width === 384 && ad.display_height === 480) {
            return true; // Search Card Filter Box Format
          }
          if (placement === 'search_results' && ad.display_width === 384 && ad.display_height === 480) {
            return true; // Search Card Results Format (gleiche Größe wie search_filter_box)
          }
          if (placement === 'owner_dashboard' && ad.display_width === 970 && ad.display_height === 90) {
            return true; // Owner Dashboard Banner Format
          }
          if (placement === 'caretaker_dashboard' && ad.display_width === 970 && ad.display_height === 90) {
            return true; // Caretaker Dashboard Banner Format
          }
          return false;
        });
        
        if (placementSpecificAd) {
          filteredData = [placementSpecificAd];
        } else {
          // Kein Fallback mehr - zeige keine Werbung, wenn keine passende gefunden wird
          filteredData = [];
        }
      }

      if (filteredData && filteredData.length > 0) {
        console.log('Found advertisement for placement', placement, ':', filteredData[0]);
        setAdvertisement(filteredData[0]);
      } else {
        console.log('No targeted advertisements found for placement', placement, 'with targeting options:', finalTargetingOptions);
        setAdvertisement(null); // Explizit null setzen
      }
    } catch (error) {
      console.warn('Advertisement loading failed (this is normal if no ads are configured):', error);
      setAdvertisement(null); // Explizit null setzen bei Fehlern
    } finally {
      setIsLoading(false);
    }
  };

  const trackImpression = async () => {
    if (!advertisement || impressionTracked) return;

    try {
      let userPetTypes: string[] = [];
      let userLocation: string | null = null;
      
      if (user) {
        try {
          userPetTypes = await advertisementService.getUserPetTypes(user.id);
          userLocation = await advertisementService.getUserLocation(user.id);
        } catch (userError) {
          console.warn('Could not load user context for impression tracking:', userError);
          // Continue with empty context
        }
      }

      const { data, error } = await advertisementService.trackImpression(
        advertisement.id,
        'profile_page',
        {
          petTypes: userPetTypes,
          location: userLocation || undefined,
          subscriptionType: 'free' // TODO: Get actual subscription type
        }
      );

      if (!error && data) {
        setImpressionId(data.id);
        setImpressionTracked(true);
      }
    } catch (error) {
      console.warn('Could not track banner impression:', error);
      // Silently fail - tracking is not critical for page functionality
    }
  };

  const handleClick = async () => {
    if (!advertisement) return;

    try {
      let userPetTypes: string[] = [];
      let userLocation: string | null = null;
      
      if (user) {
        try {
          userPetTypes = await advertisementService.getUserPetTypes(user.id);
          userLocation = await advertisementService.getUserLocation(user.id);
        } catch (userError) {
          console.warn('Could not load user context for click tracking:', userError);
          // Continue with empty context
        }
      }

      // Track click
      await advertisementService.trackClick(
        advertisement.id,
        'profile_page',
        impressionId || undefined,
        {
          petTypes: userPetTypes,
          location: userLocation || undefined,
          subscriptionType: 'free' // TODO: Get actual subscription type
        }
      );

      // Open link in new tab
      if (advertisement.link_url) {
        window.open(advertisement.link_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.warn('Could not track banner click:', error);
      // Still open the link even if tracking fails
      if (advertisement.link_url) {
        window.open(advertisement.link_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Don't render if loading or no ad
  if (isLoading || !advertisement) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      className={`relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${className} ${placement === 'search_results' ? 'flex flex-col' : ''}`}
    >
      {/* Advertisement content */}
      <div
        onClick={handleClick}
        className={`cursor-pointer block ${placement === 'search_results' ? 'flex flex-col flex-1' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Image - für search_results quadratisch wie Profil-Karten */}
        {advertisement.image_url && (
          <div className={`relative w-full ${placement === 'search_results' ? 'aspect-square' : 'h-56'} bg-gray-100`}>
            <img
              src={advertisement.image_url}
              alt={advertisement.title}
              className={`w-full h-full object-contain object-center ${placement === 'search_results' ? 'rounded-t-xl' : ''}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content - für search_results strukturiert wie Profil-Karten */}
        <div className={`${placement === 'search_results' ? 'p-5 flex flex-col flex-1' : 'p-4'}`}>
          {placement === 'search_results' ? (
            // Strukturiert wie Profil-Karten für einheitliche Höhe
            <>
              {/* Titel */}
              {advertisement.title && (
                <h3 className="font-semibold text-gray-900 text-base mb-2">
                  {advertisement.title}
                </h3>
              )}
              
              {/* Beschreibung - 3 Zeilen wie Bio */}
              {advertisement.description && (
                <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed mb-4">
                  {advertisement.description}
                </p>
              )}
              
              {/* Spacer um Button nach unten zu drücken */}
              <div className="flex-1"></div>
              
              {/* CTA Button - immer ganz unten */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors duration-200">
                    {advertisement.cta_text || 'Mehr erfahren'}
                    <ExternalLink className="w-3 w-3 ml-1" />
                  </span>
                  
                  {/* Sponsored label - rechts */}
                  <span className="text-xs text-gray-400 font-medium">
                    Gesponsert
                  </span>
                </div>
              </div>
            </>
          ) : (
            // Standard-Layout für andere Platzierungen
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {advertisement.title && (
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {advertisement.title}
                  </h3>
                )}
                
                {advertisement.description && (
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {advertisement.description}
                  </p>
                )}

                {/* CTA Button */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors duration-200">
                    {advertisement.cta_text || 'Mehr erfahren'}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </span>
                  
                  {/* Sponsored label */}
                  <span className="text-xs text-gray-400 font-medium">
                    Gesponsert
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner;