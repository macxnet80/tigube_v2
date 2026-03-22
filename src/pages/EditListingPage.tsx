import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreateListingForm from '../components/marketplace/CreateListingForm';
import {
  getMarketplaceCategories,
  getMarketplaceListingById,
} from '../lib/supabase/marketplaceService';
import { useAuth } from '../lib/auth/AuthContext';
import type { MarketplaceCategoryRow, MarketplaceListingWithDetails } from '../lib/types/marketplace';

function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<MarketplaceCategoryRow[]>([]);
  const [listing, setListing] = useState<MarketplaceListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data, error: err } = await getMarketplaceCategories();
      if (err) setError(err);
      setCategories(data);
    })();
  }, []);

  useEffect(() => {
    if (!id || authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await getMarketplaceListingById(id);
      if (cancelled) return;
      if (err) {
        setError(err);
        setListing(null);
        setLoading(false);
        return;
      }
      if (!data || data.user_id !== user.id) {
        setError(
          !data
            ? 'Anzeige nicht gefunden.'
            : 'Du kannst nur eigene Anzeigen bearbeiten.'
        );
        setListing(null);
        setLoading(false);
        return;
      }
      setListing(data);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id, authLoading]);

  if (authLoading || loading) {
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
        <Link to="/marktplatz/meine" className="mt-4 inline-block text-primary-600 hover:underline">
          Zu meinen Anzeigen
        </Link>
      </div>
    );
  }

  if (!id || !listing) {
    return (
      <div className="container-custom py-12">
        <p className="text-gray-600">Ungültige Anzeige.</p>
        <Link to="/marktplatz" className="mt-4 inline-block text-primary-600 hover:underline">
          Zum Marktplatz
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Anzeige bearbeiten</h1>
      <p className="mb-8 text-gray-600">
        Ändere Texte, Kategorie, Preis oder Fotos. Nur Zubehör — kein Tierverkauf.
      </p>
      {listing.status === 'inactive' && listing.admin_deactivation_reason && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="font-semibold">Deine Anzeige wurde von tigube deaktiviert</p>
          <p className="mt-2 whitespace-pre-wrap">{listing.admin_deactivation_reason}</p>
          <p className="mt-2 text-red-800">
            Du kannst die Anzeige anpassen und unter „Art &amp; Preis“ wieder veröffentlichen, sofern sie
            den Regeln entspricht.
          </p>
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          {error}
        </div>
      )}
      <CreateListingForm
        key={listing.id}
        mode="edit"
        listingId={listing.id}
        initialListing={listing}
        categories={categories}
        onSuccess={(listingId) => navigate(`/marktplatz/${listingId}`)}
        onCancel={() => navigate(`/marktplatz/${listing.id}`)}
      />
    </div>
  );
}

export default EditListingPage;
