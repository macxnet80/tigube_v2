import { adminSupabase } from '../supabase/adminClient'
import { 
  ApprovalStatus, 
  CaretakerProfileWithApproval, 
  ApprovalRequest, 
  ApprovalDecision,
  ProfileValidationResult 
} from '../types/database.types'

export class AdminApprovalService {
  /**
   * Admin: Entscheidung über Freigabe eines Caretaker-Profils
   */
  static async decideApproval(decision: ApprovalDecision): Promise<void> {
    try {
      console.log('[AdminApprovalService] Deciding approval:', decision);
      
      const { error } = await adminSupabase
        .from('users')
        .update({
          approval_status: decision.approval_status,
          approval_approved_at: decision.approval_approved_at,
          approval_approved_by: decision.approval_approved_by,
          approval_notes: decision.approval_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', decision.caretaker_id);

      if (error) {
        console.error('[AdminApprovalService] Error updating approval status:', error);
        throw error;
      }

      console.log('[AdminApprovalService] Approval decision applied successfully');
    } catch (error) {
      console.error('[AdminApprovalService] Error in decideApproval:', error);
      throw error;
    }
  }

  /**
   * Admin: Freigabe-Status für einen Caretaker setzen
   */
  static async setApprovalStatus(
    caretakerId: string, 
    status: ApprovalStatus, 
    adminId: string, 
    notes?: string
  ): Promise<void> {
    try {
      console.log('[AdminApprovalService] Setting approval status:', { caretakerId, status, adminId, notes });
      
      const updateData: any = {
        approval_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.approval_approved_at = new Date().toISOString();
        updateData.approval_approved_by = adminId;
      }

      if (notes) {
        updateData.approval_notes = notes;
      }

      const { error } = await adminSupabase
        .from('users')
        .update(updateData)
        .eq('id', caretakerId);

      if (error) {
        console.error('[AdminApprovalService] Error setting approval status:', error);
        throw error;
      }

      console.log('[AdminApprovalService] Approval status set successfully');
    } catch (error) {
      console.error('[AdminApprovalService] Error in setApprovalStatus:', error);
      throw error;
    }
  }

  /**
   * Admin: Alle wartenden Freigabe-Anfragen abrufen
   */
  static async getPendingApprovals(): Promise<CaretakerProfileWithApproval[]> {
    try {
      console.log('[AdminApprovalService] Getting pending approvals');
      
      const { data, error } = await adminSupabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          approval_status,
          approval_requested_at,
          approval_approved_at,
          approval_approved_by,
          approval_notes,
          created_at,
          caretaker_profile (
            id,
            short_about_me,
            long_about_me,
            experience_years,
            hourly_rate,
            service_radius,
            languages,
            animal_types,
            qualifications,
            is_commercial,
            company_name,
            short_term_available
          )
        `)
        .eq('user_type', 'caretaker')
        .eq('approval_status', 'pending')
        .order('approval_requested_at', { ascending: true });

      if (error) {
        console.error('[AdminApprovalService] Error getting pending approvals:', error);
        throw error;
      }

      console.log('[AdminApprovalService] Found pending approvals:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[AdminApprovalService] Error in getPendingApprovals:', error);
      throw error;
    }
  }

  /**
   * Admin: Freigabe-Statistiken abrufen
   */
  static async getApprovalStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    try {
      console.log('[AdminApprovalService] Getting approval stats');
      
      const { data, error } = await adminSupabase
        .from('users')
        .select('approval_status')
        .eq('user_type', 'caretaker');

      if (error) {
        console.error('[AdminApprovalService] Error getting approval stats:', error);
        throw error;
      }

      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: data?.length || 0
      };

      data?.forEach(user => {
        switch (user.approval_status) {
          case 'pending':
            stats.pending++;
            break;
          case 'approved':
            stats.approved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
        }
      });

      console.log('[AdminApprovalService] Approval stats:', stats);
      return stats;
    } catch (error) {
      console.error('[AdminApprovalService] Error in getApprovalStats:', error);
      throw error;
    }
  }

  /**
   * Admin: Caretaker-Profil für Freigabe validieren
   */
  static async validateProfileForApproval(caretakerId: string): Promise<ProfileValidationResult> {
    try {
      console.log('[AdminApprovalService] Validating profile for approval:', caretakerId);
      
      // Caretaker-Profil laden
      const { data: profile, error: profileError } = await adminSupabase
        .from('caretaker_profiles')
        .select('*')
        .eq('user_id', caretakerId)
        .single();

      if (profileError || !profile) {
        throw new Error('Profil nicht gefunden');
      }

      // User-Daten für Profilbild prüfen
      const { data: user, error: userError } = await adminSupabase
        .from('users')
        .select('profile_photo_url')
        .eq('id', caretakerId)
        .single();

      if (userError || !user) {
        throw new Error('User nicht gefunden');
      }

      const missingFields: string[] = [];
      
      // Prüfe "Über mich" (short_about_me oder long_about_me)
      const hasAboutMe = !!(profile.short_about_me || profile.long_about_me);
      if (!hasAboutMe) {
        missingFields.push('Über mich');
      }

      // Prüfe Profilbild
      const hasProfilePhoto = !!user.profile_photo_url;
      if (!hasProfilePhoto) {
        missingFields.push('Profilbild');
      }

      // Prüfe mindestens eine Leistung
      const hasServices = !!(profile.services && 
        (Array.isArray(profile.services) ? profile.services.length > 0 : 
         typeof profile.services === 'object' && Object.keys(profile.services).length > 0));
      if (!hasServices) {
        missingFields.push('Mindestens eine Leistung');
      }

      const result = {
        isValid: hasAboutMe && hasProfilePhoto && hasServices,
        missingFields,
        hasProfilePhoto,
        hasAboutMe,
        hasServices
      };

      console.log('[AdminApprovalService] Validation result:', result);
      return result;
    } catch (error) {
      console.error('[AdminApprovalService] Error in validateProfileForApproval:', error);
      throw error;
    }
  }

  /**
   * Admin: Freigabe-Anfrage für einen Caretaker erstellen
   */
  static async requestApproval(caretakerId: string): Promise<void> {
    try {
      console.log('[AdminApprovalService] Requesting approval for:', caretakerId);
      
      // Erst validieren
      const validation = await this.validateProfileForApproval(caretakerId);
      
      if (!validation.isValid) {
        throw new Error(`Profil nicht vollständig. Fehlende Felder: ${validation.missingFields.join(', ')}`);
      }

      // Freigabe anfordern
      const { error } = await adminSupabase
        .from('users')
        .update({
          approval_status: 'pending',
          approval_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', caretakerId);

      if (error) {
        console.error('[AdminApprovalService] Error requesting approval:', error);
        throw error;
      }

      console.log('[AdminApprovalService] Approval requested successfully');
    } catch (error) {
      console.error('[AdminApprovalService] Error in requestApproval:', error);
      throw error;
    }
  }

  /**
   * Admin: Freigabe-Status zurücksetzen
   */
  static async resetApprovalStatus(caretakerId: string): Promise<void> {
    try {
      console.log('[AdminApprovalService] Resetting approval status for:', caretakerId);
      
      const { error } = await adminSupabase
        .from('users')
        .update({
          approval_status: null,
          approval_requested_at: null,
          approval_approved_at: null,
          approval_approved_by: null,
          approval_notes: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', caretakerId);

      if (error) {
        console.error('[AdminApprovalService] Error resetting approval status:', error);
        throw error;
      }

      console.log('[AdminApprovalService] Approval status reset successfully');
    } catch (error) {
      console.error('[AdminApprovalService] Error in resetApprovalStatus:', error);
      throw error;
    }
  }
}
