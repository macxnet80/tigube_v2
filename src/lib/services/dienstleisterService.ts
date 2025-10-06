// Dienstleister-Service für API-Aufrufe

import { supabase } from '../supabase/client';
import type { 
  DienstleisterProfil, 
  DienstleisterKategorie, 
  DienstleisterSucheFilter, 
  DienstleisterSucheErgebnis,
  DienstleisterLeistung,
  CrossServiceEmpfehlung,
  DienstleisterRegistrierung
} from '../types/dienstleister';

export class DienstleisterService {
  /**
   * Alle Dienstleister-Kategorien laden
   */
  static async getKategorien(): Promise<DienstleisterKategorie[]> {
    const { data, error } = await supabase
      .from('dienstleister_kategorien')
      .select('*')
      .eq('is_active', true)
      .order('sortierung');

    if (error) throw error;
    return data || [];
  }

  /**
   * Dienstleister suchen
   */
  static async searchDienstleister(
    filters: DienstleisterSucheFilter,
    limit: number = 20,
    offset: number = 0
  ): Promise<DienstleisterSucheErgebnis> {
    let query = supabase
      .from('dienstleister_search_view')
      .select('*', { count: 'exact' });

    // Kategorie-Filter
    if (filters.kategorie_id) {
      query = query.eq('kategorie_id', filters.kategorie_id);
    }

    // Dienstleister-Typ-Filter
    if (filters.dienstleister_typ) {
      query = query.eq('dienstleister_typ', filters.dienstleister_typ);
    }

    // Standort-Filter
    if (filters.standort?.plz) {
      query = query.eq('plz', filters.standort.plz);
    }

    if (filters.standort?.ort) {
      query = query.ilike('city', `%${filters.standort.ort}%`);
    }

    // Spezialisierungen-Filter
    if (filters.spezialisierungen && filters.spezialisierungen.length > 0) {
      query = query.overlaps('spezialisierungen', filters.spezialisierungen);
    }

    // Notfall-Bereitschaft-Filter
    if (filters.notfall_bereitschaft !== undefined) {
      query = query.eq('notfall_bereitschaft', filters.notfall_bereitschaft);
    }

    // Bewertungs-Filter
    if (filters.bewertung?.min) {
      query = query.gte('rating', filters.bewertung.min);
    }

    // Preis-Filter
    if (filters.preis?.min) {
      query = query.gte('hourly_rate', filters.preis.min);
    }

    if (filters.preis?.max) {
      query = query.lte('hourly_rate', filters.preis.max);
    }

    // Zertifiziert-Filter
    if (filters.zertifiziert) {
      query = query.not('zertifikate', 'is', null);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Kategorien laden
    const kategorien = await this.getKategorien();

    // Cross-Service-Empfehlungen laden (nur für Premium-User)
    let crossServiceEmpfehlungen: CrossServiceEmpfehlung[] = [];
    if (filters.kategorie_id) {
      const { data: empfehlungen } = await supabase
        .from('cross_service_empfehlungen')
        .select('*')
        .eq('haupt_kategorie_id', filters.kategorie_id)
        .eq('is_active', true)
        .order('prioritaet');

      crossServiceEmpfehlungen = empfehlungen || [];
    }

    return {
      dienstleister: data || [],
      kategorien,
      cross_service_empfehlungen: crossServiceEmpfehlungen,
      total_count: count || 0,
      has_more: (count || 0) > offset + limit
    };
  }

  /**
   * Dienstleister-Profil laden
   */
  static async getDienstleisterProfil(id: string): Promise<DienstleisterProfil | null> {
    try {
      const { data, error } = await supabase
        .from('dienstleister_search_view')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Fehler beim Laden des Dienstleister-Profils:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Fehler beim Laden des Dienstleister-Profils:', err);
      return null;
    }
  }

  /**
   * Dienstleister-Leistungen laden
   */
  static async getDienstleisterLeistungen(dienstleisterId: string): Promise<DienstleisterLeistung[]> {
    const { data, error } = await supabase
      .from('dienstleister_leistungen')
      .select('*')
      .eq('dienstleister_id', dienstleisterId)
      .eq('verfuegbar', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Dienstleister-Leistung erstellen
   */
  static async createLeistung(leistung: Omit<DienstleisterLeistung, 'id' | 'created_at' | 'updated_at'>): Promise<DienstleisterLeistung> {
    const { data, error } = await supabase
      .from('dienstleister_leistungen')
      .insert(leistung)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Dienstleister-Leistung aktualisieren
   */
  static async updateLeistung(id: number, updates: Partial<DienstleisterLeistung>): Promise<DienstleisterLeistung> {
    const { data, error } = await supabase
      .from('dienstleister_leistungen')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Dienstleister-Leistung löschen
   */
  static async deleteLeistung(id: number): Promise<void> {
    const { error } = await supabase
      .from('dienstleister_leistungen')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Cross-Service-Empfehlungen laden
   */
  static async getCrossServiceEmpfehlungen(kategorieId: number): Promise<CrossServiceEmpfehlung[]> {
    const { data, error } = await supabase
      .from('cross_service_empfehlungen')
      .select(`
        *,
        haupt_kategorie:dienstleister_kategorien!haupt_kategorie_id(name, icon),
        empfohlene_kategorie:dienstleister_kategorien!empfohlene_kategorie_id(name, icon)
      `)
      .eq('haupt_kategorie_id', kategorieId)
      .eq('is_active', true)
      .order('prioritaet');

    if (error) throw error;
    return data || [];
  }

  /**
   * Dienstleister-Profil aktualisieren
   */
  static async updateDienstleisterProfil(
    id: string, 
    updates: Partial<DienstleisterRegistrierung>
  ): Promise<void> {
    const { error } = await supabase
      .from('caretaker_profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Dienstleister-spezifische Dashboard-Tabs laden
   */
  static async getDashboardTabs(kategorieId: number): Promise<any[]> {
    try {
      // Basis-Tabs für alle Dienstleister
      const baseTabs = [
        { id: 'uebersicht', name: 'Übersicht', icon: 'home', kategorie_spezifisch: false },
        { id: 'leistungen', name: 'Leistungen', icon: 'briefcase', kategorie_spezifisch: false },
        { id: 'verfuegbarkeit', name: 'Verfügbarkeit', icon: 'calendar', kategorie_spezifisch: false },
        { id: 'bewertungen', name: 'Bewertungen', icon: 'star', kategorie_spezifisch: false },
        { id: 'einstellungen', name: 'Einstellungen', icon: 'settings', kategorie_spezifisch: false }
      ];

      // Kategorie-spezifische Tabs
      const kategorieSpezifischeTabs: Record<number, any[]> = {
        2: [ // Tierarzt
          { id: 'patienten', name: 'Patienten', icon: 'users', kategorie_spezifisch: true },
          { id: 'termine', name: 'Termine', icon: 'calendar', kategorie_spezifisch: true },
          { id: 'notfaelle', name: 'Notfälle', icon: 'alert-triangle', kategorie_spezifisch: true }
        ],
        3: [ // Hundetrainer
          { id: 'kunden', name: 'Kunden', icon: 'users', kategorie_spezifisch: true },
          { id: 'trainingsplaene', name: 'Trainingspläne', icon: 'clipboard', kategorie_spezifisch: true },
          { id: 'fortschritte', name: 'Fortschritte', icon: 'trending-up', kategorie_spezifisch: true }
        ],
        4: [ // Tierfriseur
          { id: 'buchungen', name: 'Buchungen', icon: 'calendar', kategorie_spezifisch: true },
          { id: 'galerie', name: 'Galerie', icon: 'image', kategorie_spezifisch: true },
          { id: 'services', name: 'Services', icon: 'scissors', kategorie_spezifisch: true }
        ],
        5: [ // Physiotherapeut
          { id: 'patienten', name: 'Patienten', icon: 'users', kategorie_spezifisch: true },
          { id: 'behandlungen', name: 'Behandlungen', icon: 'activity', kategorie_spezifisch: true },
          { id: 'fortschritte', name: 'Fortschritte', icon: 'trending-up', kategorie_spezifisch: true }
        ],
        6: [ // Ernährungsberater
          { id: 'kunden', name: 'Kunden', icon: 'users', kategorie_spezifisch: true },
          { id: 'beratungen', name: 'Beratungen', icon: 'message-circle', kategorie_spezifisch: true },
          { id: 'ernaehrungsplaene', name: 'Ernährungspläne', icon: 'clipboard', kategorie_spezifisch: true }
        ],
        7: [ // Tierfotograf
          { id: 'auftraege', name: 'Aufträge', icon: 'camera', kategorie_spezifisch: true },
          { id: 'portfolio', name: 'Portfolio', icon: 'image', kategorie_spezifisch: true },
          { id: 'galerie', name: 'Galerie', icon: 'images', kategorie_spezifisch: true }
        ]
      };

      const spezifischeTabs = kategorieSpezifischeTabs[kategorieId] || [];
      return [...baseTabs, ...spezifischeTabs];
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Tabs:', error);
      return [];
    }
  }
}
