import { supabase } from './client';

export interface AdvertisementFormat {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  ad_type: string;
  placement: string;
  function_description: string;
  is_active: boolean;
  created_at: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  cta_text: string;
  ad_type: 'search_card' | 'profile_banner' | 'homepage_banner' | 'category_banner';
  format_id?: string;
  target_pet_types?: string[];
  target_locations?: string[];
  target_subscription_types?: string[];
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  priority: number;
  max_impressions?: number;
  current_impressions: number;
  max_clicks?: number;
  current_clicks: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Format-Informationen (aus View)
  format_name?: string;
  display_width?: number;
  display_height?: number;
  placement?: string;
  function_description?: string;
}

export interface AdvertisementImpression {
  id: string;
  advertisement_id: string;
  user_id?: string;
  page_type: string;
  user_pet_types?: string[];
  user_location?: string;
  user_subscription_type?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdvertisementClick {
  id: string;
  advertisement_id: string;
  impression_id?: string;
  user_id?: string;
  page_type: string;
  user_pet_types?: string[];
  user_location?: string;
  user_subscription_type?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface TargetingOptions {
  petTypes?: string[];
  location?: string;
  subscriptionType?: 'free' | 'premium';
}

class AdvertisementService {
  /**
   * Get targeted advertisements for a specific ad type and user context
   */
  async getTargetedAdvertisements(
    adType: 'search_card' | 'profile_banner',
    targetingOptions: TargetingOptions = {},
    limit: number = 10
  ): Promise<{ data: Advertisement[] | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_targeted_advertisements', {
        p_ad_type: adType,
        p_user_pet_types: targetingOptions.petTypes || [],
        p_user_location: targetingOptions.location || null,
        p_user_subscription_type: targetingOptions.subscriptionType || 'free',
        p_limit: limit
      });

      return { data, error };
    } catch (error) {
      console.error('Error fetching targeted advertisements:', error);
      return { data: null, error };
    }
  }

  /**
   * Track an advertisement impression
   */
  async trackImpression(
    advertisementId: string,
    pageType: string,
    userContext: {
      petTypes?: string[];
      location?: string;
      subscriptionType?: string;
    } = {}
  ): Promise<{ data: any; error: any }> {
    try {
      // Get user agent and other client info
      const userAgent = navigator.userAgent;
      
      const { data, error } = await supabase
        .from('advertisement_impressions')
        .insert({
          advertisement_id: advertisementId,
          page_type: pageType,
          user_pet_types: userContext.petTypes || [],
          user_location: userContext.location || null,
          user_subscription_type: userContext.subscriptionType || 'free',
          user_agent: userAgent
        })
        .select()
        .single();

      // Update impression count
      if (!error) {
        await supabase.rpc('increment_advertisement_impressions', {
          ad_id: advertisementId
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Error tracking impression:', error);
      return { data: null, error };
    }
  }

  /**
   * Track an advertisement click
   */
  async trackClick(
    advertisementId: string,
    pageType: string,
    impressionId?: string,
    userContext: {
      petTypes?: string[];
      location?: string;
      subscriptionType?: string;
    } = {}
  ): Promise<{ data: any; error: any }> {
    try {
      const userAgent = navigator.userAgent;
      
      const { data, error } = await supabase
        .from('advertisement_clicks')
        .insert({
          advertisement_id: advertisementId,
          impression_id: impressionId || null,
          page_type: pageType,
          user_pet_types: userContext.petTypes || [],
          user_location: userContext.location || null,
          user_subscription_type: userContext.subscriptionType || 'free',
          user_agent: userAgent
        })
        .select()
        .single();

      // Update click count
      if (!error) {
        await supabase.rpc('increment_advertisement_clicks', {
          ad_id: advertisementId
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Error tracking click:', error);
      return { data: null, error };
    }
  }

  /**
   * Admin: Get all advertisements with format information
   */
  async getAllAdvertisements(): Promise<{ data: Advertisement[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('advertisements_with_formats')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching all advertisements:', error);
      return { data: null, error };
    }
  }

  /**
   * Admin: Get all advertisement formats
   */
  async getAdvertisementFormats(): Promise<{ data: AdvertisementFormat[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('advertisement_formats')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error fetching advertisement formats:', error);
      return { data: null, error };
    }
  }

  /**
   * Admin: Create a new advertisement
   */
  async createAdvertisement(
    advertisement: Omit<Advertisement, 'id' | 'created_at' | 'updated_at' | 'current_impressions' | 'current_clicks'>
  ): Promise<{ data: Advertisement | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .insert(advertisement)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating advertisement:', error);
      return { data: null, error };
    }
  }

  /**
   * Admin: Update an advertisement
   */
  async updateAdvertisement(
    id: string,
    updates: Partial<Advertisement>
  ): Promise<{ data: Advertisement | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating advertisement:', error);
      return { data: null, error };
    }
  }

  /**
   * Admin: Delete an advertisement
   */
  async deleteAdvertisement(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      return { error };
    }
  }

  /**
   * Admin: Get advertisement analytics
   */
  async getAdvertisementAnalytics(advertisementId?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase
        .from('advertisements')
        .select(`
          id,
          title,
          ad_type,
          current_impressions,
          current_clicks,
          max_impressions,
          max_clicks,
          created_at,
          is_active
        `);

      if (advertisementId) {
        query = query.eq('id', advertisementId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      // Calculate CTR (Click-Through Rate) for each ad
      const analyticsData = data?.map(ad => ({
        ...ad,
        ctr: ad.current_impressions > 0 ? (ad.current_clicks / ad.current_impressions * 100).toFixed(2) : '0.00',
        impression_rate: ad.max_impressions ? (ad.current_impressions / ad.max_impressions * 100).toFixed(2) : null,
        click_rate: ad.max_clicks ? (ad.current_clicks / ad.max_clicks * 100).toFixed(2) : null
      }));

      return { data: analyticsData, error };
    } catch (error) {
      console.error('Error fetching advertisement analytics:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's pet types from their profile for targeting
   */
  async getUserPetTypes(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('type')
        .eq('owner_id', userId);

      if (error || !data) {
        return [];
      }

      // Return unique pet types
      return [...new Set(data.map(pet => pet.type).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching user pet types:', error);
      return [];
    }
  }

  /**
   * Get user's location from their profile for targeting
   */
  async getUserLocation(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('location')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.location;
    } catch (error) {
      console.error('Error fetching user location:', error);
      return null;
    }
  }
}

export const advertisementService = new AdvertisementService();
export default advertisementService;