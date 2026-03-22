import { ArrowUpDown, Briefcase, ChevronDown, MapPin } from 'lucide-react';
import Button from '../ui/Button';

export type MarketplaceSortOption = 'newest' | 'price_asc' | 'price_desc';

export interface MarketplaceFiltersState {
  listingType: string;
  locationZip: string;
  locationCity: string;
  priceMin: string;
  priceMax: string;
  sort: MarketplaceSortOption;
}

interface MarketplaceFiltersProps {
  value: MarketplaceFiltersState;
  onChange: (next: MarketplaceFiltersState) => void;
  onApply: () => void;
  /** 'horizontal' = Zeile (default), 'sidebar' = gestapelt vertikal, 'search' = wie Betreuer-Suche (SearchPage) */
  layout?: 'horizontal' | 'sidebar' | 'search';
}

const defaultState: MarketplaceFiltersState = {
  listingType: '',
  locationZip: '',
  locationCity: '',
  priceMin: '',
  priceMax: '',
  sort: 'newest',
};

export const marketplaceFiltersDefaultState = defaultState;

function MarketplaceFilters({
  value,
  onChange,
  onApply,
  onReset,
  layout = 'horizontal',
}: MarketplaceFiltersProps & { onReset: () => void }) {
  const patch = (partial: Partial<MarketplaceFiltersState>) => onChange({ ...value, ...partial });

  if (layout === 'search') {
    const fieldSelect =
      'w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white';
    const fieldInput =
      'w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm';

    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="mp-listing-type" className="block text-sm font-medium text-gray-700 mb-2">
            Angebotstyp
          </label>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              id="mp-listing-type"
              className={fieldSelect}
              value={value.listingType}
              onChange={(e) => patch({ listingType: e.target.value })}
            >
              <option value="">Alle</option>
              <option value="biete">Biete</option>
              <option value="suche">Suche</option>
              <option value="verschenke">Verschenke</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="mp-plz" className="block text-sm font-medium text-gray-700 mb-2">
            PLZ
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="mp-plz"
              type="text"
              inputMode="numeric"
              placeholder="z. B. 10115"
              className={fieldInput}
              value={value.locationZip}
              onChange={(e) => patch({ locationZip: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="mp-city" className="block text-sm font-medium text-gray-700 mb-2">
            Ort
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="mp-city"
              type="text"
              placeholder="Stadt"
              className={fieldInput}
              value={value.locationCity}
              onChange={(e) => patch({ locationCity: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="mp-price-min" className="block text-sm font-medium text-gray-700 mb-2">
            Preis min (€)
          </label>
          <input
            id="mp-price-min"
            type="number"
            min={0}
            step={0.01}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={value.priceMin}
            onChange={(e) => patch({ priceMin: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="mp-price-max" className="block text-sm font-medium text-gray-700 mb-2">
            Preis max (€)
          </label>
          <input
            id="mp-price-max"
            type="number"
            min={0}
            step={0.01}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={value.priceMax}
            onChange={(e) => patch({ priceMax: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="mp-sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sortierung
          </label>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <select
              id="mp-sort"
              className={fieldSelect}
              value={value.sort}
              onChange={(e) => patch({ sort: e.target.value as MarketplaceSortOption })}
            >
              <option value="newest">Neueste</option>
              <option value="price_asc">Niedrigster Preis</option>
              <option value="price_desc">Höchster Preis</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" onClick={onApply}>
            Filter anwenden
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Zurücksetzen
          </Button>
        </div>
      </div>
    );
  }

  if (layout === 'sidebar') {
    return (
      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gray-500">Angebotstyp</span>
          <select
            className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900"
            value={value.listingType}
            onChange={(e) => patch({ listingType: e.target.value })}
          >
            <option value="">Alle</option>
            <option value="biete">Biete</option>
            <option value="suche">Suche</option>
            <option value="verschenke">Verschenke</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gray-500">Ort / PLZ</span>
          <input
            type="text"
            className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900"
            placeholder="Stadt oder PLZ"
            value={value.locationCity || value.locationZip}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d/.test(v)) patch({ locationZip: v, locationCity: '' });
              else patch({ locationCity: v, locationZip: '' });
            }}
          />
        </label>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gray-500">Preis (€)</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900"
              placeholder="Min"
              value={value.priceMin}
              onChange={(e) => patch({ priceMin: e.target.value })}
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900"
              placeholder="Max"
              value={value.priceMax}
              onChange={(e) => patch({ priceMax: e.target.value })}
            />
          </div>
        </div>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gray-500">Sortierung</span>
          <select
            className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900"
            value={value.sort}
            onChange={(e) => patch({ sort: e.target.value as MarketplaceSortOption })}
          >
            <option value="newest">Neueste zuerst</option>
            <option value="price_asc">Niedrigster Preis</option>
            <option value="price_desc">Höchster Preis</option>
          </select>
        </label>

        <div className="flex flex-col gap-2 pt-1">
          <Button type="button" onClick={onApply} className="w-full justify-center">
            Anwenden
          </Button>
          <Button type="button" variant="outline" onClick={onReset} className="w-full justify-center">
            Zurücksetzen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Angebotstyp</span>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            value={value.listingType}
            onChange={(e) => patch({ listingType: e.target.value })}
          >
            <option value="">Alle</option>
            <option value="biete">Biete</option>
            <option value="suche">Suche</option>
            <option value="verschenke">Verschenke</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">PLZ</span>
          <input
            type="text"
            inputMode="numeric"
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            placeholder="z. B. 10"
            value={value.locationZip}
            onChange={(e) => patch({ locationZip: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Ort</span>
          <input
            type="text"
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            placeholder="Stadt"
            value={value.locationCity}
            onChange={(e) => patch({ locationCity: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Preis min (€)</span>
          <input
            type="number"
            min={0}
            step={0.01}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            value={value.priceMin}
            onChange={(e) => patch({ priceMin: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Preis max (€)</span>
          <input
            type="number"
            min={0}
            step={0.01}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            value={value.priceMax}
            onChange={(e) => patch({ priceMax: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Sortierung</span>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            value={value.sort}
            onChange={(e) => patch({ sort: e.target.value as MarketplaceSortOption })}
          >
            <option value="newest">Neueste</option>
            <option value="price_asc">Niedrigster Preis</option>
            <option value="price_desc">Höchster Preis</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={onApply}>
          Filter anwenden
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Zurücksetzen
        </Button>
      </div>
    </div>
  );
}

export default MarketplaceFilters;
