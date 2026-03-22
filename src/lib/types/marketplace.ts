import type { Database } from '../supabase/database.types';

export type MarketplaceListingRow = Database['public']['Tables']['marketplace_listings']['Row'];
export type MarketplaceListingInsert = Database['public']['Tables']['marketplace_listings']['Insert'];
export type MarketplaceListingUpdate = Database['public']['Tables']['marketplace_listings']['Update'];
export type MarketplaceCategoryRow = Database['public']['Tables']['marketplace_categories']['Row'];
export type MarketplaceImageRow = Database['public']['Tables']['marketplace_images']['Row'];

export type MarketplacePriceType = 'kostenlos' | 'festpreis' | 'verhandelbar';
export type MarketplaceListingType = 'biete' | 'suche' | 'verschenke';
export type MarketplaceListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'inactive';
export type MarketplaceCondition = 'neu' | 'wie_neu' | 'gut' | 'akzeptabel';

/** Tierarten nur als Hinweis „geeignet für“ (kein Tierverkauf). */
export const MARKETPLACE_SUITABLE_FOR_OPTIONS = [
  { value: 'hund', label: 'Hund' },
  { value: 'katze', label: 'Katze' },
  { value: 'kleintier', label: 'Kleintier' },
  { value: 'vogel', label: 'Vogel' },
  { value: 'fisch', label: 'Fisch' },
  { value: 'reptil', label: 'Reptil' },
  { value: 'pferd', label: 'Pferd' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const;

export type MarketplaceSuitableFor = (typeof MARKETPLACE_SUITABLE_FOR_OPTIONS)[number]['value'];

export interface MarketplaceCategory extends MarketplaceCategoryRow {}

export interface MarketplaceListingFilters {
  categoryId?: string;
  listingType?: MarketplaceListingType;
  locationZip?: string;
  locationCity?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export interface MarketplaceListingWithDetails extends MarketplaceListingRow {
  category?: Pick<MarketplaceCategoryRow, 'id' | 'name' | 'slug'> | null;
  images?: Pick<MarketplaceImageRow, 'id' | 'storage_path' | 'sort_order'>[];
  seller?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
    user_type: string | null;
  } | null;
}

export interface CreateListingInput {
  category_id: string;
  title: string;
  description: string;
  price_type: MarketplacePriceType;
  listing_type: MarketplaceListingType;
  status: MarketplaceListingStatus;
  location_city?: string | null;
  location_zip?: string | null;
  condition?: MarketplaceCondition | null;
  suitable_for?: string[];
  price?: number | null;
  expires_at?: string | null;
}
