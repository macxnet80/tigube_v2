import React, { useState, useEffect } from 'react';
import { AdvertisementCard } from './AdvertisementCard';
import { advertisementService, Advertisement, TargetingOptions } from '../../lib/supabase/advertisementService';
import { useAuth } from '../../lib/auth/AuthContext';

interface AdvertisementCardContainerProps {
  targetingOptions?: TargetingOptions;
  className?: string;
}

export function AdvertisementCardContainer({ 
  targetingOptions = {}, 
  className 
}: AdvertisementCardContainerProps) {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAdvertisement();
  }, [targetingOptions]);

  const loadAdvertisement = async () => {
    try {
      setIsLoading(true);
      
      // Get user context for targeting if not provided
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

      const finalTargetingOptions: TargetingOptions = {
        petTypes: targetingOptions.petTypes || userPetTypes,
        location: targetingOptions.location || userLocation || undefined,
        subscriptionType: targetingOptions.subscriptionType || 'free'
      };

      const { data, error } = await advertisementService.getTargetedAdvertisements(
        'search_card',
        finalTargetingOptions,
        1
      );

      if (error) {
        console.warn('No advertisements available or database function missing:', error);
        // Silently fail - this is expected when no ads are configured
        return;
      }

      if (data && data.length > 0) {
        setAdvertisement(data[0]);
      } else {
        console.log('No targeted advertisements found for search card');
      }
    } catch (error) {
      console.warn('Advertisement loading failed (this is normal if no ads are configured):', error);
      // Don't throw error - just silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpression = async (adId: string) => {
    try {
      const result = await advertisementService.trackImpression(adId, user?.id);
      if (result.impressionId) {
        setImpressionId(result.impressionId);
      }
    } catch (error) {
      console.warn('Could not track advertisement impression:', error);
      // Silently fail - tracking is not critical for page functionality
    }
  };

  const handleClick = async (adId: string) => {
    try {
      await advertisementService.trackClick(adId, impressionId, user?.id);
    } catch (error) {
      console.warn('Could not track advertisement click:', error);
      // Silently fail - tracking is not critical for page functionality
    }
  };

  // Don't render anything if loading or no advertisement
  if (isLoading || !advertisement) {
    return null;
  }

  return (
    <AdvertisementCard
      advertisement={advertisement}
      onImpression={handleImpression}
      onClick={handleClick}
      className={className}
    />
  );
}

export default AdvertisementCardContainer;