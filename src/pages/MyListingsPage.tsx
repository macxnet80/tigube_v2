import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, CheckCircle, Pencil } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import ListingStatusBadge from '../components/marketplace/ListingStatusBadge';
import { useAuth } from '../lib/auth/AuthContext';
import {
  deleteMarketplaceListing,
  getMarketplaceImagePublicUrl,
  getUnreadMarketplaceListingNotices,
  listMyMarketplaceListings,
  markMarketplaceListingNoticeRead,
  updateMarketplaceListing,
} from '../lib/supabase/marketplaceService';
import type { MarketplaceListingNoticeRow } from '../lib/supabase/marketplaceService';
import type { MarketplaceListingWithDetails } from '../lib/types/marketplace';

function formatPriceShort(listing: MarketplaceListingWithDetails): string {
  if (listing.listing_type === 'verschenke' || listing.price_type === 'kostenlos') return '—';
  if (listing.price != null) return `${Number(listing.price).toFixed(2)} €`;
  return 'VB';
}

function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<MarketplaceListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notices, setNotices] = useState<MarketplaceListingNoticeRow[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const [listRes, noticeRes] = await Promise.all([
      listMyMarketplaceListings(user.id),
      getUnreadMarketplaceListingNotices(user.id),
    ]);
    if (listRes.error) setError(listRes.error);
    setItems(listRes.data);
    if (!noticeRes.error) setNotices(noticeRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    void load();
  }, [authLoading, user?.id, load]);

  const markSold = async (id: string) => {
    if (!user) return;
    setBusyId(id);
    const { error: err } = await updateMarketplaceListing(id, user.id, { status: 'sold' });
    setBusyId(null);
    if (err) {
      setError(err);
      return;
    }
    void load();
  };

  const dismissNotice = async (noticeId: string) => {
    if (!user) return;
    const { error: err } = await markMarketplaceListingNoticeRead(noticeId, user.id);
    if (err) {
      setError(err);
      return;
    }
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

  const remove = async (id: string) => {
    if (!user || !confirm('Anzeige wirklich löschen?')) return;
    setBusyId(id);
    const { error: err } = await deleteMarketplaceListing(id, user.id);
    setBusyId(null);
    if (err) {
      setError(err);
      return;
    }
    void load();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meine Anzeigen</h1>
          <p className="mt-1 text-gray-600">Verwalte deine Marktplatz-Inserate.</p>
        </div>
        <Link to="/marktplatz/neu" className="btn btn-primary">
          Neue Anzeige
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>
      )}

      {notices.length > 0 && (
        <div className="mb-6 space-y-3" role="region" aria-label="Hinweise zum Marktplatz">
          {notices.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <p className="font-semibold">
                {n.notice_type === 'listing_deleted'
                  ? 'Anzeige entfernt'
                  : 'Anzeige deaktiviert'}{' '}
                {n.listing_title_snapshot ? `„${n.listing_title_snapshot}“` : ''}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-amber-900">{n.reason}</p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-amber-950 underline hover:no-underline"
                onClick={() => void dismissNotice(n.id)}
              >
                Hinweis gelesen / ausblenden
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-12 text-center text-gray-600">
          Du hast noch keine Anzeigen.{' '}
          <Link to="/marktplatz/neu" className="text-primary-600 hover:underline">
            Jetzt erstellen
          </Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((listing) => {
            const img = listing.images?.sort((a, b) => a.sort_order - b.sort_order)[0];
            const imgUrl = img ? getMarketplaceImagePublicUrl(img.storage_path) : null;
            return (
              <li
                key={listing.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row"
              >
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-32">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">Kein Bild</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/marktplatz/${listing.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-700"
                    >
                      {listing.title}
                    </Link>
                    <ListingStatusBadge
                      status={
                        listing.status as
                          | 'draft'
                          | 'active'
                          | 'sold'
                          | 'expired'
                          | 'inactive'
                      }
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {listing.category?.name ?? '—'} · {formatPriceShort(listing)}
                  </p>
                  {listing.status === 'inactive' && listing.admin_deactivation_reason && (
                    <p className="mt-2 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-900">
                      <span className="font-medium">Grund: </span>
                      {listing.admin_deactivation_reason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                  <Link
                    to={`/marktplatz/bearbeiten/${listing.id}`}
                    className="btn btn-outline px-3 py-1.5 text-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Bearbeiten
                  </Link>
                  {listing.status === 'active' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      onClick={() => void markSold(listing.id)}
                      disabled={busyId === listing.id}
                      isLoading={busyId === listing.id}
                    >
                      Als verkauft
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => void remove(listing.id)}
                    disabled={busyId === listing.id}
                  >
                    Löschen
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MyListingsPage;
