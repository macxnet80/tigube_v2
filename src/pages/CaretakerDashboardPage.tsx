import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AvailabilityScheduler from '../components/ui/AvailabilityScheduler';
import ClientDetailsAccordion from '../components/ui/ClientDetailsAccordion';
import LanguageSelector from '../components/ui/LanguageSelector';
import CommercialInfoInput from '../components/ui/CommercialInfoInput';
import type { ClientData } from '../components/ui/ClientDetailsAccordion';
import { useAuth } from '../lib/auth/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { caretakerProfileService, ownerCaretakerService } from '../lib/supabase/db';
import { Calendar, Check, Edit, LogOut, MapPin, Phone, Shield, Upload, Camera, Star, Info, Lock, Briefcase, Verified, Eye, EyeOff, KeyRound, Trash2, AlertTriangle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import PaymentSuccessModal from '../components/ui/PaymentSuccessModal';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';
import { PremiumBadge } from '../components/ui/PremiumBadge';
import { useSubscription } from '../lib/auth/useSubscription';

function CaretakerDashboardPage() {
  const { user, userProfile, loading: authLoading, subscription } = useAuth();
  const { isPremiumUser } = useSubscription();
  const { maxEnvironmentImages } = useFeatureAccess();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Payment Success Modal
  const { paymentSuccess, isValidating: paymentValidating, closeModal } = usePaymentSuccess();
  const [editData, setEditData] = useState(false);
  const [caretakerData, setCaretakerData] = useState({
    phoneNumber: userProfile?.phone_number || '',
    email: user?.email || '',
    plz: userProfile?.plz || '',
    street: userProfile?.street || '',
    city: userProfile?.city || ''
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  // --- Verfügbarkeits-State ---
  type TimeSlot = { start: string; end: string };
  type AvailabilityState = Record<string, TimeSlot[]>;
  const defaultAvailability: AvailabilityState = {
    Mo: [{ start: '09:00', end: '17:00' }],
    Di: [{ start: '09:00', end: '17:00' }],
    Mi: [{ start: '09:00', end: '17:00' }],
    Do: [{ start: '09:00', end: '17:00' }],
    Fr: [{ start: '09:00', end: '17:00' }],
    Sa: [],
    So: [],
  };
  const [availability, setAvailability] = useState<AvailabilityState>({});

  // Handler für Speichern der Verfügbarkeit
  const handleSaveAvailability = async (newAvailability: AvailabilityState) => {
    if (!user || !profile) return;
    
    try {
      // Konvertiere TimeSlot-Objekte zu String-Array für Datenbank
      const dbAvailability: Record<string, string[]> = {};
      for (const [day, slots] of Object.entries(newAvailability)) {
        dbAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
      }
      
      await caretakerProfileService.saveProfile(user.id, {
        services: profile.services || [],
        animalTypes: profile.animal_types || [],
        prices: profile.prices || {},
        serviceRadius: profile.service_radius || 0,
        availability: dbAvailability,
        homePhotos: profile.home_photos || [],
        qualifications: profile.qualifications || [],
        experienceDescription: profile.experience_description || '',
        shortAboutMe: profile.short_about_me || '',
        longAboutMe: profile.long_about_me || '',
        languages: Array.isArray(profile.languages) ? profile.languages : [],
      });
      
      setAvailability(newAvailability);
      setProfile((prev: any) => ({ ...prev, availability: newAvailability }));
    } catch (error) {
      console.error('Fehler beim Speichern der Verfügbarkeit:', error);
    }
  };

  // --- Leistungen & Qualifikationen State ---
  const [editSkills, setEditSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState({
    services: profile?.services || [],
    animal_types: profile?.animal_types || [],
    qualifications: profile?.qualifications || [],
    experience_description: profile?.experience_description || '',
    prices: profile?.prices || {},
    languages: profile?.languages || [],
    isCommercial: profile?.is_commercial || false,
    companyName: profile?.company_name || '',
    taxNumber: profile?.tax_number || '',
    vatId: profile?.vat_id || '',
  });
  // Freie Eingabe für Leistungen, Tierarten, Qualifikationen
  const [newService, setNewService] = useState('');
  const [newAnimal, setNewAnimal] = useState('');
  const [newQualification, setNewQualification] = useState('');

  // Default-Listen wie bei Anmeldung
  const defaultServices = [
    'Gassi-Service',
    'Haustierbetreuung',
    'Übernachtung',
    'Kurzbesuche',
    'Haussitting',
    'Hundetagesbetreuung',
  ];
  const defaultAnimals = [
    'Hunde',
    'Katzen',
    'Vögel',
    'Kaninchen',
    'Fische',
    'Kleintiere',
  ];
  const defaultQualifications = [
    'Erste-Hilfe am Tier zertifiziert',
    'Professioneller Hundetrainer',
    'Tierarzterfahrung',
    'Tierheim-Erfahrung',
  ];

  // Standard-Preisfelder wie bei der Anmeldung
  const defaultPriceFields = {
    'Gassi-Service': '',
    'Haustierbetreuung': '',
    'Übernachtung': '',
  };

  const priceFieldLabels = {
    'Gassi-Service': 'Gassi-Service (pro 30 Min)',
    'Haustierbetreuung': 'Haustierbetreuung (pro Besuch)',
    'Übernachtung': 'Übernachtung (pro Nacht)',
  };

  function handleSkillsChange(field: string, value: any) {
    setSkillsDraft(d => ({ ...d, [field]: value }));
  }
  function validatePriceInput(value: string): string {
    // Nur Zahlen, Punkt und Komma erlauben
    let cleanValue = value.replace(/[^0-9.,]/g, '');
    
    // Komma durch Punkt ersetzen für einheitliche Dezimaldarstellung
    cleanValue = cleanValue.replace(',', '.');
    
    // Nur einen Dezimalpunkt erlauben
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Maximal 2 Dezimalstellen erlauben
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleanValue;
  }

  function handlePriceChange(key: string, value: string) {
    const validatedValue = validatePriceInput(value);
    setSkillsDraft(d => ({ ...d, prices: { ...d.prices, [key]: validatedValue } }));
  }
  function handleRemovePrice(key: string) {
    setSkillsDraft(d => { const p = { ...d.prices }; delete p[key]; return { ...d, prices: p }; });
  }
  function handleAddPrice() {
    setSkillsDraft(d => ({ ...d, prices: { ...d.prices, '': '' } }));
  }
  const handleSaveSkills = async () => {
    if (!user || !profile) return;
    
    // Validierung für gewerbliche Betreuer
    if (skillsDraft.isCommercial && !skillsDraft.taxNumber.trim()) {
      setError('Bitte geben Sie Ihre Steuernummer an, wenn Sie als gewerblicher Betreuer tätig sind.');
      return;
    }
    
    try {
      // Konvertiere aktuelle Verfügbarkeit zu String-Array für Datenbank
      const dbAvailability: Record<string, string[]> = {};
      for (const [day, slots] of Object.entries(availability)) {
        dbAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
      }
      
      await caretakerProfileService.saveProfile(user.id, {
        services: skillsDraft.services,
        animalTypes: skillsDraft.animal_types,
        prices: skillsDraft.prices,
        serviceRadius: profile.service_radius || 0,
        availability: dbAvailability,
        homePhotos: profile.home_photos || [],
        qualifications: skillsDraft.qualifications,
        experienceDescription: skillsDraft.experience_description,
        shortAboutMe: profile.short_about_me || '',
        longAboutMe: profile.long_about_me || '',
        languages: skillsDraft.languages,
        isCommercial: skillsDraft.isCommercial,
        companyName: skillsDraft.companyName || undefined,
        taxNumber: skillsDraft.taxNumber || undefined,
        vatId: skillsDraft.vatId || undefined,
      });
      
      // Aktualisiere das Profil mit den neuen Daten
      setProfile((prev: any) => ({
        ...prev,
        services: skillsDraft.services,
        animal_types: skillsDraft.animal_types,
        qualifications: skillsDraft.qualifications,
        experience_description: skillsDraft.experience_description,
        prices: skillsDraft.prices,
        languages: skillsDraft.languages,
      }));
      
      setEditSkills(false);
    } catch (error) {
      console.error('Fehler beim Speichern der Leistungen & Qualifikationen:', error);
    }
  };
  function handleCancelSkills() {
    setSkillsDraft({
      services: profile?.services || [],
      animal_types: profile?.animal_types || [],
      qualifications: profile?.qualifications || [],
      experience_description: profile?.experience_description || '',
      prices: profile?.prices || {},
      languages: profile?.languages || [],
      isCommercial: profile?.is_commercial || false,
      companyName: profile?.company_name || '',
      taxNumber: profile?.tax_number || '',
      vatId: profile?.vat_id || '',
    });
    setEditSkills(false);
  }

  // State für kurze Beschreibung im Texte-Tab
  const [shortDescription, setShortDescription] = useState(profile?.short_about_me || '');
  const [editShortDesc, setEditShortDesc] = useState(false);
  const [shortDescDraft, setShortDescDraft] = useState(shortDescription);
  const maxShortDesc = 140;

  // State für Über mich Box
  const [aboutMe, setAboutMe] = useState(profile?.long_about_me || '');
  const [editAboutMe, setEditAboutMe] = useState(false);
  const [aboutMeDraft, setAboutMeDraft] = useState(aboutMe);
  const minAboutMe = 500;

  // Handler für Speichern der kurzen Beschreibung
  const handleSaveShortDescription = async (newText: string) => {
    if (!user || !profile) return;
    
    try {
      // Konvertiere aktuelle Verfügbarkeit zu String-Array für Datenbank
      const dbAvailability: Record<string, string[]> = {};
      for (const [day, slots] of Object.entries(availability)) {
        dbAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
      }
      
      await caretakerProfileService.saveProfile(user.id, {
        ...profile,
        services: profile.services || [],
        animalTypes: profile.animal_types || [],
        prices: profile.prices || {},
        serviceRadius: profile.service_radius || 0,
        availability: dbAvailability,
        homePhotos: profile.home_photos || [],
        qualifications: profile.qualifications || [],
        experienceDescription: profile.experience_description || '',
        shortAboutMe: newText,
        longAboutMe: profile.long_about_me || '',
      });
      
      setShortDescription(newText);
      setProfile((prev: any) => ({ ...prev, short_about_me: newText }));
      setEditShortDesc(false);
    } catch (error) {
      console.error('Fehler beim Speichern der kurzen Beschreibung:', error);
    }
  };

  // Handler für Speichern der langen Beschreibung
  const handleSaveAboutMe = async (newText: string) => {
    if (!user || !profile) return;
    
    try {
      // Konvertiere aktuelle Verfügbarkeit zu String-Array für Datenbank
      const dbAvailability: Record<string, string[]> = {};
      for (const [day, slots] of Object.entries(availability)) {
        dbAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
      }
      
      await caretakerProfileService.saveProfile(user.id, {
        ...profile,
        services: profile.services || [],
        animalTypes: profile.animal_types || [],
        prices: profile.prices || {},
        serviceRadius: profile.service_radius || 0,
        availability: dbAvailability,
        homePhotos: profile.home_photos || [],
        qualifications: profile.qualifications || [],
        experienceDescription: profile.experience_description || '',
        shortAboutMe: profile.short_about_me || '',
        longAboutMe: newText,
      });
      
      setAboutMe(newText);
      setProfile((prev: any) => ({ ...prev, long_about_me: newText }));
      setEditAboutMe(false);
    } catch (error) {
      console.error('Fehler beim Speichern der Über mich Beschreibung:', error);
    }
  };

  // State für Fotos-Tab
  const [photos, setPhotos] = useState<(string | File)[]>([]);
  const fileInputRefFotos = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function handlePhotoInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      setPhotos(prev => [...prev, ...Array.from(files)]);
    }
  }
  function handleDropFotos(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setPhotos(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }
  function handleDragOverFotos(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  // Hilfsfunktion: Upload eines einzelnen Bildes zu Supabase Storage
  async function uploadPhotoToSupabase(file: File, userId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('caretaker-home-photos').upload(fileName, file, { upsert: true });
    if (uploadError) {
      setPhotoError('Fehler beim Bildupload: ' + uploadError.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from('caretaker-home-photos').getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  }

  // Hilfsfunktion: Löschen eines Bildes aus Supabase Storage
  async function deletePhotoFromSupabase(url: string) {
    const match = url.match(/caretaker-home-photos\/([^?]+)/);
    const filePath = match ? match[1] : null;
    if (!filePath) return;
    await supabase.storage.from('caretaker-home-photos').remove([filePath]);
  }

  // Handler für neue Fotos (Upload + DB-Sync)
  async function handleAddPhotos(newFiles: FileList | File[]) {
    if (!user) return;
    setPhotoUploading(true);
    setPhotoError(null);
    const uploadedUrls: string[] = [];
    for (const file of Array.from(newFiles)) {
      const url = await uploadPhotoToSupabase(file, user.id);
      if (url) uploadedUrls.push(url);
    }
    // Update caretaker_profiles.home_photos
    const newPhotoList = [...(profile?.home_photos || []), ...uploadedUrls];
    // Konvertiere aktuelle Verfügbarkeit zu String-Array für Datenbank
    const dbAvailability: Record<string, string[]> = {};
    for (const [day, slots] of Object.entries(availability)) {
      dbAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
    }
    
    await caretakerProfileService.saveProfile(user.id, {
      ...profile,
      homePhotos: newPhotoList,
      services: profile.services || [],
      animalTypes: profile.animal_types || [],
      prices: profile.prices || {},
      serviceRadius: profile.service_radius || 0,
      availability: dbAvailability,
      qualifications: profile.qualifications || [],
      experienceDescription: profile.experience_description || '',
    });
    setPhotos(newPhotoList);
    setProfile((p: any) => ({ ...p, home_photos: newPhotoList }));
    setPhotoUploading(false);
  }

  // Handler für Löschen eines Fotos (Storage + DB)
  async function handleDeletePhoto(idx: number) {
    if (!user || !profile) return;
    const toDelete = photos[idx];
    if (typeof toDelete === 'string') {
      await deletePhotoFromSupabase(toDelete);
      const newPhotoList = photos.filter((_, i) => i !== idx).filter(Boolean) as string[];
      // Konvertiere aktuelle Verfügbarkeit zu String-Array für Datenbank
      const dbAvailability: Record<string, string[]> = {};
      for (const [day, slots] of Object.entries(availability)) {
        dbAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
      }
      
      await caretakerProfileService.saveProfile(user.id, {
        ...profile,
        homePhotos: newPhotoList,
        services: profile.services || [],
        animalTypes: profile.animal_types || [],
        prices: profile.prices || {},
        serviceRadius: profile.service_radius || 0,
        availability: dbAvailability,
        qualifications: profile.qualifications || [],
        experienceDescription: profile.experience_description || '',
      });
      setPhotos(newPhotoList);
      setProfile((p: any) => ({ ...p, home_photos: newPhotoList }));
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await caretakerProfileService.getProfile(user.id);
        if (error) {
          console.error('Caretaker profile loading error:', error);
          // Für 406 Fehler oder PGRST116 (not found) erstelle ein leeres Profil
          if (error.message?.includes('PGRST116') || error.code === 'PGRST116') {
            console.log('No caretaker profile found, creating empty profile for user:', user.id);
            setProfile(null); // Zeige Setup-Guide an
          } else {
            setError('Fehler beim Laden des Profils!');
          }
          setLoading(false);
          return;
        }

        setProfile(data);
        
        // Texte-States und Verfügbarkeit aktualisieren wenn Profil geladen wird
        if (data) {
          setShortDescription((data as any).short_about_me || '');
          setShortDescDraft((data as any).short_about_me || '');
          setAboutMe((data as any).long_about_me || '');
          setAboutMeDraft((data as any).long_about_me || '');
          
          // Aktualisiere skillsDraft mit geladenen Daten
          const loadedPrices = (data as any).prices || {};
          // Stelle sicher, dass Standard-Preisfelder immer vorhanden sind
          const mergedPrices = { ...defaultPriceFields, ...loadedPrices };
          
          setSkillsDraft({
            services: (data as any).services || [],
            animal_types: (data as any).animal_types || [],
            qualifications: (data as any).qualifications || [],
            experience_description: (data as any).experience_description || '',
            prices: mergedPrices,
            languages: (data as any).languages || [],
            isCommercial: (data as any).is_commercial || false,
            companyName: (data as any).company_name || '',
            taxNumber: (data as any).tax_number || '',
            vatId: (data as any).vat_id || '',
          });
          
          // Aktualisiere Fotos-State - filtere ungültige URLs
          const validPhotos = ((data as any).home_photos || [])
            .filter((url: string) => url && typeof url === 'string' && !url.includes('undefined') && !url.includes('null'));
          setPhotos(validPhotos);
          
          // Verfügbarkeit aus der Datenbank laden und validieren
          const dbAvailability = (data as any).availability;
        if (dbAvailability && typeof dbAvailability === 'object') {
          // Konvertiere String-Array-Daten zu TimeSlot-Objekten
          const validatedAvailability: AvailabilityState = {};
          
          for (const day of ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']) {
            const daySlots = dbAvailability[day];
            if (Array.isArray(daySlots)) {
              validatedAvailability[day] = daySlots
                .map((timeItem: any) => {
                  if (typeof timeItem === 'string' && timeItem.includes('-')) {
                    const [start, end] = timeItem.split('-');
                    return { start: start.trim(), end: end.trim() };
                  }
                  // Für Rückwärtskompatibilität: Falls bereits TimeSlot-Objekte
                  if (typeof timeItem === 'object' && timeItem?.start && timeItem?.end) {
                    return { start: timeItem.start, end: timeItem.end };
                  }
                  return null;
                })
                .filter((slot): slot is { start: string; end: string } => 
                  slot !== null && slot.start && slot.end
                );
            } else {
              validatedAvailability[day] = [];
            }
          }
          
          setAvailability(validatedAvailability);
        } else {
          // Falls keine Verfügbarkeit in der DB, verwende Default-Verfügbarkeit und speichere sie
          setAvailability(defaultAvailability);
          // Default-Verfügbarkeit auch in DB speichern für neuen Benutzer
          setTimeout(async () => {
            try {
              // Konvertiere Default-Verfügbarkeit zu String-Array für Datenbank
              const dbDefaultAvailability: Record<string, string[]> = {};
              for (const [day, slots] of Object.entries(defaultAvailability)) {
                dbDefaultAvailability[day] = slots.map(slot => `${slot.start}-${slot.end}`);
              }
              
              await caretakerProfileService.saveProfile(user.id, {
                services: (data as any).services || [],
                animalTypes: (data as any).animal_types || [],
                prices: (data as any).prices || {},
                serviceRadius: (data as any).service_radius || 0,
                availability: dbDefaultAvailability,
                homePhotos: (data as any).home_photos || [],
                qualifications: (data as any).qualifications || [],
                experienceDescription: (data as any).experience_description || '',
                shortAboutMe: (data as any).short_about_me || '',
                longAboutMe: (data as any).long_about_me || '',
                languages: (data as any).languages || [],
              });
            } catch (error) {
              console.error('Fehler beim Speichern der Default-Verfügbarkeit:', error);
            }
          }, 100);
        }
        }
      } catch (err) {
        console.error('Unexpected error loading caretaker profile:', err);
        setError('Unerwarteter Fehler beim Laden des Profils');
      }
      
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    setCaretakerData({
      phoneNumber: userProfile?.phone_number || '',
      email: user?.email || '',
      plz: userProfile?.plz || '',
      street: userProfile?.street || '',
      city: userProfile?.city || ''
    });
  }, [userProfile, user]);

  // Zusätzlicher useEffect für robustes Profile-Loading nach Registrierung
  useEffect(() => {
    const ensureProfileLoaded = async () => {
      if (user && !userProfile && !authLoading && profileLoadAttempts < 5) {
        console.log(`🔄 CaretakerDashboard: userProfile missing, attempt ${profileLoadAttempts + 1}/5`);
        setProfileLoadAttempts(prev => prev + 1);
        
        // Verzögerung zwischen Versuchen
        await new Promise(resolve => setTimeout(resolve, 300 * (profileLoadAttempts + 1)));
        
        try {
          const { userService } = await import('../lib/supabase/db');
          const { data: freshProfile, error } = await userService.getUserProfile(user.id);
          
          if (!error && freshProfile) {
            console.log('✅ CaretakerDashboard: Profile manually reloaded:', freshProfile);
                         // Zwinge einen Re-Render durch setzen der careTakerData
             setCaretakerData({
               phoneNumber: freshProfile.phone_number || '',
               email: user.email || '',
               plz: freshProfile.plz || '',
               street: (freshProfile as any).street || '',
               city: freshProfile.city || ''
             });
          }
        } catch (error) {
          console.error('❌ CaretakerDashboard: Failed to manually reload profile:', error);
        }
      }
    };

    ensureProfileLoaded();
  }, [user, userProfile, authLoading, profileLoadAttempts]);

  // Dummy-Upload-Handler (hier bitte später echten Upload zu Supabase Storage einbauen)
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // TODO: Upload zu Supabase Storage und Update der Profilbild-URL im User-Profil
    // Simuliere Upload
    setTimeout(() => {
      setUploading(false);
      // Nach Upload: Profilbild neu laden (hier ggf. fetchProfile() oder setProfile aktualisieren)
    }, 1500);
  };

  const handlePhoneNumberChange = (value: string) => {
    const phoneRegex = /^[+\d\s-]*$/;
    if (phoneRegex.test(value)) {
      setCaretakerData(d => ({ ...d, phoneNumber: value }));
    }
  };
  const handleEmailChange = (value: string) => {
    setCaretakerData(d => ({ ...d, email: value }));
    if (value.trim() === '') {
      setEmailError('E-Mail-Adresse ist ein Pflichtfeld');
    } else if (!/^\S+@\S+\.\S+$/.test(value)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
    } else {
      setEmailError(null);
    }
  };
  const handleSaveCaretakerData = async () => {
    if (!user) return;

    try {
      // Prepare data for updateProfile
      const dataToUpdate: { [key: string]: any } = {};

      // Only include fields that have changed
      if (caretakerData.phoneNumber !== (userProfile?.phone_number || '')) dataToUpdate.phoneNumber = caretakerData.phoneNumber;
      if (caretakerData.email !== (userProfile?.email || '')) dataToUpdate.email = caretakerData.email;
      if (caretakerData.street !== (userProfile?.street || '')) dataToUpdate.street = caretakerData.street;

      // Handle PLZ and City logic
      const plzChanged = caretakerData.plz !== (userProfile?.plz || '');
      const cityChanged = caretakerData.city !== (userProfile?.city || '');

      if (plzChanged || cityChanged) {
        // Add PLZ and City to dataToUpdate for users table
        dataToUpdate.plz = caretakerData.plz;
        dataToUpdate.location = caretakerData.city;
      }

      // If no fields have changed, exit without saving
      if (Object.keys(dataToUpdate).length === 0) {
        setEditData(false);
        return;
      }

      // Import userService
      const { userService } = await import('../lib/supabase/db');

      // Call the service to update the user profile
      const { data: updatedProfile, error: updateError } = await userService.updateUserProfile(user.id, dataToUpdate);

      if (updateError) {
        console.error('Fehler beim Speichern der Kontaktdaten:', updateError);
      } else {
        setEditData(false);
      }
    } catch (e) {
      console.error('Exception beim Speichern der Kontaktdaten:', e);
    }
  };
  const handleCancelEdit = () => {
    setCaretakerData({
      phoneNumber: userProfile?.phone_number || '',
      email: user?.email || '',
      plz: userProfile?.plz || '',
      street: userProfile?.street || '',
      city: userProfile?.city || ''
    });
    setEditData(false);
  };

  // Fallback-Profil für leere userProfile
  const fallbackProfile = {
    first_name: user?.email?.split('@')[0] || 'Benutzer',
    last_name: '',
    email: user?.email || '',
    phone_number: '',
    plz: '',
    city: '',
    user_type: 'caretaker' as const,
    avatar_url: null
  };

  // Hilfsfunktion für Initialen
  function getInitials(first: string | null | undefined, last: string | null | undefined) {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    if (l) return l.slice(0, 2).toUpperCase();
    return 'NN';
  }

  // Profilquelle: userProfile (users-Tabelle)!
  const profileData = userProfile || fallbackProfile;
  const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.email;
  const initials = getInitials(profileData.first_name, profileData.last_name);
  // Sichere Avatar-URL mit Fallback für fehlerhafte URLs
  const getAvatarUrl = () => {
    const profileUrl = profileData.profile_photo_url || profileData.avatar_url;
    if (profileUrl && !profileUrl.includes('undefined') && !profileUrl.includes('null')) {
      return profileUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f3f4f6&color=374151&length=2`;
  };
  
  const avatarUrl = getAvatarUrl();

  // Tab-Navigation für Übersicht/Fotos
  const [activeTab, setActiveTab] = useState<'uebersicht' | 'fotos' | 'texte' | 'kunden' | 'bewertungen' | 'sicherheit' | 'mitgliedschaften'>('uebersicht');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Clients/Kunden State
  const [clients, setClients] = useState<ClientData[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  // Bewertungen laden
  useEffect(() => {
    async function fetchReviews() {
      if (!user) return;
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, user_id, users(first_name, last_name)')
        .eq('caretaker_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setReviews(data);
      setReviewsLoading(false);
    }
    if (activeTab === 'bewertungen') fetchReviews();
  }, [activeTab, user]);

  // Kunden laden
  useEffect(() => {
    async function fetchClients() {
      if (!user || !profile?.id) return;
      setClientsLoading(true);
      setClientsError(null);
      try {
        const { data, error } = await ownerCaretakerService.getCaretakerClients(profile.id);
        if (error) {
          setClientsError('Fehler beim Laden der Kunden!');
          setClients([]);
        } else {
          // Transformiere die Daten auf das ClientData Format
          const transformedClients = (data || []).map((client: any) => ({
            id: client.id,
            name: client.name,
            phoneNumber: client.phoneNumber, // Korrigiert: phoneNumber statt phone
            email: client.email,
            address: client.address,
            city: client.city,
            plz: client.plz,
            vetName: client.vetName,
            vetAddress: client.vetAddress,
            vetPhone: client.vetPhone,
            emergencyContactName: client.emergencyContactName,
            emergencyContactPhone: client.emergencyContactPhone,
            pets: client.pets || [],
            services: client.services || [],
            otherWishes: client.otherWishes || [],
            shareSettings: client.shareSettings
          }));
          
          setClients(transformedClients);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Kunden:', error);
        setClientsError('Fehler beim Laden der Kunden!');
        setClients([]);
      } finally {
        setClientsLoading(false);
      }
    }
    if (activeTab === 'kunden') fetchClients();
  }, [activeTab, user, profile?.id]);

  // Kunden löschen
  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;

    // Finde den Kunden-Namen für die Bestätigungsabfrage
    const client = clients.find(c => c.id === clientId);
    const clientName = client?.name || 'diesen Kunden';

    try {
      const { error } = await ownerCaretakerService.removeCaretaker(clientId, user.id);
      if (error) {
        console.error('Fehler beim Entfernen des Kunden:', error);
        alert('Fehler beim Entfernen des Kunden. Bitte versuchen Sie es erneut.');
        return;
      }

      // Aktualisiere lokalen State
      setClients(prev => prev.filter(client => client.id !== clientId));

      // Erfolgsbenachrichtigung
      alert(`${clientName} wurde erfolgreich entfernt und hat keinen Zugriff mehr auf Ihre Kontaktdaten.`);
    } catch (error) {
      console.error('Fehler beim Entfernen des Kunden:', error);
      alert('Fehler beim Entfernen des Kunden. Bitte versuchen Sie es erneut.');
    }
  };

  // Sicherheit Tab - Passwort ändern
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // E-Mail ändern State
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState<string | null>(null);

  // E-Mail-Validierung
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Passwort ändern Handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPasswordError(null);
    setPasswordSuccess(false);

    // Validierung
    if (!passwordData.currentPassword) {
      setPasswordError('Bitte gib dein aktuelles Passwort ein.');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('Bitte gib ein neues Passwort ein.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.');
      return;
    }

    try {
      setPasswordLoading(true);

      // Erst das aktuelle Passwort verifizieren
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setPasswordError('Das aktuelle Passwort ist nicht korrekt.');
        return;
      }

      // Neues Passwort setzen
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setPasswordError('Fehler beim Aktualisieren des Passworts: ' + updateError.message);
        return;
      }

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Erfolg nach 3 Sekunden ausblenden
      setTimeout(() => setPasswordSuccess(false), 3000);

    } catch (error: any) {
      console.error('Fehler beim Ändern des Passworts:', error);
      setPasswordError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Konto löschen
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Konto löschen Handler
  const handleDeleteAccount = async () => {
    if (!user) return;

    if (deleteAccountConfirmation !== 'KONTO LÖSCHEN') {
      alert('Bitte gib "KONTO LÖSCHEN" in das Bestätigungsfeld ein.');
      return;
    }

    const finalConfirmation = window.confirm(
      'Bist du dir absolut sicher, dass du dein Konto löschen möchtest?\n\n' +
      '⚠️ WARNUNG: Diese Aktion kann nicht rückgängig gemacht werden!\n\n' +
      '• Alle deine Profildaten werden gelöscht\n' +
      '• Alle Nachrichten und Konversationen werden gelöscht\n' +
      '• Alle Kundendaten werden gelöscht\n' +
      '• Du verlierst den Zugang zu deinem Konto\n\n' +
      'Klicke OK, um dein Konto endgültig zu löschen.'
    );

    if (!finalConfirmation) return;

    try {
      setDeleteAccountLoading(true);

      // Import der userService deleteUser Funktion
      const { userService } = await import('../lib/supabase/db');
      const { error } = await userService.deleteUser(user.id);

      if (error) {
        console.error('Fehler beim Löschen des Kontos:', error);
        alert('Fehler beim Löschen des Kontos. Bitte versuche es erneut oder kontaktiere den Support.');
        return;
      }

      // Der User wird automatisch ausgeloggt durch die deleteUser Funktion
      alert('Dein Konto wurde erfolgreich gelöscht. Du wirst zur Startseite weitergeleitet.');
      
      // Navigation zur Startseite erfolgt automatisch durch den Auth-Context
    } catch (error: any) {
      console.error('Fehler beim Löschen des Kontos:', error);
      alert('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder kontaktiere den Support.');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  // Robusteres Loading mit Profile-Check
  const isReallyLoading = authLoading || loading || (user && !userProfile && profileLoadAttempts < 3);
  
  if (isReallyLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner />
            {user && !userProfile && profileLoadAttempts > 0 && (
              <p className="mt-4 text-gray-600">Lade Profil-Daten... (Versuch {profileLoadAttempts}/3)</p>
            )}
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nicht angemeldet</h2>
          <p className="text-gray-600">Bitte melde dich an, um dein Dashboard zu sehen.</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }
  
  // Wenn kein Caretaker-Profil existiert, erstelle ein Fallback oder zeige Setup-Guide
  if (!profile && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Caretaker-Profil vervollständigen</h2>
          <p className="text-gray-600 mb-6">
            Du hast noch kein vollständiges Caretaker-Profil. Vervollständige deine Registrierung, um dein Dashboard zu nutzen.
          </p>
          <a
            href="/registrieren?type=caretaker"
            className="btn btn-primary"
          >
            Profil vervollständigen
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profilkarte */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="relative w-32 h-32 mx-auto lg:mx-0">
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-32 h-32 rounded-xl object-cover border-4 border-primary-100 shadow"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f3f4f6&color=374151&length=2`;
                if (target.src !== fallbackUrl) {
                  target.src = fallbackUrl;
                }
              }}
            />
            {/* Overlay-Button für Upload */}
            <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-primary-50 transition-colors border border-gray-200">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
                disabled={uploading}
              />
              <Camera className="h-5 w-5 text-primary-600" />
            </label>
            {uploading && <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl"><div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Name */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    {editData && (
                      <div className="group relative">
                        <Info className="h-5 w-5 text-blue-500 cursor-help" />
                        <div className="absolute left-0 top-8 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          <div className="font-medium mb-1">Name ändern</div>
                          <div>Der Name kann nur über das Kontaktformular oder den Support geändert werden.</div>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile?.is_verified && (
                      <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
                        <Verified className="h-2.5 w-2.5 mr-1" /> Verifiziert
                      </span>
                    )}
                    {profile?.is_commercial && (
                      <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center">
                        <Briefcase className="h-2.5 w-2.5 mr-1" /> Pro
                      </span>
                    )}
                    {userProfile?.premium_badge && (
                      <PremiumBadge 
                        planType="premium" 
                        size="sm"
                      />
                    )}
                  </div>
                  <div className="mt-3">
                    <Link
                      to={`/betreuer/${user?.id}`}
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Zu meinem Profil
                    </Link>
                  </div>
                </div>
              </div>
              {/* Kontaktdaten */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Kontaktdaten</h3>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    aria-label="Kontaktdaten bearbeiten"
                    onClick={() => setEditData(!editData)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {!editData ? (
                    <>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div className="text-gray-700">
                          {caretakerData.street && (
                            <div>{caretakerData.street}</div>
                          )}
                          <div>
                            {caretakerData.plz && caretakerData.city ?
                              `${caretakerData.plz} ${caretakerData.city}` :
                              caretakerData.plz ? caretakerData.plz :
                              caretakerData.city ? caretakerData.city :
                              '—'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{caretakerData.phoneNumber || '—'}</span>
                      </div>

                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Straße & Hausnummer</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={caretakerData.street}
                          onChange={e => setCaretakerData(d => ({ ...d, street: e.target.value }))}
                          placeholder="Straße und Hausnummer"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                          <input
                            type="text"
                            className="input w-full"
                            value={caretakerData.plz}
                            onChange={e => setCaretakerData(d => ({ ...d, plz: e.target.value }))}
                            placeholder="PLZ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                          <input
                            type="text"
                            className="input w-full"
                            value={caretakerData.city}
                            onChange={e => setCaretakerData(d => ({ ...d, city: e.target.value }))}
                            placeholder="Ort"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
                        <input
                          type="tel"
                          className="input w-full"
                          value={caretakerData.phoneNumber}
                          onChange={e => handlePhoneNumberChange(e.target.value)}
                          placeholder="+49 123 456789"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                                                  <button
                            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                            onClick={handleSaveCaretakerData}
                          >
                            Speichern
                          </button>
                        <button
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          onClick={handleCancelEdit}
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tab-Navigation (jetzt unter der Profilkarte) */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('uebersicht')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'uebersicht'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('fotos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'fotos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fotos
            </button>
            <button
              onClick={() => setActiveTab('texte')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'texte'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Über mich
            </button>
            <button
              onClick={() => setActiveTab('kunden')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'kunden'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kunden
            </button>
            <button
              onClick={() => setActiveTab('bewertungen')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bewertungen'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bewertungen
            </button>
            <button
              onClick={() => setActiveTab('sicherheit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sicherheit'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sicherheit
            </button>
            <button
              onClick={() => setActiveTab('mitgliedschaften')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'mitgliedschaften'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mitgliedschaften
            </button>
          </nav>
        </div>
      </div>
      {/* Tab-Inhalt */}
      {activeTab === 'uebersicht' && (
        <>
          {/* Leistungen & Qualifikationen */}
          <div className="mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2"><Shield className="w-5 h-5" /> Leistungen & Qualifikationen</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-6 mb-8 relative">
            {!editSkills && (
              <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-primary-600" onClick={() => setEditSkills(true)} title="Bearbeiten">
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
            {!editSkills ? (
              <>
                <div className="mb-2">
                  <span className="font-semibold">Leistungen:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.services?.length ? profile.services.map((s: string) => (
                      <span key={s} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">{s}</span>
                    )) : <span className="text-gray-400">Keine Angaben</span>}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Tierarten:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.animal_types?.length ? profile.animal_types.map((a: string) => (
                      <span key={a} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{a}</span>
                    )) : <span className="text-gray-400">Keine Angaben</span>}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Qualifikationen:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.qualifications?.length ? profile.qualifications.map((q: string) => (
                      <span key={q} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{q}</span>
                    )) : <span className="text-gray-400">Keine Angaben</span>}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Beschreibung:</span>
                  <div className="mt-1 text-gray-700 text-sm whitespace-pre-line">{profile.experience_description || <span className="text-gray-400">Keine Angaben</span>}</div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Sprachen:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.languages?.length ? profile.languages.map((lang: string) => (
                      <span key={lang} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{lang}</span>
                    )) : <span className="text-gray-400">Keine Angaben</span>}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Preise:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.prices ? Object.entries(profile.prices).map(([k, v]: [string, any]) => (
                      <span key={k} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">{k}: {v} €</span>
                    )) : <span className="text-gray-400">Keine Angaben</span>}
                  </div>
                </div>
                {/* Commercial Information */}
                {profile.is_commercial && (
                  <div className="mb-2">
                    <div className="mb-2">
                      <span className="font-semibold">Gewerblicher Betreuer</span>
                    </div>
                    {profile.company_name && (
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Firmenname:</span> {profile.company_name}
                      </div>
                    )}
                    {profile.tax_number && (
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Steuernummer:</span> {profile.tax_number}
                      </div>
                    )}
                    {profile.vat_id && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">USt-IdNr.:</span> {profile.vat_id}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleSaveSkills(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Leistungen</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Default-Checkboxen */}
                    {defaultServices.map((s: string) => (
                      <label key={s} className={`px-2 py-1 rounded text-xs cursor-pointer border ${skillsDraft.services.includes(s) ? 'bg-primary-100 text-primary-700 border-primary-300' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <input type="checkbox" className="mr-1" checked={skillsDraft.services.includes(s)} onChange={e => handleSkillsChange('services', e.target.checked ? [...skillsDraft.services, s] : skillsDraft.services.filter((x: string) => x !== s))} />
                        {s}
                      </label>
                    ))}
                    {/* Individuelle Leistungen als Chips */}
                    {skillsDraft.services.filter((s: string) => !defaultServices.includes(s)).map((s: string) => (
                      <span key={s} className="flex items-center px-2 py-1 rounded text-xs bg-primary-100 text-primary-700 border border-primary-300">
                        {s}
                        <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => handleSkillsChange('services', skillsDraft.services.filter((x: string) => x !== s))} title="Entfernen">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input className="input w-40" placeholder="Neue Leistung" value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newService.trim()) { handleSkillsChange('services', [...skillsDraft.services, newService.trim()]); setNewService(''); } }} />
                    <button type="button" className="text-green-600 hover:bg-green-50 rounded p-1" disabled={!newService.trim()} onClick={() => { handleSkillsChange('services', [...skillsDraft.services, newService.trim()]); setNewService(''); }} title="Hinzufügen"><Check className="w-4 h-4" /></button>
                    <button type="button" className="text-gray-400 hover:text-red-500 rounded p-1" onClick={() => setNewService('')} title="Abbrechen"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tierarten</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Default-Checkboxen */}
                    {defaultAnimals.map((a: string) => (
                      <label key={a} className={`px-2 py-1 rounded text-xs cursor-pointer border ${skillsDraft.animal_types.includes(a) ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <input type="checkbox" className="mr-1" checked={skillsDraft.animal_types.includes(a)} onChange={e => handleSkillsChange('animal_types', e.target.checked ? [...skillsDraft.animal_types, a] : skillsDraft.animal_types.filter((x: string) => x !== a))} />
                        {a}
                      </label>
                    ))}
                    {/* Individuelle Tierarten als Chips */}
                    {skillsDraft.animal_types.filter((a: string) => !defaultAnimals.includes(a)).map((a: string) => (
                      <span key={a} className="flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-300">
                        {a}
                        <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => handleSkillsChange('animal_types', skillsDraft.animal_types.filter((x: string) => x !== a))} title="Entfernen">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input className="input w-40" placeholder="Neue Tierart" value={newAnimal} onChange={e => setNewAnimal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newAnimal.trim()) { handleSkillsChange('animal_types', [...skillsDraft.animal_types, newAnimal.trim()]); setNewAnimal(''); } }} />
                    <button type="button" className="text-green-600 hover:bg-green-50 rounded p-1" disabled={!newAnimal.trim()} onClick={() => { handleSkillsChange('animal_types', [...skillsDraft.animal_types, newAnimal.trim()]); setNewAnimal(''); }} title="Hinzufügen"><Check className="w-4 h-4" /></button>
                    <button type="button" className="text-gray-400 hover:text-red-500 rounded p-1" onClick={() => setNewAnimal('')} title="Abbrechen"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Qualifikationen</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Default-Checkboxen */}
                    {defaultQualifications.map((q: string) => (
                      <label key={q} className={`px-2 py-1 rounded text-xs cursor-pointer border ${skillsDraft.qualifications.includes(q) ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <input type="checkbox" className="mr-1" checked={skillsDraft.qualifications.includes(q)} onChange={e => handleSkillsChange('qualifications', e.target.checked ? [...skillsDraft.qualifications, q] : skillsDraft.qualifications.filter((x: string) => x !== q))} />
                        {q}
                      </label>
                    ))}
                    {/* Individuelle Qualifikationen als Chips */}
                    {skillsDraft.qualifications.filter((q: string) => !defaultQualifications.includes(q)).map((q: string) => (
                      <span key={q} className="flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-300">
                        {q}
                        <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => handleSkillsChange('qualifications', skillsDraft.qualifications.filter((x: string) => x !== q))} title="Entfernen">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input className="input w-40" placeholder="Neue Qualifikation" value={newQualification} onChange={e => setNewQualification(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newQualification.trim()) { handleSkillsChange('qualifications', [...skillsDraft.qualifications, newQualification.trim()]); setNewQualification(''); } }} />
                    <button type="button" className="text-green-600 hover:bg-green-50 rounded p-1" disabled={!newQualification.trim()} onClick={() => { handleSkillsChange('qualifications', [...skillsDraft.qualifications, newQualification.trim()]); setNewQualification(''); }} title="Hinzufügen"><Check className="w-4 h-4" /></button>
                    <button type="button" className="text-gray-400 hover:text-red-500 rounded p-1" onClick={() => setNewQualification('')} title="Abbrechen"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sprachen</label>
                  <LanguageSelector
                    selectedLanguages={skillsDraft.languages}
                    onChange={(languages) => handleSkillsChange('languages', languages)}
                  />
                </div>
                <div>
                  <CommercialInfoInput
                    isCommercial={skillsDraft.isCommercial}
                    companyName={skillsDraft.companyName}
                    taxNumber={skillsDraft.taxNumber}
                    vatId={skillsDraft.vatId}
                    onIsCommercialChange={(value) => {
                      handleSkillsChange('isCommercial', value);
                      if (!value) {
                        handleSkillsChange('companyName', '');
                        handleSkillsChange('taxNumber', '');
                        handleSkillsChange('vatId', '');
                      }
                    }}
                    onCompanyNameChange={(value) => handleSkillsChange('companyName', value)}
                    onTaxNumberChange={(value) => handleSkillsChange('taxNumber', value)}
                    onVatIdChange={(value) => handleSkillsChange('vatId', value)}
                    errors={{
                      taxNumber: skillsDraft.isCommercial && !skillsDraft.taxNumber.trim() ? 'Steuernummer ist bei gewerblichen Betreuern erforderlich' : undefined
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beschreibung</label>
                  <textarea
                    className="input w-full min-h-[60px]"
                    value={skillsDraft.experience_description}
                    onChange={e => handleSkillsChange('experience_description', e.target.value)}
                    placeholder="Erzähle den Tierbesitzern von deiner Erfahrung mit Tieren, inkl. beruflicher Erfahrung oder eigenen Tieren"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preise</label>
                  <div className="space-y-3">
                    {/* Standard-Preisfelder wie bei der Anmeldung */}
                    {Object.entries(defaultPriceFields).map(([service, _]) => (
                      <div key={service} className="flex items-center gap-4">
                        <label className="w-56 text-gray-700">{priceFieldLabels[service as keyof typeof priceFieldLabels]}</label>
                        <input 
                          type="text" 
                          inputMode="decimal"
                          className="input w-32" 
                          placeholder="€" 
                          value={skillsDraft.prices[service] || ''} 
                          onChange={e => handlePriceChange(service, e.target.value)} 
                        />
                      </div>
                    ))}
                    
                    {/* Zusätzliche individuelle Preise */}
                    {Object.entries(skillsDraft.prices).filter(([k, _]) => !defaultPriceFields.hasOwnProperty(k)).map(([k, v], idx) => (
                      <div key={`price-${idx}`} className="flex gap-2 items-center">
                        <input className="input w-32" placeholder="Leistung" value={k} onChange={e => {
                          const newKey = e.target.value;
                          const newPrices = { ...skillsDraft.prices };
                          delete newPrices[k];
                          newPrices[newKey] = v;
                          handleSkillsChange('prices', newPrices);
                        }} />
                        <input 
                          type="text" 
                          inputMode="decimal"
                          className="input w-24" 
                          placeholder="Preis (€)" 
                          value={String(v)} 
                          onChange={e => handlePriceChange(k, e.target.value)} 
                        />
                        <button type="button" className="text-red-500 hover:bg-red-50 rounded p-1" onClick={() => handleRemovePrice(k)} title="Entfernen"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    ))}
                    <button type="button" className="text-primary-600 hover:bg-primary-50 rounded px-2 py-1 text-xs" onClick={handleAddPrice}>+ Zusätzlichen Preis hinzufügen</button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm">Speichern</button>
                  <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm" onClick={handleCancelSkills}>Abbrechen</button>
                </div>
              </form>
            )}
          </div>

          {/* Verfügbarkeit */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900"><Calendar className="w-5 h-5" /> Verfügbarkeit</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <AvailabilityScheduler
                availability={availability}
                onAvailabilityChange={handleSaveAvailability}
              />
            </div>
          </div>


        </>
      )}
      {activeTab === 'fotos' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
              <Upload className="w-5 h-5" /> 
              Umgebungsbilder
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {photos.length}/{maxEnvironmentImages()} Bilder
              </span>
            </div>
          </div>
          
          {/* Subscription Gate for Non-Professional Users */}
          {maxEnvironmentImages() === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">
                    Professional-Mitgliedschaft erforderlich
                  </h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    Umgebungsbilder sind nur für Professional-Mitglieder verfügbar. 
                    Zeige deine Betreuungsumgebung und gewinne das Vertrauen von Tierbesitzern.
                  </p>
                  <button
                    onClick={() => setActiveTab('mitgliedschaften')}
                    className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                  >
                    Jetzt upgraden
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
                maxEnvironmentImages() === 0 || photos.length >= maxEnvironmentImages()
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 cursor-pointer hover:bg-gray-50'
              }`}
              onClick={() => {
                if (maxEnvironmentImages() === 0 || photos.length >= maxEnvironmentImages()) return;
                fileInputRefFotos.current?.click();
              }}
              onDrop={async e => { 
                e.preventDefault(); 
                if (maxEnvironmentImages() === 0 || photos.length >= maxEnvironmentImages()) return;
                await handleAddPhotos(e.dataTransfer.files); 
              }}
              onDragOver={handleDragOverFotos}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRefFotos}
                onChange={async e => { if (e.target.files) await handleAddPhotos(e.target.files); }}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                {maxEnvironmentImages() === 0 ? (
                  <Lock className="w-8 h-8 text-gray-400 mb-1" />
                ) : photos.length >= maxEnvironmentImages() ? (
                  <Lock className="w-8 h-8 text-gray-400 mb-1" />
                ) : (
                  <Upload className="w-8 h-8 text-primary-400 mb-1" />
                )}
                
                <span className={`font-medium ${
                  maxEnvironmentImages() === 0 || photos.length >= maxEnvironmentImages()
                    ? 'text-gray-500'
                    : 'text-gray-700'
                }`}>
                  {maxEnvironmentImages() === 0
                    ? 'Professional-Mitgliedschaft erforderlich'
                    : photos.length >= maxEnvironmentImages()
                    ? `Limit erreicht (${maxEnvironmentImages()} Bilder)`
                    : 'Bilder hierher ziehen oder klicken, um hochzuladen'
                  }
                </span>
                
                {maxEnvironmentImages() === 0 || photos.length >= maxEnvironmentImages() ? (
                  <span className="text-xs text-gray-400">
                    {maxEnvironmentImages() === 0 
                      ? 'Upgrade auf Professional für Umgebungsbilder'
                      : 'Professional-Mitglieder können bis zu 6 Bilder hochladen'
                    }
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">JPG, PNG, max. 5MB pro Bild</span>
                )}
              </div>
              {photoUploading && <div className="mt-2 text-primary-600 text-sm">Bilder werden hochgeladen...</div>}
              {photoError && <div className="mt-2 text-red-500 text-sm">{photoError}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              {photos.length ? photos.map((fileOrUrl, idx) => {
                const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
                return (
                  <div key={idx} className="relative group">
                    <img src={url} alt="Wohnungsfoto" className="h-24 w-24 object-cover rounded border" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-gray-400 hover:text-red-500"
                      onClick={() => handleDeletePhoto(idx)}
                      title="Foto entfernen"
                      disabled={photoUploading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              }) : <span className="text-gray-400">Keine Fotos hochgeladen</span>}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'texte' && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow p-6 mb-8 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Kurze Beschreibung</h2>
              {!editShortDesc && (
                <button className="p-2 text-gray-400 hover:text-primary-600 absolute top-4 right-4" onClick={() => { setEditShortDesc(true); setShortDescDraft(shortDescription); }} title="Bearbeiten">
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!editShortDesc ? (
              <div className="text-gray-700 min-h-[32px]">{shortDescription || <span className="text-gray-400">Noch keine Beschreibung hinterlegt.</span>}</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleSaveShortDescription(shortDescDraft); }}>
                <textarea
                  className="input w-full min-h-[48px]"
                  maxLength={maxShortDesc}
                  value={shortDescDraft}
                  onChange={e => setShortDescDraft(e.target.value)}
                  placeholder="Fasse dich kurz – z.B. 'Erfahrene Hundesitterin aus Berlin, liebevoll & zuverlässig.'"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${shortDescDraft.length > maxShortDesc ? 'text-red-500' : 'text-gray-400'}`}>{shortDescDraft.length}/{maxShortDesc} Zeichen</span>
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs" disabled={shortDescDraft.length > maxShortDesc}>Speichern</button>
                    <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs" onClick={() => setEditShortDesc(false)}>Abbrechen</button>
                  </div>
                </div>
              </form>
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-6 mb-8 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Über mich</h2>
              {!editAboutMe && (
                <button className="p-2 text-gray-400 hover:text-primary-600 absolute top-4 right-4" onClick={() => { setEditAboutMe(true); setAboutMeDraft(aboutMe); }} title="Bearbeiten">
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!editAboutMe ? (
              <div className="text-gray-700 min-h-[32px]">{aboutMe || <span className="text-gray-400">Noch kein Text hinterlegt.</span>}</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleSaveAboutMe(aboutMeDraft); }}>
                <textarea
                  className="input w-full min-h-[160px]"
                  value={aboutMeDraft}
                  onChange={e => setAboutMeDraft(e.target.value)}
                  minLength={minAboutMe}
                  placeholder="Erzähle mehr über dich, deine Motivation, Erfahrung und was dich als Betreuer:in auszeichnet. Mindestens 540 Zeichen."
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${aboutMeDraft.length < minAboutMe ? 'text-red-500' : 'text-gray-400'}`}>{aboutMeDraft.length} Zeichen (min. {minAboutMe})</span>
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs" disabled={aboutMeDraft.length < minAboutMe}>Speichern</button>
                    <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs" onClick={() => setEditAboutMe(false)}>Abbrechen</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {activeTab === 'kunden' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Shield className="h-5 w-5" />
            Kunden
          </h2>
          
          {clientsLoading ? (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-gray-500">Kunden werden geladen ...</div>
            </div>
          ) : clientsError ? (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-red-500">{clientsError}</div>
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">
                <h3 className="font-medium text-lg mb-2">Noch keine Kunden vorhanden</h3>
                <p className="text-sm">
                  Kunden erscheinen hier automatisch, wenn sie dich als Betreuer speichern.<br />
                  Teile dein Profil mit Tierbesitzern oder werde über die Suche gefunden!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4 text-sm">
                Hier siehst du alle Tierbesitzer, die dich als Betreuer gespeichert haben. 
                Klicke auf einen Namen, um die freigegebenen Informationen zu sehen.
              </p>
              <ClientDetailsAccordion clients={clients} onDeleteClient={handleDeleteClient} />
            </div>
          )}
        </div>
      )}
      {activeTab === 'bewertungen' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900">Bewertungen</h2>
          <div className="bg-white rounded-xl shadow p-6">
            {reviewsLoading ? (
              <div className="text-gray-400">Bewertungen werden geladen...</div>
            ) : reviews.length === 0 ? (
              <div className="text-gray-400">Noch keine Bewertungen vorhanden.</div>
            ) : (
              <div className="space-y-6">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b last:border-b-0 pb-4 mb-4 last:mb-0 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-1 mb-1 sm:mb-0">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-5 h-5 ${i <= r.rating ? 'text-yellow-400 fill-yellow-300' : 'text-gray-300'}`} fill={i <= r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 font-medium">{r.users?.first_name || ''} {r.users?.last_name || ''}</div>
                      <div className="text-gray-600 text-sm whitespace-pre-line">{r.comment || <span className="text-gray-400">(Kein Kommentar)</span>}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-auto sm:text-right">{r.created_at ? new Date(r.created_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'sicherheit' && (
        <div className="space-y-8">
          {/* E-Mail-Adresse ändern */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">E-Mail-Adresse ändern</h2>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailChangeError(null);
                setEmailChangeSuccess(null);
                setEmailChangeLoading(true);
                // Validierung
                if (!newEmail.trim() || !currentPasswordForEmail.trim()) {
                  setEmailChangeError('Bitte füllen Sie alle Felder aus.');
                  setEmailChangeLoading(false);
                  return;
                }
                if (!validateEmail(newEmail)) {
                  setEmailChangeError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                  setEmailChangeLoading(false);
                  return;
                }
                if (newEmail.trim() === user?.email) {
                  setEmailChangeError('Die neue E-Mail-Adresse muss sich von der aktuellen unterscheiden.');
                  setEmailChangeLoading(false);
                  return;
                }
                // Passwort prüfen und E-Mail ändern
                try {
                  // 1. Passwort prüfen
                  const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email!,
                    password: currentPasswordForEmail
                  });
                  if (signInError) {
                    setEmailChangeError('Das aktuelle Passwort ist nicht korrekt.');
                    setEmailChangeLoading(false);
                    return;
                  }
                  // 2. E-Mail ändern
                  const { error: updateError } = await supabase.auth.updateUser({
                    email: newEmail.trim()
                  });
                  if (updateError) {
                    setEmailChangeError('Fehler beim Ändern der E-Mail-Adresse: ' + updateError.message);
                    setEmailChangeLoading(false);
                    return;
                  }
                  setEmailChangeSuccess('E-Mail-Änderung eingeleitet! Bitte bestätigen Sie die Änderung über den Link, der an Ihre alte E-Mail-Adresse gesendet wurde.');
                  setNewEmail('');
                  setCurrentPasswordForEmail('');
                } catch (err: any) {
                  setEmailChangeError('Ein unerwarteter Fehler ist aufgetreten.');
                } finally {
                  setEmailChangeLoading(false);
                }
              }}
              className="space-y-6"
            >
              {/* Hinweis in gelblicher Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Wichtiger Hinweis</p>
                    <p>
                      Die Bestätigung der Änderung wird an Ihre <strong>alte E-Mail-Adresse</strong> gesendet 
                      und muss dort bestätigt werden, bevor die neue E-Mail-Adresse aktiv wird.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Links: Aktuelle E-Mail */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Aktuelle E-Mail</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      className="input w-full bg-gray-100 cursor-not-allowed"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>

                {/* Rechts: Neue E-Mail + Passwort */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Neue E-Mail</h3>
                  <div className="space-y-4">
                    {/* Neue E-Mail */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neue E-Mail-Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="input w-full"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="neue@email.de"
                        required
                      />
                    </div>

                    {/* Aktuelles Passwort */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aktuelles Passwort <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        className="input w-full"
                        value={currentPasswordForEmail}
                        onChange={e => setCurrentPasswordForEmail(e.target.value)}
                        placeholder="Ihr aktuelles Passwort"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fehler und Erfolg */}
              {emailChangeError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {emailChangeError}
                </div>
              )}

              {emailChangeSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="h-4 w-4" />
                  {emailChangeSuccess}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={emailChangeLoading}
                >
                  {emailChangeLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Wird geändert...
                    </div>
                  ) : (
                    'E-Mail ändern'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Passwort ändern */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <KeyRound className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Passwort ändern</h2>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Links: Aktuelles Passwort */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Aktuelles Passwort</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aktuelles Passwort <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        className="input pr-10 w-full"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Dein aktuelles Passwort"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        tabIndex={-1}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rechts: Neues Passwort */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Neues Passwort</h3>
                  <div className="space-y-4">
                    {/* Neues Passwort */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neues Passwort <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          className="input pr-10 w-full"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Mindestens 8 Zeichen"
                          disabled={passwordLoading}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          tabIndex={-1}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Passwort bestätigen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neues Passwort bestätigen <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          className="input pr-10 w-full"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Neues Passwort wiederholen"
                          disabled={passwordLoading}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          tabIndex={-1}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fehler und Erfolg */}
              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="h-4 w-4" />
                  Passwort erfolgreich geändert!
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Wird geändert...
                    </div>
                  ) : (
                    'Passwort ändern'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Konto löschen */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Gefährlicher Bereich</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-900 mb-2">Konto löschen</h3>
              <p className="text-red-700 text-sm mb-4">
                ⚠️ <strong>Warnung:</strong> Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht. 
                Dies umfasst dein Profil, alle Nachrichten, Kundendaten und alle anderen mit deinem Konto verbundenen Informationen.
              </p>
              
              <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-900 mb-2">Was wird gelöscht:</h4>
                <ul className="text-red-800 text-sm space-y-1">
                  <li>• Dein komplettes Betreuer-Profil</li>
                  <li>• Alle Nachrichten und Konversationen</li>
                  <li>• Alle gespeicherten Kundendaten</li>
                  <li>• Alle Bewertungen und Feedback</li>
                  <li>• Alle hochgeladenen Fotos</li>
                  <li>• Dein Benutzerkonto und Login-Daten</li>
                </ul>
              </div>

              {!showDeleteConfirmation ? (
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Konto löschen
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Um dein Konto zu löschen, gib <strong>"KONTO LÖSCHEN"</strong> in das Feld ein:
                    </label>
                    <input
                      type="text"
                      className="input w-full max-w-xs border-red-300 focus:border-red-500 focus:ring-red-500"
                      value={deleteAccountConfirmation}
                      onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
                      placeholder="KONTO LÖSCHEN"
                      disabled={deleteAccountLoading}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountConfirmation !== 'KONTO LÖSCHEN' || deleteAccountLoading}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteAccountLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Wird gelöscht...
                        </div>
                      ) : (
                        'Konto endgültig löschen'
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setDeleteAccountConfirmation('');
                      }}
                      disabled={deleteAccountLoading}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors text-sm font-medium"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mitgliedschaften Tab */}
      {activeTab === 'mitgliedschaften' && (
        <div className="space-y-8">
          {/* Aktueller Mitgliedschaftsstatus */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Deine Mitgliedschaft</h2>
            
            {isPremiumUser ? (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 mb-1">
                      Premium-Mitglied
                    </h3>
                    <p className="text-amber-700 mb-4">
                      Du bist Premium-Mitglied und genießt alle Vorteile der Plattform.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-amber-900">Deine Vorteile:</h4>
                        <ul className="space-y-1 text-sm text-amber-700">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" />
                            Unbegrenzte Kontaktanfragen
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" />
                            Werbefreie Nutzung
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" />
                            Premium-Badge in deinem Profil
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" />
                            Priorität in Suchergebnissen
                          </li>
                        </ul>
                      </div>
                      
                      {subscription && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-amber-900">Abo-Details:</h4>
                          <div className="space-y-1 text-sm text-amber-700">
                            <div>Plan: {subscription.plan_type === 'premium' ? 'Premium' : 'Professional'}</div>
                            <div>Status: {subscription.status === 'active' ? 'Aktiv' : subscription.status}</div>
                            {subscription.ends_at && (
                              <div>Verlängert sich am: {new Date(subscription.ends_at).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Basic-Mitglied
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Du nutzt derzeit die kostenlose Basic-Version.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Aktuelle Limits:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-gray-500" />
                            3 Kontaktanfragen pro Monat
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-gray-500" />
                            Werbung wird angezeigt
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-gray-500" />
                            Grundlegende Sichtbarkeit
                          </li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Mit Premium erhältst du:</h4>
                        <ul className="space-y-1 text-sm text-green-600">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Unbegrenzte Kontaktanfragen
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Werbefreie Nutzung
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Premium-Badge
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Höhere Priorität in Suche
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <Link
                      to="/pricing"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Jetzt Premium werden
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={paymentSuccess.isOpen}
        onClose={closeModal}
        planType={paymentSuccess.planType}
        userType={paymentSuccess.userType}
        sessionData={paymentSuccess.sessionData}
      />
    </div>
  );
}

export default CaretakerDashboardPage; 