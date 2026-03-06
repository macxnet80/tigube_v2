import { supabase } from './client';

export type HelpResourceType = 'tutorial' | 'pdf' | 'video';

export interface HelpResource {
    id: string;
    title: string;
    description: string | null;
    type: HelpResourceType;
    category: string | null;
    url: string;
    thumbnail_url: string | null;
    sort_order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface GetHelpResourcesOptions {
    type?: HelpResourceType | 'all';
    search?: string;
    limit?: number;
    offset?: number;
}

export async function getHelpResources(options: GetHelpResourcesOptions = {}) {
    const { type = 'all', limit = 20, offset = 0, search } = options;

    // Create a base query
    let query = (supabase as any)
        .from('help_resources')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Apply type filter if not 'all'
    if (type !== 'all') {
        query = query.eq('type', type);
    }

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
        query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching help resources:', error);
        return { data: null as HelpResource[] | null, error: error.message };
    }

    return { data: data as HelpResource[], error: null };
}
