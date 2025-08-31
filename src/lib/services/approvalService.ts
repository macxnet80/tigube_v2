import { supabase } from '../supabase/client'
import { 
  ApprovalStatus, 
  CaretakerProfileWithApproval, 
  ApprovalRequest, 
  ApprovalDecision,
  ProfileValidationResult 
} from '../types/database.types'

export class ApprovalService {
  /**
   * Validiert ob ein Caretaker-Profil vollständig ist für Freigabe
   */
  static async validateProfileForApproval(caretakerId: string): Promise<ProfileValidationResult> {
    try {
      // Caretaker-Profil laden
      const { data: profile, error: profileError } = await supabase
        .from('caretaker_profiles')
        .select('*')
        .eq('id', caretakerId)
        .single()

      if (profileError || !profile) {
        throw new Error('Profil nicht gefunden')
      }

      // User-Daten für Profilbild prüfen
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('profile_photo_url')
        .eq('id', caretakerId)
        .single()

      if (userError || !user) {
        throw new Error('User nicht gefunden')
      }

      const missingFields: string[] = []
      
      // Prüfe "Über mich" (short_about_me oder long_about_me)
      const hasAboutMe = !!(profile.short_about_me || profile.long_about_me)
      if (!hasAboutMe) {
        missingFields.push('Über mich')
      }

      // Prüfe Profilbild
      const hasProfilePhoto = !!user.profile_photo_url
      if (!hasProfilePhoto) {
        missingFields.push('Profilbild')
      }

      // Prüfe mindestens eine Leistung
      const hasServices = !!(profile.services && 
        (Array.isArray(profile.services) ? profile.services.length > 0 : 
         typeof profile.services === 'object' && Object.keys(profile.services).length > 0))
      if (!hasServices) {
        missingFields.push('Mindestens eine Leistung')
      }

      return {
        isValid: hasAboutMe && hasProfilePhoto && hasServices,
        missingFields,
        hasProfilePhoto,
        hasAboutMe,
        hasServices
      }
    } catch (error) {
      console.error('Fehler bei Profil-Validierung:', error)
      throw error
    }
  }

  /**
   * Fordert Freigabe für ein Caretaker-Profil an
   */
  static async requestApproval(caretakerId: string): Promise<void> {
    try {
      // Erst validieren
      const validation = await this.validateProfileForApproval(caretakerId)
      
      if (!validation.isValid) {
        throw new Error(`Profil nicht vollständig. Fehlende Felder: ${validation.missingFields.join(', ')}`)
      }

      // Freigabe anfordern
      const { error } = await supabase
        .from('caretaker_profiles')
        .update({
          approval_status: 'pending',
          approval_requested_at: new Date().toISOString()
        })
        .eq('id', caretakerId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Fehler bei Freigabe-Anfrage:', error)
      throw error
    }
  }

  /**
   * Lädt alle pending Freigabe-Anfragen (für Admin)
   */
  static async getPendingApprovals(): Promise<CaretakerProfileWithApproval[]> {
    try {
      const { data, error } = await supabase
        .from('caretaker_profiles')
        .select(`
          *,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            profile_photo_url,
            phone_number,
            plz,
            city
          )
        `)
        .eq('approval_status', 'pending')
        .order('approval_requested_at', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Fehler beim Laden der pending Freigaben:', error)
      throw error
    }
  }

  /**
   * Entscheidet über eine Freigabe-Anfrage (für Admin)
   */
  static async decideApproval(decision: ApprovalDecision): Promise<void> {
    try {
      const { error } = await supabase
        .from('caretaker_profiles')
        .update({
          approval_status: decision.approval_status,
          approval_approved_at: decision.approval_approved_at,
          approval_approved_by: decision.approval_approved_by,
          approval_notes: decision.approval_notes || null
        })
        .eq('id', decision.caretaker_id)

      if (error) {
        throw error
      }

      // Optional: E-Mail-Benachrichtigung an Caretaker senden
      // await this.sendApprovalNotification(decision)
    } catch (error) {
      console.error('Fehler bei Freigabe-Entscheidung:', error)
      throw error
    }
  }

  /**
   * Lädt den Freigabe-Status für einen Caretaker
   */
  static async getApprovalStatus(caretakerId: string): Promise<{
    status: ApprovalStatus
    requestedAt: string | null
    approvedAt: string | null
    approvedBy: string | null
    notes: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('caretaker_profiles')
        .select('approval_status, approval_requested_at, approval_approved_at, approval_approved_by, approval_notes')
        .eq('id', caretakerId)
        .single()

      if (error) {
        throw error
      }

      return {
        status: data.approval_status || 'pending',
        requestedAt: data.approval_requested_at,
        approvedAt: data.approval_approved_at,
        approvedBy: data.approval_approved_by,
        notes: data.approval_notes
      }
    } catch (error) {
      console.error('Fehler beim Laden des Freigabe-Status:', error)
      throw error
    }
  }

  /**
   * Prüft ob ein Caretaker freigegeben ist (für Suchseite)
   */
  static async isApproved(caretakerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('caretaker_profiles')
        .select('approval_status')
        .eq('id', caretakerId)
        .single()

      if (error) {
        console.error('Fehler beim Prüfen der Freigabe:', error)
        return false
      }

      return data.approval_status === 'approved'
    } catch (error) {
      console.error('Fehler beim Prüfen der Freigabe:', error)
      return false
    }
  }

  /**
   * Lädt alle freigegebenen Caretaker (für Suchseite)
   */
  static async getApprovedCaretakers(): Promise<CaretakerProfileWithApproval[]> {
    try {
      const { data, error } = await supabase
        .from('caretaker_profiles')
        .select('*')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Fehler beim Laden der freigegebenen Caretaker:', error)
      throw error
    }
  }

  /**
   * Statistiken für Admin-Dashboard
   */
  static async getApprovalStats(): Promise<{
    pending: number
    approved: number
    rejected: number
    total: number
  }> {
    try {
      const { data, error } = await supabase
        .from('caretaker_profiles')
        .select('approval_status')

      if (error) {
        throw error
      }

      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: data?.length || 0
      }

      data?.forEach(profile => {
        switch (profile.approval_status) {
          case 'pending':
            stats.pending++
            break
          case 'approved':
            stats.approved++
            break
          case 'rejected':
            stats.rejected++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Fehler beim Laden der Freigabe-Statistiken:', error)
      throw error
    }
  }
}
