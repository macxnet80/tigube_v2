import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import type { MarketplaceListingWithDetails } from '../../lib/types/marketplace';
import { getMarketplaceImagePublicUrl } from '../../lib/supabase/marketplaceService';

function formatPrice(listing: MarketplaceListingWithDetails): string {
  if (listing.listing_type === 'verschenke' || listing.price_type === 'kostenlos') {
    return 'Zu verschenken';
  }
  if (listing.price_type === 'verhandelbar') {
    return listing.price != null ? `VB ${Number(listing.price).toFixed(2)} €` : 'VB';
  }
  if (listing.price != null) {
    return `${Number(listing.price).toFixed(2)} €`;
  }
  return '—';
}

const TYPE_LABEL: Record<string, string> = {
  biete: 'Biete',
  suche: 'Suche',
  verschenke: 'Verschenke',
};

interface MarketplaceListingCardProps {
  listing: MarketplaceListingWithDetails;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavorite?: boolean;
}

function MarketplaceListingCard({
  listing,
  isFavorite = false,
  onToggleFavorite,
  showFavorite = false,
}: MarketplaceListingCardProps) {
  const firstImage = listing.images?.sort((a, b) => a.sort_order - b.sort_order)[0];
  const imgUrl = firstImage ? getMarketplaceImagePublicUrl(firstImage.storage_path) : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md">
      <Link to={`/marktplatz/${listing.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Kein Bild</div>
          )}
          <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-800 shadow-sm">
            {TYPE_LABEL[listing.listing_type] ?? listing.listing_type}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-primary-700">
            {listing.title}
          </h3>
          {listing.category?.name && (
            <p className="mt-1 text-xs text-primary-600">{listing.category.name}</p>
          )}
          <p className="mt-2 text-lg font-bold text-gray-900">{formatPrice(listing)}</p>
          {(listing.location_city || listing.location_zip) && (
            <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {[listing.location_zip, listing.location_city].filter(Boolean).join(' ')}
              </span>
            </p>
          )}
        </div>
      </Link>
      {showFavorite && onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-2 top-2 rounded-full bg-white/95 p-2 shadow-md transition hover:bg-white"
          aria-label={isFavorite ? 'Von Merkliste entfernen' : 'Merken'}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            aria-hidden
          />
        </button>
      )}
    </article>
  );
}

export default MarketplaceListingCard;
