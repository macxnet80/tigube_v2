import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AvailabilityScheduler from '../components/ui/AvailabilityScheduler';
import OvernightAvailabilitySelector from '../components/ui/OvernightAvailabilitySelector';
import ClientDetailsAccordion from '../components/ui/ClientDetailsAccordion';
import LanguageSelector from '../components/ui/LanguageSelector';
import CommercialInfoInput from '../components/ui/CommercialInfoInput';
import type { ClientData } from '../components/ui/ClientDetailsAccordion';
import { useAuth } from '../lib/auth/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { caretakerProfileService, ownerCaretakerService, userService } from '../lib/supabase/db';
import { Calendar, Check, Edit, LogOut, MapPin, Phone, Shield, Upload, Camera, Star, Info, Lock, Briefcase, Verified, Eye, EyeOff, KeyRound, Trash2, AlertTriangle, Mail, X, Clock, Crown, Settings, PawPrint, Moon, CheckCircle, User, XCircle, ChevronRight, Stethoscope, GraduationCap, Scissors, Activity, Apple, MoreHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import PaymentSuccessModal from '../components/ui/PaymentSuccessModal';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';
import { PremiumBadge } from '../components/ui/PremiumBadge';
import { useSubscription } from '../lib/auth/useSubscription';
import RegistrationSuccessModal from '../components/ui/RegistrationSuccessModal';
import ProfileImageCropper from '../components/ui/ProfileImageCropper';
import AdvertisementBanner from '../components/ui/AdvertisementBanner';
import { DEFAULT_SERVICE_CATEGORIES, type ServiceCategory, type CategorizedService } from '../lib/types/service-categories';
import { ServiceUtils as SupabaseServiceUtils } from '../lib/supabase/service-categories';
import { useShortTermAvailability } from '../contexts/ShortTermAvailabilityContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import { VerificationService, type VerificationDocument } from '../lib/services/verificationService';

// Icon-Mapping für Dienstleister-Kategorien
const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    'stethoscope': Stethoscope,
    'graduation-cap': GraduationCap,
    'scissors': Scissors,
    'activity': Activity,
    'apple': Apple,
    'briefcase': Briefcase,
    'more-horizontal': MoreHorizontal
  };
  
  const IconComponent = icons[iconName] || Briefcase;
  return <IconComponent className="w-5 h-5" />;
};

interface DienstleisterKategorie {
  id: number;
  name: string;
  beschreibung: string;
  icon: string;
}

