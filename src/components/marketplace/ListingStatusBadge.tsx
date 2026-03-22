import type { MarketplaceListingStatus } from '../../lib/types/marketplace';

interface ListingStatusBadgeProps {
  status: MarketplaceListingStatus;
  className?: string;
}

const LABELS: Record<MarketplaceListingStatus, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  sold: 'Verkauft',
  expired: 'Abgelaufen',
  inactive: 'Deaktiviert',
};

const STYLES: Record<MarketplaceListingStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-emerald-100 text-emerald-800',
  sold: 'bg-slate-200 text-slate-700',
  expired: 'bg-amber-100 text-amber-900',
  inactive: 'bg-red-100 text-red-900',
};

function ListingStatusBadge({ status, className = '' }: ListingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]} ${className}`}
    >
      {LABELS[status]}
    </span>
  );
}

export default ListingStatusBadge;
