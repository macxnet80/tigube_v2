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
        "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden",
        className
      )}
      onClick={handleClick}
    >
      {/* Sponsored Label */}
      <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
        <Eye className="h-3 w-3" />
        Gesponsert
      </div>

      <div className="flex flex-col h-full">
        {/* Image Section */}
        {advertisement.image_url && !imageError && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={advertisement.image_url}
              alt={advertisement.title}
              className={cn(
                "w-full h-48 object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!imageLoaded && (
              <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-sm">Lädt...</div>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {advertisement.title}
          </h3>
          
          {advertisement.description && (
            <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
              {advertisement.description}
            </p>
          )}

          {/* CTA Button */}
          <div className="mt-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full group-hover:bg-blue-600 transition-colors"
              rightIcon={<ExternalLink className="h-4 w-4" />}
            >
              {advertisement.cta_text}
            </Button>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}

export default AdvertisementCard;