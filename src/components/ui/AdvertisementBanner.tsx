import React, { useState, useEffect, useRef } from 'react';
import { advertisementService, Advertisement, TargetingOptions } from '../../lib/supabase/advertisementService';
import { useAuth } from '../../lib/auth/AuthContext';
import { ExternalLink } from 'lucide-react';

interface AdvertisementBannerProps {
  className?: string;
  targetingOptions?: TargetingOptions;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  className = '',
  targetingOptions = {}
}) => {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load advertisement on component mount
  useEffect(() => {
    loadAdvertisement();
  }, [targetingOptions]);

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

             // Verwende die übergebenen Targeting-Optionen oder Standard-Werte
       const finalTargetingOptions: TargetingOptions = {
         petTypes: targetingOptions.petTypes || ['Hund', 'Katze'], // Fallback zu häufigen Haustieren
         location: targetingOptions.location || 'Deutschland', // Fallback zu Deutschland
         subscriptionType: targetingOptions.subscriptionType || 'free'
       };

             const { data, error } = await advertisementService.getTargetedAdvertisements(
         'profile_banner',
         finalTargetingOptions,
         1
       );

       if (error) {
         console.warn('No advertisements available or database function missing:', error);
         // Silently fail - this is expected when no ads are configured
         return;
       }

      if (data && data.length > 0) {
        console.log('Found advertisement:', data[0]);
        setAdvertisement(data[0]);
      } else {
        console.log('No targeted advertisements found for profile banner with targeting options:', finalTargetingOptions);
      }
    } catch (error) {
      console.warn('Advertisement loading failed (this is normal if no ads are configured):', error);
      // Don't throw error - just silently fail
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
      className={`relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {/* Advertisement content */}
      <div
        onClick={handleClick}
        className="cursor-pointer block"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Image */}
        {advertisement.image_url && (
          <div className="relative w-full h-48 bg-gray-100">
            <img
              src={advertisement.image_url}
              alt={advertisement.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {advertisement.title}
              </h3>
              
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
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner;