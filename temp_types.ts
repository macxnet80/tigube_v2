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
      // ... andere Tabellen bleiben unverändert
    }
    Views: {
      dienstleister_search_view: {
        Row: {
          animal_types: string[] | null
          approval_status: string | null
          availability: Json | null
          availability_di: string | null
          availability_do: string | null
          availability_fr: string | null
          availability_mi: string | null
          availability_mo: string | null
          availability_sa: string | null
          availability_so: string | null
          behandlungsmethoden: string[] | null
          beratungsarten: string[] | null
          bio: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          dienstleister_typ: string | null
          email: string | null
          experience_description: string | null
          experience_years: number | null
          fachgebiete: string[] | null
          first_name: string | null
          freie_dienstleistung: string | null
          home_photos: string[] | null
          hourly_rate: number | null
          id: string | null
          is_commercial: boolean | null
          is_verified: boolean | null
          kategorie_beschreibung: string | null
          kategorie_icon: string | null
          kategorie_id: number | null
          kategorie_name: string | null
          languages: string[] | null
          last_name: string | null
          long_about_me: string | null
          notfall_verfuegbar: boolean | null
          overnight_availability: Json | null
          phone_number: string | null
          plan_type: string | null
          plz: string | null
          portfolio_urls: string[] | null
          premium_badge: boolean | null
          profile_photo_url: string | null
          public_profile_visible: boolean | null
          qualifications: string[] | null
          rating: number | null
          review_count: number | null
          service_radius: number | null
          services_with_categories: Json | null
          short_about_me: string | null
          short_term_available: boolean | null
          spezialisierungen: string[] | null
          stil_beschreibung: string | null
          street: string | null
          updated_at: string | null
          user_type: string | null
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
    }
  }
}
