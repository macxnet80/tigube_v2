import { supabase } from './client';
import { ownerPreferencesService } from './db';
import { ownerJobService } from './ownerJobService';
import type {
  PublicOwnerProfile,
  PublicOwnerJob,
  OwnerCaretakerConnection,
  OwnerCaretakerConnectionInsert,
  OwnerCaretakerConnectionUpdate
} from './types';

/**
 * Service für öffentliche Owner-Profile
 * Verwaltet Zugriffskontrolle und Datenschutz-Filterung
 */
export const ownerPublicService = {
  
  /**
   * Prüft ob ein Caretaker auf das Owner-Profil zugreifen darf
   */
  checkCaretakerAccess: async (ownerId: string, caretakerId: string): Promise<{ hasAccess: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('owner_caretaker_connections')
        .select('status')
        .eq('owner_id', ownerId)
        .eq('caretaker_id', caretakerId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Fehler bei Zugriffsprüfung:', error);
        return { hasAccess: false, error: error.message };
      }

      return { hasAccess: !!data };
    } catch (error) {
      console.error('Exception bei Zugriffsprüfung:', error);
      return { hasAccess: false, error: 'Unbekannter Fehler bei Zugriffsprüfung' };
    }
  },

  /**
   * Erstellt eine neue Owner-Caretaker Verbindung
   * (wird automatisch beim ersten Chat/Kontakt erstellt)
   */
  createConnection: async (connectionData: OwnerCaretakerConnectionInsert): Promise<{ data: OwnerCaretakerConnection | null; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('owner_caretaker_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) {
        // Ignoriere Duplicate-Fehler (Verbindung existiert bereits)
        if (error.code === '23505') {
          return { data: null, error: 'Verbindung existiert bereits' };
        }
        console.error('Fehler beim Erstellen der Verbindung:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Exception beim Erstellen der Verbindung:', error);
      return { data: null, error: 'Unbekannter Fehler beim Erstellen der Verbindung' };
    }
  },

  /**
   * Aktualisiert den Status einer Verbindung (z.B. blockieren)
   */
  updateConnection: async (ownerId: string, caretakerId: string, updateData: OwnerCaretakerConnectionUpdate): Promise<{ data: OwnerCaretakerConnection | null; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('owner_caretaker_connections')
        .update(updateData)
        .eq('owner_id', ownerId)
        .eq('caretaker_id', caretakerId)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Aktualisieren der Verbindung:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Exception beim Aktualisieren der Verbindung:', error);
      return { data: null, error: 'Unbekannter Fehler beim Aktualisieren der Verbindung' };
    }
  },

  /**
   * Lädt das öffentliche Owner-Profil (eingeloggte Nutzer).
   * Nur: Profilbild, Über mich, Haustiere (laut Share-Settings). Keine Kontaktdaten — nur Chat.
   */
  getPublicOwnerProfile: async (ownerId: string, viewerId: string): Promise<{ data: PublicOwnerProfile | null; error?: string }> => {
    try {
      const isOwnProfile = ownerId === viewerId;

      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_photo_url, short_intro, about_me')
        .eq('id', ownerId)
        .single();

      if (userError || !userProfile) {
        return { data: null, error: userError?.message || 'Owner nicht gefunden' };
      }

      const { data: loadedShareSettings } = await ownerPreferencesService.getShareSettings(ownerId);

      const shareSettings = isOwnProfile
        ? { aboutMe: true, profilePhoto: true, petDetails: true }
        : {
            aboutMe: loadedShareSettings?.aboutMe ?? true,
            profilePhoto: loadedShareSettings?.profilePhoto ?? true,
            petDetails: loadedShareSettings?.petDetails ?? true
          };

      const publicProfile: PublicOwnerProfile = {
        id: userProfile.id,
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        profile_photo_url: shareSettings.profilePhoto ? userProfile.profile_photo_url : null,
        share_settings: shareSettings
      };

      if (shareSettings.aboutMe) {
        if (userProfile.short_intro) {
          publicProfile.short_intro = userProfile.short_intro;
        }
        if (userProfile.about_me) {
          publicProfile.about_me = userProfile.about_me;
        }
      }

      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('id, name, type, breed, age, photo_url, gender, neutered')
        .eq('owner_id', ownerId);

      if (petsError) {
        console.warn('Fehler beim Laden der Haustiere:', petsError);
      }

      if (shareSettings.petDetails && pets && pets.length > 0) {
        publicProfile.pets = pets.map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          photo_url: pet.photo_url,
          gender: pet.gender,
          neutered: pet.neutered
        }));
      }

      const { data: openJobs, error: jobsError } = await ownerJobService.listOpenJobsForOwner(ownerId);
      if (jobsError) {
        console.warn('Jobs für Owner-Profil:', jobsError);
      } else if (openJobs && openJobs.length > 0) {
        publicProfile.jobs = openJobs.map(
          (j): PublicOwnerJob => ({
            id: j.id,
            title: j.title,
            description: j.description,
            date_from: j.date_from,
            date_to: j.date_to,
            location_text: j.location_text,
            service_tags: j.service_tags,
            budget_hint: j.budget_hint,
            pets: j.pets
          })
        );
      }

      return { data: publicProfile };

    } catch (error) {
      console.error('Exception beim Laden des öffentlichen Profils:', error);
      return { data: null, error: 'Unbekannter Fehler beim Laden des Profils' };
    }
  },

  /**
   * Lädt alle Verbindungen eines Owners (für Dashboard-Verwaltung)
   */
  getOwnerConnections: async (ownerId: string): Promise<{ data: OwnerCaretakerConnection[] | null; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('owner_caretaker_connections')
        .select(`
          *,
          caretaker:users!owner_caretaker_connections_caretaker_id_fkey(
            id, first_name, last_name, profile_photo_url
          )
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Owner-Verbindungen:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Exception beim Laden der Owner-Verbindungen:', error);
      return { data: null, error: 'Unbekannter Fehler beim Laden der Verbindungen' };
    }
  },

  /**
   * Lädt alle Verbindungen eines Caretak eers
   */
  getCaretakerConnections: async (caretakerId: string): Promise<{ data: OwnerCaretakerConnection[] | null; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('owner_caretaker_connections')
        .select(`
          *,
          owner:users!owner_caretaker_connections_owner_id_fkey(
            id, first_name, last_name, profile_photo_url
          )
        `)
        .eq('caretaker_id', caretakerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Caretaker-Verbindungen:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Exception beim Laden der Caretaker-Verbindungen:', error);
      return { data: null, error: 'Unbekannter Fehler beim Laden der Verbindungen' };
    }
  }
};

export default ownerPublicService; 