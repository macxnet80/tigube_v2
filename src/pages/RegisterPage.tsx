import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { auth, supabase } from '../lib/supabase/client';
import { userService } from '../lib/supabase/db';
import { useAuth } from '../lib/auth/AuthContext';

type RegistrationUserType = 'tierhalter' | 'betreuer' | 'dienstleister';

function mapSearchParamToUserType(type: string | null): RegistrationUserType {
  if (!type) return 'tierhalter';
  const t = type.toLowerCase();
  if (t === 'caregiver' || t === 'caretaker') return 'betreuer';
  if (t === 'dienstleister') return 'dienstleister';
  return 'tierhalter';
}

/** DB-Wert für users.user_type bei Tierhalter (Kompatibilität mit bestehender App) */
const BETREUER_KATEGORIE_ID_FALLBACK = 1;

function capitalizeFirstChar(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isSonstigeCategory(category: { name: string } | undefined): boolean {
  return category?.name.trim().toLowerCase() === 'sonstige';
}

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateProfileState, isAuthenticated, userProfile, loading: authLoading } = useAuth();
  const initialType = searchParams.get('type');

  // Redirect if already authenticated and have profile
  React.useEffect(() => {
    // Verhindere Redirect, wenn ein Passwort-Recovery-Hash vorhanden ist
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      navigate('/reset-password' + window.location.hash, { replace: true });
      return;
    }

    if (isAuthenticated && userProfile && !authLoading) {
      console.log('🔄 Already authenticated with profile, redirecting to dashboard...');
      const dashboardPath = (userProfile.user_type === 'caretaker' || userProfile.user_type === 'dienstleister' ||
        userProfile.user_type === 'tierarzt' || userProfile.user_type === 'hundetrainer' ||
        userProfile.user_type === 'tierfriseur' || userProfile.user_type === 'physiotherapeut' ||
        userProfile.user_type === 'ernaehrungsberater' || userProfile.user_type === 'tierfotograf' ||
        userProfile.user_type === 'sonstige')
        ? '/dashboard-caretaker'
        : '/dashboard-owner';
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, userProfile, authLoading, navigate]);

  const [userType, setUserType] = useState<RegistrationUserType>(() => mapSearchParamToUserType(initialType));

  // Dienstleister-Kategorie State (nur für "weitere Dienstleister"; ohne Betreuer im Dropdown)
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [categories, setCategories] = useState<Array<{ id: number, name: string, beschreibung: string, icon: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriesWithoutBetreuer = React.useMemo(
    () => categories.filter((cat) => cat.name.toLowerCase() !== 'betreuer'),
    [categories]
  );

  // Kategorien laden (nur für Dropdown "weitere Dienstleister")
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('dienstleister_kategorien' as any)
          .select('id, name, beschreibung, icon')
          .eq('is_active', true)
          .order('sortierung');

        if (error) throw error;
        setCategories((data as any) || []);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
      }
    };

    if (userType === 'dienstleister') {
      loadCategories();
    }
  }, [userType]);

  // Default-Auswahl: erste Kategorie ohne Betreuer
  React.useEffect(() => {
    if (userType !== 'dienstleister' || categoriesWithoutBetreuer.length === 0) return;
    const firstId = categoriesWithoutBetreuer[0].id;
    if (selectedCategory === 0 || !categoriesWithoutBetreuer.some((c) => c.id === selectedCategory)) {
      setSelectedCategory(firstId);
    }
  }, [userType, categoriesWithoutBetreuer, selectedCategory]);

  // Onboarding wird nach Dashboard-Load angezeigt, nicht mehr hier

  // Formular-Daten für Schritt 1 (Grundlegende Kontoinformationen)
  const [formStep1, setFormStep1] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);

  /** Freitext bei Kategorie „Sonstige“ → caretaker_profiles.freie_dienstleistung */
  const [freieDienstleistung, setFreieDienstleistung] = useState('');

  // Funktion zum Abschließen der Registrierung (vereinfacht)
  const completeRegistration = async () => {
    setError(null);

    // Validierung für Schritt 1
    if (!formStep1.firstName || !formStep1.lastName || !formStep1.email || !formStep1.password) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    if (formStep1.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (!formStep1.termsAccepted) {
      setError('Bitte akzeptiere die Nutzungsbedingungen und Datenschutzbestimmungen.');
      return;
    }

    let dienstleisterCategoryId = selectedCategory;
    if (userType === 'dienstleister') {
      if (categoriesWithoutBetreuer.length === 0) {
        setError('Die Dienstleistungskategorien werden noch geladen oder sind nicht verfügbar. Bitte kurz warten und erneut versuchen.');
        return;
      }
      dienstleisterCategoryId =
        selectedCategory && categoriesWithoutBetreuer.some((c) => c.id === selectedCategory)
          ? selectedCategory
          : categoriesWithoutBetreuer[0].id;

      const catMeta = categories.find((c) => c.id === dienstleisterCategoryId);
      if (isSonstigeCategory(catMeta) && !freieDienstleistung.trim()) {
        setError('Bitte beschreibe kurz deine Dienstleistung bei der Kategorie „Sonstige“.');
        return;
      }
    }

    try {
      setLoading(true);
      // Benutzer bei Supabase registrieren
      const { data, error } = await auth.signUp(
        formStep1.email,
        formStep1.password,
        {
          options: {
            data: {
              full_name: `${formStep1.firstName} ${formStep1.lastName}`,
              first_name: formStep1.firstName,
              last_name: formStep1.lastName
            }
          }
        }
      );

      if (error) throw error;

      if (data.user) {
        const dbUserTypeForInsert: 'owner' | 'caretaker' | 'dienstleister' =
          userType === 'tierhalter' ? 'owner' : userType === 'betreuer' ? 'caretaker' : 'dienstleister';

        // Benutzer in users-Tabelle anlegen
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: formStep1.email,
            first_name: formStep1.firstName,
            last_name: formStep1.lastName,
            user_type: dbUserTypeForInsert,
            profile_completed: false // Profile ist noch nicht vollständig
          });

        if (insertError) {
          setError("Profil konnte nicht gespeichert werden. Bitte versuche es erneut.");
          return;
        }

        const mapCategoryToSpecificUserType = (name: string | undefined) => {
          const n = name?.toLowerCase() ?? '';
          return n === 'betreuer' ? 'caretaker' :
            n === 'tierarzt' ? 'tierarzt' :
              n === 'hundetrainer' ? 'hundetrainer' :
                n === 'tierfriseur' ? 'tierfriseur' :
                  n === 'physiotherapeut' ? 'physiotherapeut' :
                    n === 'ernährungsberater' ? 'ernaehrungsberater' :
                      n === 'tierfotograf' ? 'tierfotograf' : 'sonstige';
        };

        // Betreuer: Caretaker-Profil mit Betreuer-Kategorie (ohne Dropdown)
        if (userType === 'betreuer') {
          const { error: profileError } = await supabase
            .from('caretaker_profiles')
            .insert({
              id: data.user.id,
              kategorie_id: BETREUER_KATEGORIE_ID_FALLBACK,
              dienstleister_typ: 'caretaker',
              bio: '',
              approval_status: 'not_requested'
            });

          if (profileError) {
            console.error('Fehler beim Erstellen des Betreuer-Profils:', profileError);
          }
        }

        // Weitere Dienstleister: Spezifischen user_type und Caretaker-Profil erstellen
        if (userType === 'dienstleister') {
          const selectedCat = categories.find((cat) => cat.id === dienstleisterCategoryId);

          const specificUserType = mapCategoryToSpecificUserType(selectedCat?.name);
          const freieText =
            isSonstigeCategory(selectedCat) ? capitalizeFirstChar(freieDienstleistung.trim()) : null;

          // Aktualisiere den user_type in der users-Tabelle
          const { error: updateError } = await supabase
            .from('users')
            .update({ user_type: specificUserType })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Fehler beim Aktualisieren des User-Types:', updateError);
          }

          // Erstelle das Caretaker-Profil
          const { error: profileError } = await supabase
            .from('caretaker_profiles')
            .insert({
              id: data.user.id,
              kategorie_id: dienstleisterCategoryId,
              dienstleister_typ: specificUserType,
              bio: '',
              freie_dienstleistung: freieText,
              approval_status: 'not_requested'
            });

          if (profileError) {
            console.error('Fehler beim Erstellen des Dienstleister-Profils:', profileError);
            // Nicht kritisch - kann später im Dashboard nachgeholt werden
          }
        }

        // Auth-Kontext robuste aktualisieren
        console.log('🔄 Starting robust profile update after registration...');
        let profileUpdated = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!profileUpdated && attempts < maxAttempts) {
          attempts++;
          try {
            // Kurze Verzögerung zwischen Versuchen
            await new Promise(resolve => setTimeout(resolve, 300 * attempts));

            console.log(`🔍 Profile update attempt ${attempts}/${maxAttempts}...`);
            const { data: freshProfile, error: freshProfileError } = await userService.getUserProfile(data.user.id);

            if (!freshProfileError && freshProfile) {
              // Profile erfolgreich geladen und ist vollständig
              updateProfileState(freshProfile);
              console.log(`✅ Profile state updated successfully on attempt ${attempts}:`, {
                id: freshProfile?.id || 'N/A',
                user_type: freshProfile?.user_type || 'N/A',
                first_name: freshProfile?.first_name || 'N/A'
              });
              profileUpdated = true;

              // Zusätzliche Pause für React State Update
              await new Promise(resolve => setTimeout(resolve, 200));

            } else if (freshProfileError) {
              console.warn(`⚠️ Profile update attempt ${attempts} failed:`, freshProfileError);
              if (attempts === maxAttempts) {
                // Auch bei Fehlern weitermachen - Dashboard kann mit basic profile arbeiten
                console.log('⚠️ Profile update failed, but continuing with basic auth...');
                profileUpdated = true;
              }
            }
          } catch (profileErr) {
            console.error(`❌ Error in profile update attempt ${attempts}:`, profileErr);
            if (attempts === maxAttempts) {
              // Bei kritischen Fehlern trotzdem weitermachen
              console.log('❌ Max profile update attempts reached, continuing anyway...');
              profileUpdated = true;
            }
          }
        }

        // Setze Onboarding-Flag für das Dashboard und leite direkt weiter
        try {
          const onboardingData: any = { userType, userName: formStep1.firstName };

          if (userType === 'betreuer') {
            onboardingData.categoryId = BETREUER_KATEGORIE_ID_FALLBACK;
            onboardingData.categoryName = 'Betreuer';
            onboardingData.specificUserType = 'caretaker';
          }

          // Für weitere Dienstleister: Kategorie-Informationen hinzufügen
          if (userType === 'dienstleister') {
            const selectedCat = categories.find((cat) => cat.id === dienstleisterCategoryId);
            onboardingData.categoryId = dienstleisterCategoryId;
            onboardingData.categoryName = selectedCat?.name || 'Dienstleister';
            const n = selectedCat?.name.toLowerCase() ?? '';
            onboardingData.specificUserType = n === 'betreuer' ? 'caretaker' :
              n === 'tierarzt' ? 'tierarzt' :
                n === 'hundetrainer' ? 'hundetrainer' :
                  n === 'tierfriseur' ? 'tierfriseur' :
                    n === 'physiotherapeut' ? 'physiotherapeut' :
                      n === 'ernährungsberater' ? 'ernaehrungsberater' :
                        n === 'tierfotograf' ? 'tierfotograf' : 'sonstige';
            if (isSonstigeCategory(selectedCat)) {
              onboardingData.freieDienstleistung = capitalizeFirstChar(freieDienstleistung.trim());
            }
          }

          sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
          console.log('✅ Onboarding data set for:', userType, onboardingData);
        } catch (e) {
          console.warn('⚠️ Konnte onboardingData nicht in sessionStorage setzen:', e);
        }

        // Registration completed
        if (typeof (window as any).Refgrow === 'function') {
          (window as any).Refgrow(0, 'signup', formStep1.email);
        }

        const dashboardPath = userType === 'tierhalter' ? '/dashboard-owner' : '/dashboard-caretaker';
        console.log('✅ Registration completed. Redirecting to dashboard for onboarding:', dashboardPath);
        window.location.href = dashboardPath;
      }
    } catch (err: any) {
      console.error('Fehler bei der Registrierung:', err);
      setError(err.message || 'Bei der Registrierung ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  // Modal-Completion entfällt hier, da Onboarding im Dashboard gestartet wird

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        {/* Headline & Beschreibung */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6">
            <img src="/Image/Logos/tigube_logo.svg" alt="tigube Logo" className="h-10 w-auto mr-2" />
          </Link>
          <h1 className="text-3xl font-bold mb-4">
            {userType === 'tierhalter' && 'Als Tierhalter registrieren'}
            {userType === 'betreuer' && 'Als Betreuer registrieren'}
            {userType === 'dienstleister' && 'Als Dienstleister registrieren'}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            {userType === 'tierhalter' &&
              'Erstelle ein Konto, um vertrauenswürdige Betreuer für deine Tiere zu finden.'}
            {userType === 'betreuer' &&
              'Erstelle ein Konto, um deine Betreuungsdienste anzubieten und Tierhalter zu erreichen.'}
            {userType === 'dienstleister' &&
              'Erstelle ein Konto, um deine Dienstleistungen anzubieten und Tierhalter zu erreichen.'}
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${userType === 'tierhalter'
                ? 'bg-primary-500 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => setUserType('tierhalter')}
            >
              Tierhalter
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${userType === 'betreuer'
                ? 'bg-primary-500 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => setUserType('betreuer')}
            >
              Betreuer
            </button>
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setUserType('dienstleister')}
              className={`text-sm transition-colors ${userType === 'dienstleister'
                ? 'text-primary-700 font-semibold underline'
                : 'text-primary-600 hover:text-primary-700 font-medium'
                }`}
            >
              weitere Dienstleister
            </button>
          </div>
        </div>

        {/* Dienstleister-Kategorie Auswahl (ohne Betreuer) */}
        {userType === 'dienstleister' && categoriesWithoutBetreuer.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Welche Dienstleistung bietest du an?</h2>
            <p className="text-gray-600 mb-6">Wähle die Kategorie, die am besten zu deinen Dienstleistungen passt.</p>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dienstleistungskategorie
              </label>
              <select
                value={selectedCategory || categoriesWithoutBetreuer[0]?.id}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  setSelectedCategory(id);
                  const cat = categoriesWithoutBetreuer.find((c) => c.id === id);
                  if (!isSonstigeCategory(cat)) {
                    setFreieDienstleistung('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categoriesWithoutBetreuer.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} - {category.beschreibung}
                  </option>
                ))}
              </select>

              {isSonstigeCategory(
                categoriesWithoutBetreuer.find((c) => c.id === (selectedCategory || categoriesWithoutBetreuer[0]?.id))
              ) && (
                <div className="mt-4">
                  <label htmlFor="freieDienstleistung" className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung deiner Dienstleistung
                  </label>
                  <input
                    id="freieDienstleistung"
                    type="text"
                    className="input w-full"
                    placeholder="z. B. Mobile Tierphysiotherapie"
                    value={freieDienstleistung}
                    onChange={(e) => setFreieDienstleistung(capitalizeFirstChar(e.target.value))}
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">Der erste Buchstabe wird automatisch groß geschrieben.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}



        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8 animate-fade-in">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6">Konto erstellen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="input"
                  placeholder="Dein Vorname"
                  value={formStep1.firstName}
                  onChange={(e) => setFormStep1({ ...formStep1, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="input"
                  placeholder="Dein Nachname"
                  value={formStep1.lastName}
                  onChange={(e) => setFormStep1({ ...formStep1, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                id="email"
                className="input"
                placeholder="deine.email@beispiel.de"
                value={formStep1.email}
                onChange={(e) => setFormStep1({ ...formStep1, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input pr-10"
                  placeholder="Sicheres Passwort erstellen"
                  value={formStep1.password}
                  onChange={(e) => setFormStep1({ ...formStep1, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mindestens 8 Zeichen, eine Zahl und ein Sonderzeichen
              </p>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                checked={formStep1.termsAccepted}
                onChange={(e) => setFormStep1({ ...formStep1, termsAccepted: e.target.checked })}
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                Ich akzeptiere die{' '}
                <Link to="/agb" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                  Nutzungsbedingungen
                  <ExternalLink className="h-3 w-3" />
                </Link>{' '}
                und{' '}
                <Link to="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                  Datenschutzbestimmungen
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </label>
            </div>
            <div className="flex justify-end mt-8">
              <Button
                variant="primary"
                onClick={completeRegistration}
                isLoading={loading}
                disabled={loading}
              >
                Jetzt Registrieren
              </Button>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Bereits registriert?{' '}
            <Link to="/anmelden" className="text-primary-600 hover:text-primary-700 font-medium">
              Jetzt anmelden
            </Link>
          </p>
        </div>

        {/* Onboarding-Modal wird jetzt im Dashboard angezeigt */}
      </div>
    </div>
  );
}

export default RegisterPage;