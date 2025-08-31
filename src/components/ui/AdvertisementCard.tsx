import React from 'react';
import { ExternalLink, Eye } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/utils';

interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  cta_text: string;
  ad_type: 'search_card' | 'profile_banner';
  priority: number;
}

interface AdvertisementCardProps {
  advertisement: Advertisement;
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
  className?: string;
}

export function AdvertisementCard({ 
  advertisement, 
  onImpression, 
  onClick, 
  className 
}: AdvertisementCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [hasBeenViewed, setHasBeenViewed] = React.useState(false);

  // Intersection Observer für Impression Tracking
  React.useEffect(() => {
    if (!cardRef.current || hasBeenViewed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Card ist mindestens 50% sichtbar
            setHasBeenViewed(true);
            onImpression?.(advertisement.id);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [advertisement.id, onImpression, hasBeenViewed]);

  const handleClick = () => {
    onClick?.(advertisement.id);
    if (advertisement.link_url) {
      window.open(advertisement.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "card group hover:border-primary-200 transition-all duration-200 w-full max-w-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 cursor-pointer relative overflow-hidden",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative">
        {/* Image Section - passt sich an Bildproportionen an */}
        {advertisement.image_url && !imageError && (
          <div className="relative w-full h-64">
            <img
              src={advertisement.image_url}
              alt={advertisement.title}
              className={cn(
                "w-full h-full object-contain object-center rounded-t-xl transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!imageLoaded && (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center rounded-t-xl">
                <div className="text-gray-400 text-sm">Lädt...</div>
              </div>
            )}
            
            {/* Sponsored Badge - wie bei Profilkarten */}
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Gesponsert
            </div>
          </div>
        )}

        {/* Content Section - unter dem Bild wie Profilkarten */}
        <div className="p-5 bg-white rounded-b-xl">
          {/* Title */}
          <h3 className="font-semibold text-base group-hover:text-primary-600 transition-colors mb-3">
            {advertisement.title}
          </h3>
          
          {/* Description */}
          {advertisement.description && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
              {advertisement.description}
            </p>
          )}

          {/* CTA Button */}
          <Button
            variant="primary"
            size="sm"
            className="w-full group-hover:bg-primary-600 transition-colors"
            rightIcon={<ExternalLink className="h-4 w-4" />}
          >
            {advertisement.cta_text}
          </Button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}

export default AdvertisementCard;