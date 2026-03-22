import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreateListingForm from '../components/marketplace/CreateListingForm';
import { getMarketplaceCategories } from '../lib/supabase/marketplaceService';
import type { MarketplaceCategoryRow } from '../lib/types/marketplace';

function CreateListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MarketplaceCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data, error: err } = await getMarketplaceCategories();
      if (err) setError(err);
      setCategories(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Neue Anzeige</h1>
      <p className="mb-8 text-gray-600">
        Erstelle eine Anzeige für Haustier-Zubehör. Es sind keine Angebote für lebende Tiere erlaubt.
      </p>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>
      )}
      <CreateListingForm
        categories={categories}
        onSuccess={(listingId) => navigate(`/marktplatz/${listingId}`)}
        onCancel={() => navigate('/marktplatz')}
      />
    </div>
  );
}

export default CreateListingPage;
