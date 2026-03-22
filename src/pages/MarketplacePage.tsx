import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MarketplaceCategoryBrowser from '../components/marketplace/MarketplaceCategoryBrowser';
import MarketplaceFilters, {
  marketplaceFiltersDefaultState,
  type MarketplaceFiltersState,
} from '../components/marketplace/MarketplaceFilters';
import MarketplaceListingCard from '../components/marketplace/MarketplaceListingCard';
import { useAuth } from '../lib/auth/AuthContext';
import {
  getFavoriteListingIds,
  getMarketplaceCategories,
  listMarketplaceListings,
  toggleMarketplaceFavorite,
} from '../lib/supabase/marketplaceService';
import type { MarketplaceListingFilters, MarketplaceListingWithDetails } from '../lib/types/marketplace';

function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catSlug = searchParams.get('kategorie') || '';

  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getMarketplaceCategories>>['data']>(
    []
  );
  const [listings, setListings] = useState<MarketplaceListingWithDetails[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDraft, setFilterDraft] = useState<MarketplaceFiltersState>(marketplaceFiltersDefaultState);
  const [appliedFilters, setAppliedFilters] = useState<MarketplaceFiltersState>(marketplaceFiltersDefaultState);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const categoryIdFromSlug = useMemo(() => {
    const c = categories.find((x) => x.slug === catSlug);
    return c?.id;
  }, [categories, catSlug]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: cats, error: cErr } = await getMarketplaceCategories();
    if (cErr) setError(cErr);
    setCategories(cats);

    const rawMin = appliedFilters.priceMin ? parseFloat(appliedFilters.priceMin.replace(',', '.')) : NaN;
    const rawMax = appliedFilters.priceMax ? parseFloat(appliedFilters.priceMax.replace(',', '.')) : NaN;

    const apiFilters: MarketplaceListingFilters = {
      categoryId: categoryIdFromSlug,
      listingType: appliedFilters.listingType
        ? (appliedFilters.listingType as MarketplaceListingFilters['listingType'])
        : undefined,
      locationZip: appliedFilters.locationZip || undefined,
      locationCity: appliedFilters.locationCity || undefined,
      priceMin: Number.isFinite(rawMin) ? rawMin : undefined,
      priceMax: Number.isFinite(rawMax) ? rawMax : undefined,
      sort: appliedFilters.sort,
    };

    const { data: list, error: lErr } = await listMarketplaceListings(apiFilters);
    if (lErr) setError(lErr);
    setListings(list);

    if (user?.id) {
      const { data: favSet } = await getFavoriteListingIds(user.id);
      setFavorites(favSet);
    } else {
      setFavorites(new Set());
    }

    setLoading(false);
  }, [user?.id, categoryIdFromSlug, appliedFilters]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleFavorite = async (listingId: string) => {
    if (!user?.id) return;
    const next = !favorites.has(listingId);
    const { error: err } = await toggleMarketplaceFavorite(user.id, listingId, next);
    if (err) {
      setError(err);
      return;
    }
    setFavorites((prev) => {
      const n = new Set(prev);
      if (next) n.add(listingId);
      else n.delete(listingId);
      return n;
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filterDraft);
  };

  const handleResetFilters = () => {
    setFilterDraft(marketplaceFiltersDefaultState);
    setAppliedFilters(marketplaceFiltersDefaultState);
    navigate('/marktplatz');
  };

  const selectedCategoryName = catSlug ? categories.find((c) => c.slug === catSlug)?.name : null;

  const extraFilterCount = [
    appliedFilters.listingType,
    appliedFilters.locationZip,
    appliedFilters.locationCity,
    appliedFilters.priceMin,
    appliedFilters.priceMax,
  ].filter(Boolean).length;
  const sortIsNonDefault = appliedFilters.sort !== 'newest';
  const activeExtraFilters = extraFilterCount + (sortIsNonDefault ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Zubehör-Marktplatz</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Leinen, Betten, Futter, Spielzeug und mehr — von der Community.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user && (
              <Link to="/marktplatz/meine" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                Meine Anzeigen
              </Link>
            )}
            <Link
              to={user ? '/marktplatz/neu' : `/anmelden?redirect=${encodeURIComponent('/marktplatz/neu')}`}
              className="btn btn-primary inline-flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" aria-hidden />
              Anzeige erstellen
            </Link>
          </div>
        </div>

        {/* Layout wie SearchPage: Filter links (lg), Ergebnisse rechts */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full flex-shrink-0 lg:w-80">
            <div className="sticky top-8 space-y-4">
              {/* Eigene Box: Kategorie */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-lg font-semibold text-gray-900">Kategorie</h2>
                <p className="mb-3 text-xs text-gray-500">Wähle eine Rubrik für deine Suche.</p>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Lade Kategorien…</p>
                ) : (
                  <div className="max-h-[min(60vh,22rem)] overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]">
                    <MarketplaceCategoryBrowser
                      categories={categories}
                      selectedSlug={catSlug || null}
                      variant="sidebar"
                    />
                  </div>
                )}
              </div>

              {/* Ausklappbare Box: weitere Filter */}
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  id="mp-filters-toggle"
                  aria-expanded={filtersExpanded}
                  aria-controls="mp-filters-panel"
                  onClick={() => setFiltersExpanded((o) => !o)}
                  className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-gray-50/80"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <SlidersHorizontal className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-gray-900">Weitere Filter</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {activeExtraFilters > 0
                        ? `${activeExtraFilters} aktiv — Ort, Preis, Angebotstyp …`
                        : 'Ausklappen für Ort, Preis, Sortierung & mehr'}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200',
                      filtersExpanded && 'rotate-180'
                    )}
                    aria-hidden
                  />
                </button>

                <div
                  id="mp-filters-panel"
                  role="region"
                  aria-labelledby="mp-filters-toggle"
                  hidden={!filtersExpanded}
                  className="border-t border-gray-100"
                >
                  <div className="p-5 pt-4">
                    <MarketplaceFilters
                      value={filterDraft}
                      onChange={setFilterDraft}
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                      layout="search"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              {!loading && !error && (
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    {selectedCategoryName ? `Anzeigen: ${selectedCategoryName}` : 'Alle Anzeigen'}
                  </h2>
                  <p className="text-gray-600">
                    {listings.length} {listings.length === 1 ? 'Treffer' : 'Treffer'}
                  </p>
                </div>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-b-transparent" />
                  <span>Lade Anzeigen…</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>
            ) : listings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg font-medium text-gray-700">Keine Anzeigen gefunden.</p>
                <p className="mt-1 text-sm text-gray-500">Versuche andere Filter oder eine andere Kategorie.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <li key={listing.id}>
                    <MarketplaceListingCard
                      listing={listing}
                      showFavorite={!!user}
                      isFavorite={favorites.has(listing.id)}
                      onToggleFavorite={() => void handleToggleFavorite(listing.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketplacePage;
