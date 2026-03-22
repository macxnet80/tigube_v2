import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Pencil } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/auth/AuthContext';
import { contactSellerAboutListing } from '../lib/supabase/marketplaceContact';
import {
  getMarketplaceImagePublicUrl,
  getMarketplaceListingById,
  incrementListingView,
  toggleMarketplaceFavorite,
  getFavoriteListingIds,
} from '../lib/supabase/marketplaceService';
import { MARKETPLACE_SUITABLE_FOR_OPTIONS } from '../lib/types/marketplace';
import type { MarketplaceListingWithDetails } from '../lib/types/marketplace';

function formatPrice(listing: MarketplaceListingWithDetails): string {
  if (listing.listing_type === 'verschenke' || listing.price_type === 'kostenlos') {
    return 'Zu verschenken / kostenlos';
  }
  if (listing.price_type === 'verhandelbar') {
    return listing.price != null ? `VB ${Number(listing.price).toFixed(2)} €` : 'Verhandlungsbasis';
  }
  if (listing.price != null) {
    return `${Number(listing.price).toFixed(2)} €`;
  }
  return '—';
}

const TYPE_LABEL: Record<string, string> = {
  biete: 'Ich biete',
  suche: 'Ich suche',
  verschenke: 'Ich verschenke',
};

const CONDITION_LABEL: Record<string, string> = {
  neu: 'Neu',
  wie_neu: 'Wie neu',
  gut: 'Gut',
  akzeptabel: 'Akzeptabel',
};

function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const viewedRef = useRef(false);

  const [listing, setListing] = useState<MarketplaceListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await getMarketplaceListingById(id);
      if (cancelled) return;
      if (err) setError(err);
      setListing(data);
      setLoading(false);

      if (data && !viewedRef.current) {
        viewedRef.current = true;
        void incrementListingView(id);
      }

      if (user?.id && data) {
        const { data: fav } = await getFavoriteListingIds(user.id);
        if (!cancelled) setFavorite(fav.has(data.id));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const handleContact = async () => {
    if (!user || !listing || listing.user_id === user.id) return;
    setContactLoading(true);
    try {
      const result = await contactSellerAboutListing({
        sellerId: listing.user_id,
        buyerId: user.id,
        listingId: listing.id,
        listingTitle: listing.title,
        sellerUserType: listing.seller?.user_type,
        buyerUserType: userProfile?.user_type,
      });
      if ('error' in result) {
        setError(result.error);
        return;
      }
      navigate(`/nachrichten/${result.conversationId}`);
    } finally {
      setContactLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user || !listing) return;
    const next = !favorite;
    const { error: err } = await toggleMarketplaceFavorite(user.id, listing.id, next);
    if (err) {
      setError(err);
      return;
    }
    setFavorite(next);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="container-custom py-12">
        <p className="text-red-700">{error}</p>
        <Link to="/marktplatz" className="mt-4 inline-block text-primary-600 hover:underline">
          Zurück zum Marktplatz
        </Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container-custom py-12">
        <p className="text-gray-600">Anzeige nicht gefunden.</p>
        <Link to="/marktplatz" className="mt-4 inline-block text-primary-600 hover:underline">
          Zurück zum Marktplatz
        </Link>
      </div>
    );
  }

  const images = [...(listing.images || [])].sort((a, b) => a.sort_order - b.sort_order);
  const sellerName = listing.seller
    ? [listing.seller.first_name, listing.seller.last_name].filter(Boolean).join(' ') || 'Mitglied'
    : 'Mitglied';

  const suitableLabels = (listing.suitable_for || [])
    .map((v) => MARKETPLACE_SUITABLE_FOR_OPTIONS.find((o) => o.value === v)?.label || v)
    .filter(Boolean);

  return (
    <div className="container-custom py-8">
      <Link
        to="/marktplatz"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Zurück zum Marktplatz
      </Link>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {images.length > 0 ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={getMarketplaceImagePublicUrl(images[0].storage_path)}
                  alt=""
                  className="aspect-square w-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1).map((im) => (
                    <img
                      key={im.id}
                      src={getMarketplaceImagePublicUrl(im.storage_path)}
                      alt=""
                      className="aspect-square rounded-lg border object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500">
              Keine Fotos
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-primary-600">
            {listing.category?.name ?? 'Zubehör'} · {TYPE_LABEL[listing.listing_type] ?? listing.listing_type}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{listing.title}</h1>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatPrice(listing)}</p>

          <dl className="mt-6 space-y-2 text-sm text-gray-600">
            {(listing.location_zip || listing.location_city) && (
              <div>
                <dt className="font-medium text-gray-700">Standort</dt>
                <dd>
                  {[listing.location_zip, listing.location_city].filter(Boolean).join(' ') || '—'}
                </dd>
              </div>
            )}
            {listing.condition && (
              <div>
                <dt className="font-medium text-gray-700">Zustand</dt>
                <dd>{CONDITION_LABEL[listing.condition] ?? listing.condition}</dd>
              </div>
            )}
            {suitableLabels.length > 0 && (
              <div>
                <dt className="font-medium text-gray-700">Geeignet für</dt>
                <dd>{suitableLabels.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-gray-700">Anbieter</dt>
              <dd>{sellerName}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {user && listing.user_id === user.id && (
              <Link
                to={`/marktplatz/bearbeiten/${listing.id}`}
                className="btn btn-outline inline-flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Anzeige bearbeiten
              </Link>
            )}
            {user && listing.user_id !== user.id && listing.status === 'active' && (
              <Button
                type="button"
                leftIcon={<MessageCircle className="h-4 w-4" />}
                onClick={() => void handleContact()}
                isLoading={contactLoading}
              >
                Nachricht senden
              </Button>
            )}
            {user && listing.user_id !== user.id && (
              <Button
                type="button"
                variant="outline"
                leftIcon={<Heart className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />}
                onClick={() => void handleFavorite()}
              >
                {favorite ? 'Gemerkt' : 'Merken'}
              </Button>
            )}
            {!user && (
              <Link
                to={`/anmelden?redirect=${encodeURIComponent(`/marktplatz/${listing.id}`)}`}
                className="btn btn-primary"
              >
                Anmelden zum Kontaktieren
              </Link>
            )}
          </div>

          <section className="mt-10 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900">Beschreibung</h2>
            <p className="mt-3 whitespace-pre-wrap text-gray-700">{listing.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MarketplaceDetailPage;
