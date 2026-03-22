import { supabase } from './client';
import type { Database } from './database.types';
import type {
  CreateListingInput,
  MarketplaceListingFilters,
  MarketplaceListingWithDetails,
} from '../types/marketplace';

const BUCKET = 'marketplace-listing-images';

export type MarketplaceListingRow = Database['public']['Tables']['marketplace_listings']['Row'];

export function getMarketplaceImagePublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getMarketplaceCategories(): Promise<{
  data: Database['public']['Tables']['marketplace_categories']['Row'][];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('marketplace_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data || [], error: null };
}

function mapListingRow(
  row: Record<string, unknown>,
  seller?: MarketplaceListingWithDetails['seller']
): MarketplaceListingWithDetails {
  const cats = row.marketplace_categories as
    | { id: string; name: string; slug: string }
    | null
    | undefined;
  const imgs = row.marketplace_images as
    | { id: string; storage_path: string; sort_order: number }[]
    | null
    | undefined;

  const {
    marketplace_categories: _c,
    marketplace_images: _i,
    ...rest
  } = row;

  return {
    ...(rest as MarketplaceListingRow),
    category: cats ? { id: cats.id, name: cats.name, slug: cats.slug } : null,
    images: imgs || [],
    seller: seller ?? null,
  };
}

export async function listMarketplaceListings(
  filters: MarketplaceListingFilters = {}
): Promise<{ data: MarketplaceListingWithDetails[]; error: string | null }> {
  const nowIso = new Date().toISOString();

  let q = supabase
    .from('marketplace_listings')
    .select(
      `
      *,
      marketplace_categories ( id, name, slug ),
      marketplace_images ( id, storage_path, sort_order )
    `
    )
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

  if (filters.categoryId) {
    q = q.eq('category_id', filters.categoryId);
  }
  if (filters.listingType) {
    q = q.eq('listing_type', filters.listingType);
  }
  if (filters.locationZip?.trim()) {
    q = q.ilike('location_zip', `%${filters.locationZip.trim()}%`);
  }
  if (filters.locationCity?.trim()) {
    q = q.ilike('location_city', `%${filters.locationCity.trim()}%`);
  }
  if (filters.priceMin != null) {
    q = q.gte('price', filters.priceMin);
  }
  if (filters.priceMax != null) {
    q = q.lte('price', filters.priceMax);
  }

  const sort = filters.sort ?? 'newest';
  if (sort === 'newest') {
    q = q.order('created_at', { ascending: false });
  } else if (sort === 'price_asc') {
    q = q.order('price', { ascending: true, nullsFirst: false });
  } else {
    q = q.order('price', { ascending: false, nullsFirst: true });
  }

  const { data, error } = await q;

  if (error) {
    console.error('listMarketplaceListings', error);
    return { data: [], error: error.message };
  }

  const rows = (data || []) as Record<string, unknown>[];
  return {
    data: rows.map((r) => mapListingRow(r)),
    error: null,
  };
}

export async function getMarketplaceListingById(
  id: string
): Promise<{ data: MarketplaceListingWithDetails | null; error: string | null }> {
  const nowIso = new Date().toISOString();

  const { data: row, error } = await supabase
    .from('marketplace_listings')
    .select(
      `
      *,
      marketplace_categories ( id, name, slug ),
      marketplace_images ( id, storage_path, sort_order )
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }
  if (!row) {
    return { data: null, error: null };
  }

  const r = row as Record<string, unknown>;
  const isPublicActive =
    r.status === 'active' &&
    (r.expires_at == null || (typeof r.expires_at === 'string' && r.expires_at > nowIso));

  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  const isOwner = uid && r.user_id === uid;

  if (!isPublicActive && !isOwner) {
    return { data: null, error: null };
  }

  const { data: seller } = await supabase
    .from('users')
    .select('id, first_name, last_name, profile_photo_url, user_type')
    .eq('id', r.user_id as string)
    .maybeSingle();

  return {
    data: mapListingRow(r, seller),
    error: null,
  };
}

export async function incrementListingView(listingId: string): Promise<void> {
  await supabase.rpc('increment_marketplace_listing_view', {
    p_listing_id: listingId,
  });
}

export async function createMarketplaceListing(
  userId: string,
  input: CreateListingInput
): Promise<{ data: MarketplaceListingRow | null; error: string | null }> {
  const insert: Database['public']['Tables']['marketplace_listings']['Insert'] = {
    user_id: userId,
    category_id: input.category_id,
    title: input.title.trim(),
    description: input.description.trim(),
    price_type: input.price_type,
    listing_type: input.listing_type,
    status: input.status,
    location_city: input.location_city ?? null,
    location_zip: input.location_zip ?? null,
    condition: input.condition ?? null,
    suitable_for: input.suitable_for ?? [],
    price:
      input.price_type === 'kostenlos' || input.listing_type === 'verschenke'
        ? null
        : input.price ?? null,
    expires_at: input.expires_at ?? null,
  };

  const { data, error } = await supabase.from('marketplace_listings').insert(insert).select().single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateMarketplaceListing(
  listingId: string,
  userId: string,
  patch: Partial<CreateListingInput> & { status?: MarketplaceListingRow['status'] }
): Promise<{ error: string | null }> {
  const update: Database['public']['Tables']['marketplace_listings']['Update'] = {};

  if (patch.title != null) update.title = patch.title.trim();
  if (patch.description != null) update.description = patch.description.trim();
  if (patch.category_id != null) update.category_id = patch.category_id;
  if (patch.price_type != null) update.price_type = patch.price_type;
  if (patch.listing_type != null) update.listing_type = patch.listing_type;
  if (patch.status != null) {
    update.status = patch.status;
    if (patch.status === 'active') {
      update.admin_deactivation_reason = null;
      update.admin_deactivated_at = null;
      update.admin_deactivated_by = null;
    }
  }
  if (patch.location_city !== undefined) update.location_city = patch.location_city;
  if (patch.location_zip !== undefined) update.location_zip = patch.location_zip;
  if (patch.condition !== undefined) update.condition = patch.condition;
  if (patch.suitable_for != null) update.suitable_for = patch.suitable_for;
  if (patch.expires_at !== undefined) update.expires_at = patch.expires_at;
  if (patch.price !== undefined) {
    const pt = patch.price_type;
    const lt = patch.listing_type;
    update.price =
      pt === 'kostenlos' || lt === 'verschenke' ? null : (patch.price ?? null);
  }

  const { error } = await supabase
    .from('marketplace_listings')
    .update(update)
    .eq('id', listingId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}

export async function deleteMarketplaceListing(
  listingId: string,
  userId: string
): Promise<{ error: string | null }> {
  const { data: imgs, error: imgErr } = await supabase
    .from('marketplace_images')
    .select('storage_path')
    .eq('listing_id', listingId);

  if (imgErr) {
    return { error: imgErr.message };
  }

  const paths = (imgs || []).map((i) => i.storage_path).filter(Boolean);
  if (paths.length > 0) {
    const { error: stErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (stErr) {
      console.warn('Storage remove marketplace images:', stErr);
    }
  }

  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}

export async function uploadMarketplaceListingImages(
  userId: string,
  listingId: string,
  files: File[]
): Promise<{ error: string | null }> {
  if (files.length === 0) return { error: null };

  const { data: maxRow } = await supabase
    .from('marketplace_images')
    .select('sort_order')
    .eq('listing_id', listingId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  let orderBase = (maxRow?.sort_order ?? -1) + 1;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${listingId}/${crypto.randomUUID()}-${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      return { error: upErr.message };
    }

    const { error: insErr } = await supabase.from('marketplace_images').insert({
      listing_id: listingId,
      storage_path: path,
      sort_order: orderBase + i,
    });
    if (insErr) {
      return { error: insErr.message };
    }
  }
  return { error: null };
}

/** Ein Bild löschen (nur wenn Listing dem Nutzer gehört). */
export async function deleteMarketplaceListingImage(
  imageId: string,
  userId: string
): Promise<{ error: string | null }> {
  const { data: img, error: imgErr } = await supabase
    .from('marketplace_images')
    .select('id, listing_id, storage_path')
    .eq('id', imageId)
    .maybeSingle();

  if (imgErr) return { error: imgErr.message };
  if (!img) return { error: 'Bild nicht gefunden.' };

  const { data: listing, error: listErr } = await supabase
    .from('marketplace_listings')
    .select('user_id')
    .eq('id', img.listing_id)
    .maybeSingle();

  if (listErr) return { error: listErr.message };
  if (!listing || listing.user_id !== userId) {
    return { error: 'Keine Berechtigung.' };
  }

  const { error: stErr } = await supabase.storage.from(BUCKET).remove([img.storage_path]);
  if (stErr) {
    console.warn('Storage remove marketplace image:', stErr);
  }

  const { error: delErr } = await supabase.from('marketplace_images').delete().eq('id', imageId);
  return { error: delErr?.message ?? null };
}

export async function listMyMarketplaceListings(userId: string): Promise<{
  data: MarketplaceListingWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(
      `
      *,
      marketplace_categories ( id, name, slug ),
      marketplace_images ( id, storage_path, sort_order )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }
  const rows = (data || []) as Record<string, unknown>[];
  return { data: rows.map((r) => mapListingRow(r)), error: null };
}

export async function getFavoriteListingIds(userId: string): Promise<{
  data: Set<string>;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('marketplace_favorites')
    .select('listing_id')
    .eq('user_id', userId);

  if (error) {
    return { data: new Set(), error: error.message };
  }
  return {
    data: new Set((data || []).map((r) => r.listing_id)),
    error: null,
  };
}

export type MarketplaceListingNoticeRow =
  Database['public']['Tables']['marketplace_listing_notices']['Row'];

export async function getMarketplaceListingNotices(userId: string): Promise<{
  data: MarketplaceListingNoticeRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('marketplace_listing_notices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function getUnreadMarketplaceListingNotices(userId: string): Promise<{
  data: MarketplaceListingNoticeRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('marketplace_listing_notices')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function markMarketplaceListingNoticeRead(
  noticeId: string,
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('marketplace_listing_notices')
    .update({ read_at: new Date().toISOString() })
    .eq('id', noticeId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}

export async function toggleMarketplaceFavorite(
  userId: string,
  listingId: string,
  isFavorite: boolean
): Promise<{ error: string | null }> {
  if (isFavorite) {
    const { error } = await supabase.from('marketplace_favorites').insert({
      user_id: userId,
      listing_id: listingId,
    });
    if (error && !error.message.includes('duplicate')) {
      return { error: error.message };
    }
    return { error: null };
  }

  const { error } = await supabase
    .from('marketplace_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  return { error: error?.message ?? null };
}
