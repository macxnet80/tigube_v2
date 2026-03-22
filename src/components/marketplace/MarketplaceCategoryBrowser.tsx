import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Link as LinkIcon,
  Armchair,
  ToyBrick,
  Cookie,
  Sparkles,
  Package,
  Shirt,
  Fence,
  Fish,
  Warehouse,
  BookOpen,
  CircleDot,
} from 'lucide-react';
import type { MarketplaceCategoryRow } from '../../lib/types/marketplace';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Link: LinkIcon,
  Armchair,
  ToyBrick,
  Cookie,
  Sparkles,
  Package,
  Shirt,
  Fence,
  Fish,
  Warehouse,
  BookOpen,
  CircleDot,
};

function resolveIcon(iconName: string | null): LucideIcon {
  if (!iconName) return LayoutGrid;
  return CATEGORY_ICONS[iconName] ?? LayoutGrid;
}

interface MarketplaceCategoryBrowserProps {
  categories: MarketplaceCategoryRow[];
  selectedSlug?: string | null;
  basePath?: string;
  /** 'grid' = bisherige Kacheln (default), 'sidebar' = vertikale Liste */
  variant?: 'grid' | 'sidebar';
}

function MarketplaceCategoryBrowser({
  categories,
  selectedSlug,
  basePath = '/marktplatz',
  variant = 'grid',
}: MarketplaceCategoryBrowserProps) {
  if (variant === 'sidebar') {
    return (
      <nav aria-label="Kategorien">
        <Link
          to={basePath}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            !selectedSlug
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0 text-primary-500" aria-hidden />
          Alle Kategorien
        </Link>
        <div className="mt-1 space-y-0.5">
          {categories.map((cat) => {
            const Icon = resolveIcon(cat.icon_name);
            const active = selectedSlug === cat.slug;
            return (
              <Link
                key={cat.id}
                to={`${basePath}?kategorie=${encodeURIComponent(cat.slug)}`}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-primary-50 font-medium text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary-500' : 'text-gray-400'}`} aria-hidden />
                <span className="leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <Link
        to={basePath}
        className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
          !selectedSlug
            ? 'border-primary-500 bg-primary-50 text-primary-900'
            : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
        }`}
      >
        <LayoutGrid className="mb-2 h-8 w-8 text-primary-600" aria-hidden />
        <span className="text-sm font-medium">Alle</span>
      </Link>
      {categories.map((cat) => {
        const Icon = resolveIcon(cat.icon_name);
        const active = selectedSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            to={`${basePath}?kategorie=${encodeURIComponent(cat.slug)}`}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
              active
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
            }`}
          >
            <Icon className="mb-2 h-8 w-8 text-primary-600" aria-hidden />
            <span className="line-clamp-2 text-sm font-medium leading-tight">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default MarketplaceCategoryBrowser;