function DienstleisterDashboardPage() {
  const { user, userProfile, loading: authLoading, subscription, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const { isPremiumUser } = useSubscription();
  const { maxEnvironmentImages } = useFeatureAccess();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);

  // Dienstleister-spezifische States
  const [kategorien, setKategorien] = useState<DienstleisterKategorie[]>([]);
  const [selectedKategorie, setSelectedKategorie] = useState<number>(1);
  const [spezialisierungen, setSpezialisierungen] = useState<string[]>([]);
  const [behandlungsmethoden, setBehandlungsmethoden] = useState<string[]>([]);
  const [fachgebiete, setFachgebiete] = useState<string[]>([]);
  const [beratungsarten, setBeratungsarten] = useState<string[]>([]);
  const [freieDialenstleistung, setFreieDialenstleistung] = useState<string>('');
  const [notfallVerfuegbar, setNotfallVerfuegbar] = useState<boolean>(false);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [stilBeschreibung, setStilBeschreibung] = useState<string>('');

  // Onboarding-Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingUserName, setOnboardingUserName] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Payment Success Modal
  const { paymentSuccess, isValidating: paymentValidating, closeModal } = usePaymentSuccess();
  const [editData, setEditData] = useState(false);
  const [dienstleisterData, setDienstleisterData] = useState({
    phoneNumber: '',
    email: user?.email || '',
    plz: '',
    street: '',
    city: '',
    dateOfBirth: '',
    gender: ''
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Short-term availability state
  const { shortTermAvailable, setShortTermAvailable, loading: contextLoading } = useShortTermAvailability();
  const [shortTermLoading, setShortTermLoading] = useState(false);

  // Approval state
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Verification state
  const [verificationRequest, setVerificationRequest] = useState<VerificationDocument | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('not_submitted');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [ausweisFile, setAusweisFile] = useState<File | null>(null);
  const [zertifikatFiles, setZertifikatFiles] = useState<File[]>([]);

  // Overnight availability state
  const [overnightAvailability, setOvernightAvailability] = useState<Record<string, boolean>>({
    Mo: false,
    Di: false,
    Mi: false,
    Do: false,
    Fr: false,
    Sa: false,
    So: false,
  });

  // Load Dienstleister categories
  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const { data, error } = await supabase
          .from('dienstleister_kategorien' as any)
          .select('id, name, beschreibung, icon')
          .eq('is_active', true)
          .order('sortierung');
        
        if (error) throw error;
        setKategorien((data as unknown as DienstleisterKategorie[]) || []);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
      }
    };
    
    loadKategorien();
  }, []);

  // Onboarding nach Dashboard-Load starten
  useEffect(() => {
    if (!authLoading && user) {
      try {
        const raw = sessionStorage.getItem('onboardingData');
        if (raw) {
          const parsed = JSON.parse(raw) as { userType?: 'owner' | 'dienstleister'; userName?: string };
          console.log('🔍 Checking onboarding data:', parsed);
          if (parsed.userType === 'dienstleister') {
            console.log('✅ Starting dienstleister onboarding for:', parsed.userName);
            setOnboardingUserName(parsed.userName || 'Dienstleister');
            setShowOnboarding(true);
            sessionStorage.removeItem('onboardingData');
          }
        }
      } catch (e) {
        console.warn('⚠️ Konnte onboardingData nicht aus sessionStorage lesen:', e);
      }
    }
  }, [authLoading, user]);

  // Load profile data
  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await caretakerProfileService.getProfile(user.id);
      
      if (profileData) {
        setProfile(profileData);
        
        // Load Dienstleister-specific data
        if (profileData.kategorie_id) {
          setSelectedKategorie(profileData.kategorie_id);
        }
        if (profileData.spezialisierungen) {
          setSpezialisierungen(profileData.spezialisierungen);
        }
        if (profileData.behandlungsmethoden) {
          setBehandlungsmethoden(profileData.behandlungsmethoden);
        }
        if (profileData.fachgebiete) {
          setFachgebiete(profileData.fachgebiete);
        }
        if (profileData.beratungsarten) {
          setBeratungsarten(profileData.beratungsarten);
        }
        if (profileData.freie_dienstleistung) {
          setFreieDialenstleistung(profileData.freie_dienstleistung);
        }
        if (profileData.notfall_verfuegbar !== undefined) {
          setNotfallVerfuegbar(profileData.notfall_verfuegbar);
        }
        if (profileData.portfolio_urls) {
          setPortfolioUrls(profileData.portfolio_urls);
        }
        if (profileData.stil_beschreibung) {
          setStilBeschreibung(profileData.stil_beschreibung);
        }
        
        // Load basic data
        setDienstleisterData({
          phoneNumber: profileData.phone_number || '',
          email: profileData.email || user?.email || '',
          plz: profileData.plz || '',
          street: profileData.street || '',
          city: profileData.city || '',
          dateOfBirth: profileData.date_of_birth || '',
          gender: profileData.gender || ''
        });
      }
    } catch (err: any) {
      console.error('Fehler beim Laden des Profils:', err);
      setError('Profil konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !authLoading) {
      loadProfile();
    }
  }, [user?.id, authLoading]);

  // Save Dienstleister-specific data
  const saveDienstleisterData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const updateData = {
        kategorie_id: selectedKategorie,
        spezialisierungen,
        behandlungsmethoden,
        fachgebiete,
        beratungsarten,
        freie_dienstleistung: freieDialenstleistung,
        notfall_verfuegbar: notfallVerfuegbar,
        portfolio_urls: portfolioUrls,
        stil_beschreibung: stilBeschreibung
      };
      
      await caretakerProfileService.updateProfile(user.id, updateData);
      showSuccess('Dienstleister-Daten erfolgreich gespeichert!');
      await loadProfile();
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err);
      showError('Fehler beim Speichern der Daten.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    navigate('/anmelden');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fehler beim Laden</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadProfile}>Erneut versuchen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dienstleister Dashboard</h1>
              <p className="text-gray-600 mt-1">Verwalte dein Dienstleister-Profil und deine Angebote</p>
            </div>
            <div className="flex items-center space-x-4">
              {isPremiumUser && <PremiumBadge />}
              <Link to="/dienstleister" className="btn btn-outline">
                Zu "Wo finde ich...?"
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Dienstleister-Kategorie */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {selectedKategorie && kategorien.find(k => k.id === selectedKategorie) && 
                      getCategoryIcon(kategorien.find(k => k.id === selectedKategorie)?.icon || 'briefcase')
                    }
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Dienstleistungskategorie</h2>
                    <p className="text-gray-600">Wähle deine Hauptkategorie</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select
                    value={selectedKategorie}
                    onChange={(e) => setSelectedKategorie(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {kategorien.map((kategorie) => (
                      <option key={kategorie.id} value={kategorie.id}>
                        {kategorie.name} - {kategorie.beschreibung}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Spezialisierungen */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Spezialisierungen</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deine Spezialisierungen (durch Komma getrennt)
                  </label>
                  <input
                    type="text"
                    value={spezialisierungen.join(', ')}
                    onChange={(e) => setSpezialisierungen(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="z.B. Welpentraining, Verhaltenstherapie, Agility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fachgebiete & Methoden */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fachgebiete & Methoden</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Behandlungsmethoden
                  </label>
                  <input
                    type="text"
                    value={behandlungsmethoden.join(', ')}
                    onChange={(e) => setBehandlungsmethoden(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="z.B. Physiotherapie, Akupunktur"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fachgebiete
                  </label>
                  <input
                    type="text"
                    value={fachgebiete.join(', ')}
                    onChange={(e) => setFachgebiete(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="z.B. Orthopädie, Dermatologie"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Beratung & Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Beratung & Services</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beratungsarten
                  </label>
                  <input
                    type="text"
                    value={beratungsarten.join(', ')}
                    onChange={(e) => setBeratungsarten(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="z.B. Telefonberatung, Hausbesuch, Online-Beratung"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Freie Dienstleistungsbeschreibung
                  </label>
                  <textarea
                    value={stilBeschreibung}
                    onChange={(e) => setStilBeschreibung(e.target.value)}
                    placeholder="Beschreibe deinen Stil und deine Arbeitsweise..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Verfügbarkeit */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Verfügbarkeit</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notfall"
                    checked={notfallVerfuegbar}
                    onChange={(e) => setNotfallVerfuegbar(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notfall" className="text-sm font-medium text-gray-700">
                    Notfall-Verfügbarkeit (24/7 erreichbar)
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={saveDienstleisterData}
                disabled={loading}
                className="px-8"
              >
                {loading ? 'Speichere...' : 'Änderungen speichern'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil-Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kategorie gewählt</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spezialisierungen</span>
                  {spezialisierungen.length > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Beschreibung</span>
                  {stilBeschreibung ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Advertisement */}
            <AdvertisementBanner
              placement="profile_sidebar"
              targetingOptions={{
                subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
              }}
            />
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <RegistrationSuccessModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userName={onboardingUserName}
          userType="dienstleister"
        />
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <PaymentSuccessModal
          isOpen={paymentSuccess}
          onClose={closeModal}
          isValidating={paymentValidating}
        />
      )}
    </div>
  );
}

export default DienstleisterDashboardPage;
