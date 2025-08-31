import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { supabase } from './client';

// Admin client with service role key for elevated permissions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// DETAILED Debug logging for environment variables
console.log('[Admin Client] DETAILED Environment check:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl);
console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY length:', serviceRoleKey?.length || 0);
console.log('- All VITE_ env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('[Admin Client] Environment check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!serviceRoleKey,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
  keyPreview: serviceRoleKey ? `${serviceRoleKey.substring(0, 10)}...` : 'missing'
});

// Create admin client with service role key if available, otherwise use regular client
export const adminSupabase = serviceRoleKey && supabaseUrl
  ? (() => {
      console.log('[Admin Client] Using real Supabase client with Service Role Key');
      return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    })()
  : (() => {
      console.warn('[Admin Client] Service Role Key not found - using regular client for read access');
      // Use regular client for read operations, but with limited admin capabilities
      return {
        // For read operations, use the regular client
        from: (table: string) => {
          console.log(`[Admin Client] Using regular client for table: ${table}`);
          return supabase.from(table);
        },
        // For RPC calls, provide mock responses
        rpc: async (functionName: string, params?: any) => {
          console.warn(`[DEV] Mock RPC call: ${functionName}`, params);
          
          // Provide mock data for different RPC functions
          switch (functionName) {
            case 'get_user_management_stats':
              return {
                data: {
                  total_users: 3,
                  total_owners: 2,
                  total_caretakers: 1,
                  new_users_today: 0,
                  new_users_this_week: 3,
                  new_users_this_month: 3,
                  active_users_today: 1,
                  active_users_this_week: 2,
                  suspended_users: 0,
                  verified_caretakers: 0,
                  unverified_caretakers: 1,
                  premium_subscribers: 0,
                  trial_users: 3
                },
                error: null
              };
            case 'get_conversation_stats':
              return {
                data: {
                  total_conversations: 1856,
                  total_messages: 12743,
                  conversations_today: 23,
                  messages_today: 156
                },
                error: null
              };
            case 'get_revenue_stats':
              return {
                data: {
                  total_revenue: 25750.50,
                  revenue_this_month: 3250.75
                },
                error: null
              };
            default:
              return { data: null, error: { message: `Mock RPC: ${functionName} not implemented` } };
          }
        }
      } as any;
    })();

// Type definitions for admin operations
export interface AdminUserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_type: 'owner' | 'caretaker';
  city?: string;
  plz?: string;
  street?: string;
  created_at: string;
  updated_at: string;
  is_suspended: boolean;
  suspension_reason?: string;
  last_login_at?: string;
  login_count: number;
  profile_completed: boolean;
  subscription_status: 'none' | 'trial' | 'active' | 'cancelled' | 'expired';
  subscription_plan?: string;
  subscription_expires_at?: string;
  is_admin?: boolean;
  admin_role?: 'super_admin' | 'admin' | 'moderator' | 'support' | null;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  // Erweiterte Felder für vollständige Daten
  profile_picture?: string;
  date_of_birth?: string;
  gender?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  // Caretaker-spezifische Felder
  caretaker_profile?: {
    bio?: string;
    services?: any;
    hourly_rate?: number;
    availability?: any;
    experience_years?: number;
    is_verified?: boolean;
    rating?: number;
    review_count?: number;
    animal_types?: string[];
    prices?: any;
    service_radius?: number;
    home_photos?: string[];
    qualifications?: string[];
    experience_description?: string;
    short_about_me?: string;
    long_about_me?: string;
    languages?: string[];
    is_commercial?: boolean;
    company_name?: string;
    tax_number?: string;
    vat_id?: string;
    short_term_available?: boolean;
    overnight_availability?: any;
    services_with_categories?: any;
  };
  // Owner-spezifische Felder
  owner_profile?: {
    pets?: Array<{
      id: string;
      name: string;
      type: string;
      breed?: string;
      age?: number;
      weight?: number;
      photo_url?: string;
      description?: string;
      gender?: string;
      neutered?: boolean;
    }>;
    preferences?: {
      services: string[];
      other_services?: string;
      vet_info?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      care_instructions?: string;
      share_settings?: any;
    };
  };
}

export interface AdminCaretakerProfile {
  id: string;
  user_id: string;
  hourly_rate?: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  experience_years?: number;
  services: string[];
  about_me?: string;
  languages: string[];
  is_commercial: boolean;
  short_term_available?: boolean;
  business_name?: string;
  tax_id?: string;
  total_earnings: number;
  active_bookings: number;
  total_bookings: number;
  last_active_at?: string;
}

export interface AdminOwnerProfile {
  id: string;
  user_id: string;
  total_spent: number;
  active_conversations: number;
  total_conversations: number;
  favorite_caretakers_count: number;
  pets_count: number;
  last_search_at?: string;
}

export interface AdminUserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminSupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface AdminUserNote {
  id: string;
  user_id: string;
  admin_id: string;
  admin_name: string;
  note: string;
  note_type: 'general' | 'warning' | 'suspension' | 'positive';
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminReportedContent {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  content_type: 'message' | 'profile' | 'review' | 'image';
  content_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_note?: string;
  created_at: string;
}

export interface UserSearchResult {
  users: AdminUserDetails[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserSearchFilters {
  searchTerm?: string;
  userType?: 'owner' | 'caretaker';
  subscriptionStatus?: string;
  city?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  hasActiveSubscription?: boolean;
  sortBy?: 'created_at' | 'last_login_at' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ModerationFilters {
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  contentType?: 'message' | 'profile' | 'review' | 'image';
  reason?: string;
  reportedDateFrom?: string;
  reportedDateTo?: string;
  sortBy?: 'created_at' | 'status' | 'content_type';
  sortOrder?: 'asc' | 'desc';
}

export interface ModerationSearchResult {
  reports: AdminReportedContent[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}