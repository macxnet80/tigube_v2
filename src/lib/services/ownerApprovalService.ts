import { adminSupabase } from '../supabase/adminClient';
import { supabase } from '../supabase/client';

export type OwnerApprovalStatus = 'not_requested' | 'pending' | 'approved' | 'rejected';

/**
 * Prüft, ob ein Tierhalter ein Profilbild hat (Voraussetzung für Freigabe-Anfrage).
 */
export async function validateOwnerForApproval(userId: string): Promise<{
  isValid: boolean;
  missingFields: string[];
}> {
  const { data: user, error } = await supabase
    .from('users')
    .select('profile_photo_url')
    .eq('id', userId)
    .maybeSingle();

  if (error || !user) {
    return { isValid: false, missingFields: ['Profil'] };
  }

  const hasPhoto = !!(user.profile_photo_url && String(user.profile_photo_url).trim());
  if (!hasPhoto) {
    return { isValid: false, missingFields: ['Profilbild'] };
  }

  return { isValid: true, missingFields: [] };
}

/**
 * Freigabe beantragen: setzt owner_approval_status auf pending (nur mit Service-Role-Client).
 */
export async function requestOwnerApproval(userId: string): Promise<{ error: string | null }> {
  const validation = await validateOwnerForApproval(userId);
  if (!validation.isValid) {
    return {
      error: `Profil nicht vollständig. Fehlende Angaben: ${validation.missingFields.join(', ')}`
    };
  }

  const { error } = await adminSupabase
    .from('users')
    .update({
      owner_approval_status: 'pending',
      owner_approval_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('[ownerApprovalService] requestOwnerApproval:', error);
    return { error: error.message };
  }

  return { error: null };
}
