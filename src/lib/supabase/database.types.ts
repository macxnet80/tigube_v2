export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          attrs: Json | null
          business_type: string | null
          country: string | null
          created: string | null
          email: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_clicks: {
        Row: {
          advertisement_id: string | null
          created_at: string | null
          id: string
          impression_id: string | null
          ip_address: unknown
          page_type: string
          user_agent: string | null
          user_id: string | null
          user_location: string | null
          user_pet_types: string[] | null
          user_subscription_type: string | null
        }
        Insert: {
          advertisement_id?: string | null
          created_at?: string | null
          id?: string
          impression_id?: string | null
          ip_address?: unknown
          page_type: string
          user_agent?: string | null
          user_id?: string | null
          user_location?: string | null
          user_pet_types?: string[] | null
          user_subscription_type?: string | null
        }
        Update: {
          advertisement_id?: string | null
          created_at?: string | null
          id?: string
          impression_id?: string | null
          ip_address?: unknown
          page_type?: string
          user_agent?: string | null
          user_id?: string | null
          user_location?: string | null
          user_pet_types?: string[] | null
          user_subscription_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_clicks_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisement_clicks_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements_with_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisement_clicks_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "advertisement_impressions"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_formats: {
        Row: {
          ad_type: string
          created_at: string | null
          description: string | null
          function_description: string | null
          height: number
          id: string
          is_active: boolean | null
          name: string
          placement: string
          width: number
        }
        Insert: {
          ad_type: string
          created_at?: string | null
          description?: string | null
          function_description?: string | null
          height: number
          id?: string
          is_active?: boolean | null
          name: string
          placement: string
          width: number
        }
        Update: {
          ad_type?: string
          created_at?: string | null
          description?: string | null
          function_description?: string | null
          height?: number
          id?: string
          is_active?: boolean | null
          name?: string
          placement?: string
          width?: number
        }
        Relationships: []
      }
      advertisement_impressions: {
        Row: {
          advertisement_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          page_type: string
          user_agent: string | null
          user_id: string | null
          user_location: string | null
          user_pet_types: string[] | null
          user_subscription_type: string | null
        }
        Insert: {
          advertisement_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          page_type: string
          user_agent?: string | null
          user_id?: string | null
          user_location?: string | null
          user_pet_types?: string[] | null
          user_subscription_type?: string | null
        }
        Update: {
          advertisement_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          page_type?: string
          user_agent?: string | null
          user_id?: string | null
          user_location?: string | null
          user_pet_types?: string[] | null
          user_subscription_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_impressions_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisement_impressions_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements_with_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          ad_type: string
          created_at: string | null
          created_by: string | null
          cta_text: string | null
          current_clicks: number | null
          current_impressions: number | null
          custom_height: number | null
          custom_width: number | null
          description: string | null
          end_date: string | null
          format_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          max_clicks: number | null
          max_impressions: number | null
          priority: number | null
          start_date: string | null
          target_locations: string[] | null
          target_pet_types: string[] | null
          target_subscription_types: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          ad_type: string
          created_at?: string | null
          created_by?: string | null
          cta_text?: string | null
          current_clicks?: number | null
          current_impressions?: number | null
          custom_height?: number | null
          custom_width?: number | null
          description?: string | null
          end_date?: string | null
          format_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          max_clicks?: number | null
          max_impressions?: number | null
          priority?: number | null
          start_date?: string | null
          target_locations?: string[] | null
          target_pet_types?: string[] | null
          target_subscription_types?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_type?: string
          created_at?: string | null
          created_by?: string | null
          cta_text?: string | null
          current_clicks?: number | null
          current_impressions?: number | null
          custom_height?: number | null
          custom_width?: number | null
          description?: string | null
          end_date?: string | null
          format_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          max_clicks?: number | null
          max_impressions?: number | null
          priority?: number | null
          start_date?: string | null
          target_locations?: string[] | null
          target_pet_types?: string[] | null
          target_subscription_types?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "advertisement_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      balance: {
        Row: {
          amount: number | null
          attrs: Json | null
          balance_type: string | null
          currency: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          balance_type?: string | null
          currency?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          balance_type?: string | null
          currency?: string | null
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          amount: number | null
          attrs: Json | null
          created: string | null
          currency: string | null
          description: string | null
          fee: number | null
          id: string | null
          net: number | null
          status: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          fee?: number | null
          id?: string | null
          net?: number | null
          status?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          fee?: number | null
          id?: string | null
          net?: number | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      billing_meters: {
        Row: {
          attrs: Json | null
          display_name: string | null
          event_name: string | null
          event_time_window: string | null
          id: string | null
          status: string | null
        }
        Insert: {
          attrs?: Json | null
          display_name?: string | null
          event_name?: string | null
          event_time_window?: string | null
          id?: string | null
          status?: string | null
        }
        Update: {
          attrs?: Json | null
          display_name?: string | null
          event_name?: string | null
          event_time_window?: string | null
          id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          care_request_id: string | null
          caretaker_id: string | null
          created_at: string | null
          id: string
          payment_status: string | null
          price: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          care_request_id?: string | null
          caretaker_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          care_request_id?: string | null
          caretaker_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "caretaker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_requests: {
        Row: {
          created_at: string | null
          emergency_contact: string | null
          end_date: string | null
          id: string
          owner_id: string | null
          pet_id: string | null
          services: Json
          special_instructions: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          vet_info: string | null
        }
        Insert: {
          created_at?: string | null
          emergency_contact?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string | null
          pet_id?: string | null
          services: Json
          special_instructions?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          vet_info?: string | null
        }
        Update: {
          created_at?: string | null
          emergency_contact?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string | null
          pet_id?: string | null
          services?: Json
          special_instructions?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          vet_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      caretaker_images: {
        Row: {
          caretaker_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_category: string | null
          image_type: string
          image_url: string
        }
        Insert: {
          caretaker_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_category?: string | null
          image_type: string
          image_url: string
        }
        Update: {
          caretaker_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_category?: string | null
          image_type?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "caretaker_images_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_images_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_images_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      caretaker_partner_connections: {
        Row: {
          caretaker_id: string
          created_at: string
          id: string
          partner_id: string
          updated_at: string
        }
        Insert: {
          caretaker_id: string
          created_at?: string
          id?: string
          partner_id: string
          updated_at?: string
        }
        Update: {
          caretaker_id?: string
          created_at?: string
          id?: string
          partner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "caretaker_partner_connections_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_partner_connections_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_partner_connections_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_partner_connections_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_partner_connections_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_partner_connections_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      caretaker_profiles: {
        Row: {
          animal_types: string[] | null
          approval_approved_at: string | null
          approval_approved_by: string | null
          approval_notes: string | null
          approval_requested_at: string | null
          approval_status: string | null
          availability: Json | null
          behandlungsmethoden: string[] | null
          beratungsarten: string[] | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          dienstleister_typ: string | null
          experience_description: string | null
          experience_years: number | null
          fachgebiete: string[] | null
          freie_dienstleistung: string | null
          home_photos: string[] | null
          hourly_rate: number | null
          id: string
          is_commercial: boolean | null
          is_verified: boolean | null
          kategorie_id: number | null
          kontakt_info: Json | null
          languages: string[] | null
          long_about_me: string | null
          notfall_bereitschaft: boolean | null
          oeffnungszeiten: Json | null
          overnight_availability: Json | null
          portfolio_urls: string[] | null
          qualifications: string[] | null
          rating: number | null
          review_count: number | null
          service_radius: number | null
          services_with_categories: Json | null
          short_about_me: string | null
          short_term_available: boolean | null
          spezialisierungen: string[] | null
          stil_beschreibung: string | null
          tax_number: string | null
          updated_at: string | null
          vat_id: string | null
          zertifikate: string[] | null
        }
        Insert: {
          animal_types?: string[] | null
          approval_approved_at?: string | null
          approval_approved_by?: string | null
          approval_notes?: string | null
          approval_requested_at?: string | null
          approval_status?: string | null
          availability?: Json | null
          behandlungsmethoden?: string[] | null
          beratungsarten?: string[] | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          dienstleister_typ?: string | null
          experience_description?: string | null
          experience_years?: number | null
          fachgebiete?: string[] | null
          freie_dienstleistung?: string | null
          home_photos?: string[] | null
          hourly_rate?: number | null
          id: string
          is_commercial?: boolean | null
          is_verified?: boolean | null
          kategorie_id?: number | null
          kontakt_info?: Json | null
          languages?: string[] | null
          long_about_me?: string | null
          notfall_bereitschaft?: boolean | null
          oeffnungszeiten?: Json | null
          overnight_availability?: Json | null
          portfolio_urls?: string[] | null
          qualifications?: string[] | null
          rating?: number | null
          review_count?: number | null
          service_radius?: number | null
          services_with_categories?: Json | null
          short_about_me?: string | null
          short_term_available?: boolean | null
          spezialisierungen?: string[] | null
          stil_beschreibung?: string | null
          tax_number?: string | null
          updated_at?: string | null
          vat_id?: string | null
          zertifikate?: string[] | null
        }
        Update: {
          animal_types?: string[] | null
          approval_approved_at?: string | null
          approval_approved_by?: string | null
          approval_notes?: string | null
          approval_requested_at?: string | null
          approval_status?: string | null
          availability?: Json | null
          behandlungsmethoden?: string[] | null
          beratungsarten?: string[] | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          dienstleister_typ?: string | null
          experience_description?: string | null
          experience_years?: number | null
          fachgebiete?: string[] | null
          freie_dienstleistung?: string | null
          home_photos?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_commercial?: boolean | null
          is_verified?: boolean | null
          kategorie_id?: number | null
          kontakt_info?: Json | null
          languages?: string[] | null
          long_about_me?: string | null
          notfall_bereitschaft?: boolean | null
          oeffnungszeiten?: Json | null
          overnight_availability?: Json | null
          portfolio_urls?: string[] | null
          qualifications?: string[] | null
          rating?: number | null
          review_count?: number | null
          service_radius?: number | null
          services_with_categories?: Json | null
          short_about_me?: string | null
          short_term_available?: boolean | null
          spezialisierungen?: string[] | null
          stil_beschreibung?: string | null
          tax_number?: string | null
          updated_at?: string | null
          vat_id?: string | null
          zertifikate?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "caretaker_profiles_approval_approved_by_fkey"
            columns: ["approval_approved_by"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_profiles_approval_approved_by_fkey"
            columns: ["approval_approved_by"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_profiles_approval_approved_by_fkey"
            columns: ["approval_approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caretaker_profiles_kategorie_id_fkey"
            columns: ["kategorie_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_kategorien"
            referencedColumns: ["id"]
          },
        ]
      }
      charges: {
        Row: {
          amount: number | null
          attrs: Json | null
          created: string | null
          currency: string | null
          customer: string | null
          description: string | null
          id: string | null
          invoice: string | null
          payment_intent: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          customer?: string | null
          description?: string | null
          id?: string | null
          invoice?: string | null
          payment_intent?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          customer?: string | null
          description?: string | null
          id?: string | null
          invoice?: string | null
          payment_intent?: string | null
          status?: string | null
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          attrs: Json | null
          created: string | null
          customer: string | null
          id: string | null
          payment_intent: string | null
          subscription: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_item_categories: {
        Row: {
          category_id: string
          content_item_id: string
        }
        Insert: {
          category_id: string
          content_item_id: string
        }
        Update: {
          category_id?: string
          content_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_categories_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_tags: {
        Row: {
          content_item_id: string
          tag_id: string
        }
        Insert: {
          content_item_id: string
          tag_id: string
        }
        Update: {
          content_item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_tags_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          caretaker_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          owner_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          caretaker_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          owner_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          caretaker_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          owner_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_service_empfehlungen: {
        Row: {
          created_at: string | null
          empfehlung_text: string | null
          empfohlene_kategorie_id: number
          haupt_kategorie_id: number
          id: number
          is_active: boolean | null
          prioritaet: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empfehlung_text?: string | null
          empfohlene_kategorie_id: number
          haupt_kategorie_id: number
          id?: number
          is_active?: boolean | null
          prioritaet?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empfehlung_text?: string | null
          empfohlene_kategorie_id?: number
          haupt_kategorie_id?: number
          id?: number
          is_active?: boolean | null
          prioritaet?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_service_empfehlungen_empfohlene_kategorie_id_fkey"
            columns: ["empfohlene_kategorie_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_kategorien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_service_empfehlungen_haupt_kategorie_id_fkey"
            columns: ["haupt_kategorie_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_kategorien"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          attrs: Json | null
          created: string | null
          description: string | null
          email: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      dienstleister_kategorien: {
        Row: {
          beschreibung: string | null
          created_at: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          sortierung: number | null
          updated_at: string | null
        }
        Insert: {
          beschreibung?: string | null
          created_at?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          sortierung?: number | null
          updated_at?: string | null
        }
        Update: {
          beschreibung?: string | null
          created_at?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          sortierung?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dienstleister_leistungen: {
        Row: {
          beschreibung: string | null
          created_at: string | null
          dauer_minuten: number | null
          dienstleister_id: string
          id: number
          kategorie_spezifisch: Json | null
          name: string
          preis: number | null
          preis_typ: string | null
          updated_at: string | null
          verfuegbar: boolean | null
        }
        Insert: {
          beschreibung?: string | null
          created_at?: string | null
          dauer_minuten?: number | null
          dienstleister_id: string
          id?: number
          kategorie_spezifisch?: Json | null
          name: string
          preis?: number | null
          preis_typ?: string | null
          updated_at?: string | null
          verfuegbar?: boolean | null
        }
        Update: {
          beschreibung?: string | null
          created_at?: string | null
          dauer_minuten?: number | null
          dienstleister_id?: string
          id?: number
          kategorie_spezifisch?: Json | null
          name?: string
          preis?: number | null
          preis_typ?: string | null
          updated_at?: string | null
          verfuegbar?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dienstleister_leistungen_dienstleister_id_fkey"
            columns: ["dienstleister_id"]
            isOneToOne: false
            referencedRelation: "caretaker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          amount: number | null
          attrs: Json | null
          charge: string | null
          created: string | null
          currency: string | null
          id: string | null
          payment_intent: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          charge?: string | null
          created?: string | null
          currency?: string | null
          id?: string | null
          payment_intent?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          charge?: string | null
          created?: string | null
          currency?: string | null
          id?: string | null
          payment_intent?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      email_signups: {
        Row: {
          cleverreach_id: number | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_verified: boolean | null
          name: string | null
          source: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_type: string | null
          verification_token: string | null
        }
        Insert: {
          cleverreach_id?: number | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string | null
          source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_type?: string | null
          verification_token?: string | null
        }
        Update: {
          cleverreach_id?: number | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string | null
          source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_type?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          api_version: string | null
          attrs: Json | null
          created: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          api_version?: string | null
          attrs?: Json | null
          created?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          api_version?: string | null
          attrs?: Json | null
          created?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      file_links: {
        Row: {
          attrs: Json | null
          created: string | null
          expired: boolean | null
          expires_at: string | null
          file: string | null
          id: string | null
          url: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          expired?: boolean | null
          expires_at?: string | null
          file?: string | null
          id?: string | null
          url?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          expired?: boolean | null
          expires_at?: string | null
          file?: string | null
          id?: string | null
          url?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          attrs: Json | null
          created: string | null
          expires_at: string | null
          filename: string | null
          id: string | null
          purpose: string | null
          size: number | null
          title: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          expires_at?: string | null
          filename?: string | null
          id?: string | null
          purpose?: string | null
          size?: number | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          expires_at?: string | null
          filename?: string | null
          id?: string | null
          purpose?: string | null
          size?: number | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      help_resources: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          attrs: Json | null
          currency: string | null
          customer: string | null
          id: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          subscription: string | null
          total: number | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Relationships: []
      }
      mandates: {
        Row: {
          attrs: Json | null
          id: string | null
          payment_method: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          attrs?: Json | null
          id?: string | null
          payment_method?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          attrs?: Json | null
          id?: string | null
          payment_method?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_caretaker_connections: {
        Row: {
          caretaker_id: string
          connection_type: string
          created_at: string
          id: string
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          caretaker_id: string
          connection_type: string
          created_at?: string
          id?: string
          owner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          caretaker_id?: string
          connection_type?: string
          created_at?: string
          id?: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_caretaker_connections_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_caretaker_connections_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_caretaker_connections_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_caretaker_connections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_caretaker_connections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_caretaker_connections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }

      owner_job_pets: {
        Row: {
          job_id: string
          pet_id: string
          created_at: string
        }
        Insert: {
          job_id: string
          pet_id: string
          created_at?: string
        }
        Update: {
          job_id?: string
          pet_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_job_pets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "owner_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_job_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_jobs: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          status: string
          date_from: string | null
          date_to: string | null
          location_text: string | null
          service_tags: string[] | null
          budget_hint: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          status?: string
          date_from?: string | null
          date_to?: string | null
          location_text?: string | null
          service_tags?: string[] | null
          budget_hint?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          status?: string
          date_from?: string | null
          date_to?: string | null
          location_text?: string | null
          service_tags?: string[] | null
          budget_hint?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_preferences: {
        Row: {
          care_instructions: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          other_services: string | null
          owner_id: string
          services: string[]
          share_settings: Json | null
          vet_info: string | null
        }
        Insert: {
          care_instructions?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          other_services?: string | null
          owner_id: string
          services: string[]
          share_settings?: Json | null
          vet_info?: string | null
        }
        Update: {
          care_instructions?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          other_services?: string | null
          owner_id?: string
          services?: string[]
          share_settings?: Json | null
          vet_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_preferences_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_preferences_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_preferences_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          owner_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          owner_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_reviews_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_reviews_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_reviews_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number | null
          attrs: Json | null
          created: string | null
          currency: string | null
          customer: string | null
          id: string | null
          payment_method: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          payment_method?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number | null
          arrival_date: string | null
          attrs: Json | null
          created: string | null
          currency: string | null
          description: string | null
          id: string | null
          statement_descriptor: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          arrival_date?: string | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          statement_descriptor?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          arrival_date?: string | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          statement_descriptor?: string | null
          status?: string | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: number | null
          birth_date: string | null
          breed: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          name: string
          neutered: boolean | null
          owner_id: string | null
          photo_url: string | null
          type: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          name: string
          neutered?: boolean | null
          owner_id?: string | null
          photo_url?: string | null
          type: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          name?: string
          neutered?: boolean | null
          owner_id?: string | null
          photo_url?: string | null
          type?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plzs: {
        Row: {
          city: string
          created_at: string | null
          latitude: number | null
          location: unknown
          longitude: number | null
          plz: string
        }
        Insert: {
          city: string
          created_at?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          plz: string
        }
        Update: {
          city?: string
          created_at?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          plz?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          active: boolean | null
          attrs: Json | null
          created: string | null
          currency: string | null
          id: string | null
          product: string | null
          type: string | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          id?: string | null
          product?: string | null
          type?: string | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          id?: string | null
          product?: string | null
          type?: string | null
          unit_amount?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          attrs: Json | null
          created: string | null
          default_price: string | null
          description: string | null
          id: string | null
          name: string | null
          updated: string | null
        }
        Insert: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          default_price?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated?: string | null
        }
        Update: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          default_price?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number | null
          attrs: Json | null
          charge: string | null
          created: string | null
          currency: string | null
          id: string | null
          payment_intent: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          charge?: string | null
          created?: string | null
          currency?: string | null
          id?: string | null
          payment_intent?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          charge?: string | null
          created?: string | null
          currency?: string | null
          id?: string | null
          payment_intent?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          bewertung_kategorien: Json | null
          bewertung_typ: string | null
          care_request_id: string | null
          caretaker_id: string | null
          caretaker_response: string | null
          caretaker_response_created_at: string | null
          comment: string | null
          created_at: string | null
          dienstleister_id: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bewertung_kategorien?: Json | null
          bewertung_typ?: string | null
          care_request_id?: string | null
          caretaker_id?: string | null
          caretaker_response?: string | null
          caretaker_response_created_at?: string | null
          comment?: string | null
          created_at?: string | null
          dienstleister_id?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bewertung_kategorien?: Json | null
          bewertung_typ?: string | null
          care_request_id?: string | null
          caretaker_id?: string | null
          caretaker_response?: string | null
          caretaker_response_created_at?: string | null
          comment?: string | null
          created_at?: string | null
          dienstleister_id?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "caretaker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_dienstleister_id_fkey"
            columns: ["dienstleister_id"]
            isOneToOne: false
            referencedRelation: "caretaker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_attempts: {
        Row: {
          application: string | null
          attrs: Json | null
          created: string | null
          customer: string | null
          id: string | null
          on_behalf_of: string | null
          payment_method: string | null
          setup_intent: string | null
          status: string | null
          usage: string | null
        }
        Insert: {
          application?: string | null
          attrs?: Json | null
          created?: string | null
          customer?: string | null
          id?: string | null
          on_behalf_of?: string | null
          payment_method?: string | null
          setup_intent?: string | null
          status?: string | null
          usage?: string | null
        }
        Update: {
          application?: string | null
          attrs?: Json | null
          created?: string | null
          customer?: string | null
          id?: string | null
          on_behalf_of?: string | null
          payment_method?: string | null
          setup_intent?: string | null
          status?: string | null
          usage?: string | null
        }
        Relationships: []
      }
      setup_intents: {
        Row: {
          attrs: Json | null
          client_secret: string | null
          created: string | null
          customer: string | null
          description: string | null
          id: string | null
          payment_method: string | null
          status: string | null
          usage: string | null
        }
        Insert: {
          attrs?: Json | null
          client_secret?: string | null
          created?: string | null
          customer?: string | null
          description?: string | null
          id?: string | null
          payment_method?: string | null
          status?: string | null
          usage?: string | null
        }
        Update: {
          attrs?: Json | null
          client_secret?: string | null
          created?: string | null
          customer?: string | null
          description?: string | null
          id?: string | null
          payment_method?: string | null
          status?: string | null
          usage?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          assigned_admin_id: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_admin_id?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_admin_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string | null
          date: string
          display_order: number | null
          id: string
          is_published: boolean | null
          name: string
          pet: string | null
          rating: number
          text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          name: string
          pet?: string | null
          rating: number
          text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          name?: string
          pet?: string | null
          rating?: number
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          attrs: Json | null
          client_ip: string | null
          created: string | null
          id: string | null
          livemode: boolean | null
          type: string | null
          used: boolean | null
        }
        Insert: {
          attrs?: Json | null
          client_ip?: string | null
          created?: string | null
          id?: string | null
          livemode?: boolean | null
          type?: string | null
          used?: boolean | null
        }
        Update: {
          attrs?: Json | null
          client_ip?: string | null
          created?: string | null
          id?: string | null
          livemode?: boolean | null
          type?: string | null
          used?: boolean | null
        }
        Relationships: []
      }
      topups: {
        Row: {
          amount: number | null
          attrs: Json | null
          created: string | null
          currency: string | null
          description: string | null
          id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          amount: number | null
          attrs: Json | null
          created: string | null
          currency: string | null
          description: string | null
          destination: string | null
          id: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          destination?: string | null
          id?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          destination?: string | null
          id?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          action_type: string
          count: number | null
          created_at: string | null
          id: string
          month_year: string
          target_user_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          count?: number | null
          created_at?: string | null
          id?: string
          month_year: string
          target_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          count?: number | null
          created_at?: string | null
          id?: string
          month_year?: string
          target_user_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string | null
          date_recorded: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string | null
          id: string
          is_visible_to_user: boolean | null
          note_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_visible_to_user?: boolean | null
          note_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_visible_to_user?: boolean | null
          note_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          about_me: string | null
          short_intro: string | null
          admin_role: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          is_suspended: boolean | null
          last_admin_login: string | null
          last_name: string | null
          max_bookings: number | null
          max_contact_requests: number | null
          phone_number: string | null
          plan_expires_at: string | null
          plan_type: string | null
          plz: string | null
          premium_badge: boolean | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          public_profile_visible: boolean
          search_priority: number | null
          show_ads: boolean | null
          street: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          totp_secret: string | null
          updated_at: string | null
          user_type: string | null
          verification_status: string | null
        }
        Insert: {
          about_me?: string | null
          short_intro?: string | null
          admin_role?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          is_admin?: boolean | null
          is_suspended?: boolean | null
          last_admin_login?: string | null
          last_name?: string | null
          max_bookings?: number | null
          max_contact_requests?: number | null
          phone_number?: string | null
          plan_expires_at?: string | null
          plan_type?: string | null
          plz?: string | null
          premium_badge?: boolean | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          public_profile_visible?: boolean
          search_priority?: number | null
          show_ads?: boolean | null
          street?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          totp_secret?: string | null
          updated_at?: string | null
          user_type?: string | null
          verification_status?: string | null
        }
        Update: {
          about_me?: string | null
          short_intro?: string | null
          admin_role?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          is_suspended?: boolean | null
          last_admin_login?: string | null
          last_name?: string | null
          max_bookings?: number | null
          max_contact_requests?: number | null
          phone_number?: string | null
          plan_expires_at?: string | null
          plan_type?: string | null
          plz?: string | null
          premium_badge?: boolean | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          public_profile_visible?: boolean
          search_priority?: number | null
          show_ads?: boolean | null
          street?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          totp_secret?: string | null
          updated_at?: string | null
          user_type?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_plz_city_fkey"
            columns: ["plz", "city"]
            isOneToOne: false
            referencedRelation: "plzs"
            referencedColumns: ["plz", "city"]
          },
          {
            foreignKeyName: "users_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "caretaker_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "dienstleister_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_comment: string | null
          ausweis_url: string | null
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
          zertifikate_urls: string[] | null
        }
        Insert: {
          admin_comment?: string | null
          ausweis_url?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          zertifikate_urls?: string[] | null
        }
        Update: {
          admin_comment?: string | null
          ausweis_url?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          zertifikate_urls?: string[] | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          customer_email: string | null
          error_message: string | null
          event_type: string
          id: string
          raw_data: Json | null
          status: string
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          raw_data?: Json | null
          status: string
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          raw_data?: Json | null
          status?: string
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      advertisements_with_formats: {
        Row: {
          ad_type: string | null
          created_at: string | null
          created_by: string | null
          cta_text: string | null
          current_clicks: number | null
          current_impressions: number | null
          custom_height: number | null
          custom_width: number | null
          description: string | null
          display_height: number | null
          display_width: number | null
          end_date: string | null
          format_description: string | null
          format_id: string | null
          format_name: string | null
          function_description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          max_clicks: number | null
          max_impressions: number | null
          placement: string | null
          priority: number | null
          start_date: string | null
          target_locations: string[] | null
          target_pet_types: string[] | null
          target_subscription_types: string[] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "advertisement_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      caretaker_search_view: {
        Row: {
          animal_types: string[] | null
          approval_status: string | null
          availability: Json | null
          city: string | null
          company_name: string | null
          created_at: string | null
          experience_description: string | null
          experience_years: number | null
          first_name: string | null
          friday_availability: Json | null
          full_name: string | null
          home_photos: string[] | null
          hourly_rate: number | null
          id: string | null
          is_commercial: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          last_name: string | null
          long_about_me: string | null
          monday_availability: Json | null
          overnight_availability: Json | null
          plz: string | null
          profile_photo_url: string | null
          qualifications: string[] | null
          rating: number | null
          review_count: number | null
          saturday_availability: Json | null
          service_radius: number | null
          services_with_categories: Json | null
          short_about_me: string | null
          short_term_available: boolean | null
          sunday_availability: Json | null
          tax_number: string | null
          thursday_availability: Json | null
          tuesday_availability: Json | null
          updated_at: string | null
          vat_id: string | null
          wednesday_availability: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_plz_city_fkey"
            columns: ["plz", "city"]
            isOneToOne: false
            referencedRelation: "plzs"
            referencedColumns: ["plz", "city"]
          },
        ]
      }
      dienstleister_search_view: {
        Row: {
          animal_types: string[] | null
          approval_status: string | null
          availability: Json | null
          bio: string | null
          city: string | null
          dienstleister_typ: string | null
          experience_description: string | null
          experience_years: number | null
          first_name: string | null
          home_photos: string[] | null
          hourly_rate: number | null
          id: string | null
          is_commercial: boolean | null
          is_suspended: boolean | null
          kategorie_icon: string | null
          kategorie_id: number | null
          kategorie_name: string | null
          kontakt_info: Json | null
          languages: string[] | null
          last_name: string | null
          long_about_me: string | null
          notfall_bereitschaft: boolean | null
          oeffnungszeiten: Json | null
          overnight_availability: Json | null
          plz: string | null
          portfolio_urls: string[] | null
          profile_photo_url: string | null
          public_profile_visible: boolean | null
          qualifications: string[] | null
          rating: number | null
          search_type: string | null
          search_vector: unknown
          service_radius: number | null
          services_with_categories: Json | null
          short_about_me: string | null
          short_term_available: boolean | null
          spezialisierungen: string[] | null
          street: string | null
          user_type: string | null
          zertifikate: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "caretaker_profiles_kategorie_id_fkey"
            columns: ["kategorie_id"]
            isOneToOne: false
            referencedRelation: "dienstleister_kategorien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_plz_city_fkey"
            columns: ["plz", "city"]
            isOneToOne: false
            referencedRelation: "plzs"
            referencedColumns: ["plz", "city"]
          },
        ]
      }
      stripe_subscription_details: {
        Row: {
          attrs: Json | null
          billing_interval: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          ended_at: string | null
          id: string | null
          plan_amount_cents: number | null
          plan_currency: string | null
          price_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          attrs?: Json | null
          billing_interval?: never
          cancel_at_period_end?: never
          canceled_at?: never
          currency?: string | null
          current_period_end?: never
          current_period_start?: never
          customer?: string | null
          ended_at?: never
          id?: string | null
          plan_amount_cents?: never
          plan_currency?: never
          price_id?: never
          start_date?: never
          status?: never
        }
        Update: {
          attrs?: Json | null
          billing_interval?: never
          cancel_at_period_end?: never
          canceled_at?: never
          currency?: string | null
          current_period_end?: never
          current_period_start?: never
          customer?: string | null
          ended_at?: never
          id?: string | null
          plan_amount_cents?: never
          plan_currency?: never
          price_id?: never
          start_date?: never
          status?: never
        }
        Relationships: []
      }
    }
    Functions: {
      check_admin_access: {
        Args: { required_role?: string; user_id: string }
        Returns: boolean
      }
      check_caretaker_access: {
        Args: { requesting_caretaker_id: string; target_owner_id: string }
        Returns: boolean
      }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_all_verification_requests: {
        Args: never
        Returns: {
          admin_comment: string
          ausweis_url: string
          created_at: string
          id: string
          reviewed_at: string
          reviewed_by: string
          status: string
          updated_at: string
          user_id: string
          users: Json
          zertifikate_urls: string[]
        }[]
      }
      get_caretaker_by_id: {
        Args: { caretaker_id: string }
        Returns: {
          city: string
          email: string
          experience_years: number
          first_name: string
          hourly_rate: number
          id: string
          is_verified: boolean
          last_name: string
          long_about_me: string
          phone_number: string
          plz: string
          profile_photo_url: string
          rating: number
          review_count: number
          services: string[]
          short_about_me: string
        }[]
      }
      get_monthly_usage: {
        Args: { action: string; user_uuid: string }
        Returns: number
      }
      get_services_as_strings: {
        Args: { profile_services_with_categories: Json }
        Returns: string[]
      }
      get_services_prices: {
        Args: { profile_services_with_categories: Json }
        Returns: Json
      }
      get_targeted_advertisements: {
        Args: {
          p_ad_type: string
          p_limit?: number
          p_user_location?: string
          p_user_pet_types?: string[]
          p_user_subscription_type?: string
        }
        Returns: {
          ad_type: string
          cta_text: string
          description: string
          display_height: number
          display_width: number
          id: string
          image_url: string
          link_url: string
          priority: number
          title: string
        }[]
      }
      get_user_details: { Args: { target_user_id: string }; Returns: Json }
      get_user_management_stats: { Args: never; Returns: Json }
      increment_advertisement_clicks: {
        Args: { ad_id: string }
        Returns: undefined
      }
      increment_advertisement_impressions: {
        Args: { ad_id: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          action_name: string
          admin_id: string
          ip_addr?: unknown
          new_data?: Json
          old_data?: Json
          record_id?: string
          table_name?: string
          user_agent_str?: string
        }
        Returns: undefined
      }
      search_caretakers: {
        Args: never
        Returns: {
          city: string
          email: string
          experience_years: number
          first_name: string
          hourly_rate: number
          id: string
          is_verified: boolean
          last_name: string
          long_about_me: string
          phone_number: string
          plz: string
          profile_photo_url: string
          rating: number
          review_count: number
          services: string[]
          short_about_me: string
        }[]
      }
      search_users: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_term?: string
          user_type_filter?: string
        }
        Returns: Json
      }
      track_user_action: {
        Args: { action: string; target_uuid?: string; user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

