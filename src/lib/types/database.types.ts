export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Typen für die Freigabe-Status
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

// Interface für Caretaker-Profile mit Freigabe-Informationen
export interface CaretakerProfileWithApproval {
  id: string
  bio: string | null
  services: Json | null
  hourly_rate: number | null
  availability: Json | null
  experience_years: number | null
  is_verified: boolean | null
  rating: number | null
  review_count: number | null
  created_at: string | null
  updated_at: string | null
  animal_types: string[] | null
  prices: Json | null
  service_radius: number | null
  home_photos: string[] | null
  qualifications: string[] | null
  experience_description: string | null
  short_about_me: string | null
  long_about_me: string | null
  languages: string[] | null
  is_commercial: boolean | null
  company_name: string | null
  tax_number: string | null
  vat_id: string | null
  short_term_available: boolean | null
  overnight_availability: Json | null
  services_with_categories: Json | null
  // Freigabe-Felder
  approval_status: ApprovalStatus
  approval_requested_at: string | null
  approval_approved_at: string | null
  approval_approved_by: string | null
  approval_notes: string | null
}

// Interface für Freigabe-Anfrage
export interface ApprovalRequest {
  caretaker_id: string
  approval_status: 'pending'
  approval_requested_at: string
}

// Interface für Freigabe-Entscheidung
export interface ApprovalDecision {
  caretaker_id: string
  approval_status: 'approved' | 'rejected'
  approval_approved_at: string
  approval_approved_by: string
  approval_notes?: string
}

// Interface für Profil-Validierung
export interface ProfileValidationResult {
  isValid: boolean
  missingFields: string[]
  hasProfilePhoto: boolean
  hasAboutMe: boolean
  hasServices: boolean
}
