import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Clock, Heart, Briefcase, PawPrint, CheckCircle, X, ChevronDown, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import MultiDaySelector from '../components/ui/MultiDaySelector';
import { useAuth } from '../lib/auth/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userProfile, loading: authLoading } = useAuth();
  const [showMessage, setShowMessage] = useState(!!location.state?.message);
  const [formLocation, setFormLocation] = useState('');
  const [service, setService] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');

  // Redirect eingeloggte Benutzer zum Dashboard
  useEffect(() => {
    // Wenn ein Passwort-Reset-Link aufgerufen wurde, leite zur Reset-Seite weiter
    // und verhindere den Login-Redirect
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      navigate('/reset-password' + window.location.hash, { replace: true });
      return;
    }

    if (isAuthenticated && !authLoading && userProfile) {
      const userType = userProfile.user_type;
      const dashboardPath = (userType === 'caretaker' || userType === 'dienstleister' ||
        userType === 'tierarzt' || userType === 'hundetrainer' ||
        userType === 'tierfriseur' || userType === 'physiotherapeut' ||
        userType === 'ernaehrungsberater' || userType === 'tierfotograf' ||
        userType === 'sonstige')
        ? '/dashboard-caretaker'
        : '/dashboard-owner';

      console.log('🏠 HomePage redirect - userType:', userType, 'dashboardPath:', dashboardPath);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, userProfile, navigate]);



  const availabilityTimeOptions = [
    { value: '', label: 'Uhrzeit auswählen...' },
    { value: 'alle', label: 'Alle Zeiten' },
    { value: 'morgens', label: 'Morgens (6-12 Uhr)' },
    { value: 'mittags', label: 'Mittags (12-18 Uhr)' },
    { value: 'abends', label: 'Abends (18-22 Uhr)' },
    { value: 'ganztags', label: 'Ganztags verfügbar' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Search functionality

    const queryParams = new URLSearchParams();
    if (service) queryParams.append('service', service);
    if (formLocation) queryParams.append('location', formLocation);
    if (selectedDays.length > 0) {
      selectedDays.forEach(day => queryParams.append('availabilityDay', day));
    }
    if (selectedTime && selectedTime !== '') {
      // Wenn "Alle Zeiten" ausgewählt ist, setze leeren Wert
      const timeValue = selectedTime === 'alle' ? '' : selectedTime;
      queryParams.append('availabilityTime', timeValue);
    }
    navigate(`/suche?${queryParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Success Message */}
      {showMessage && location.state?.message && (
        <div className="bg-green-50 border border-green-200 px-4 py-3 relative">
          <div className="flex items-center justify-between container-custom">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{location.state.message}</span>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 🎁 FREE PREMIUM PROMOTION BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Row 1: Headline + Benefits */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-center">
            <span className="text-2xl sm:text-3xl">🎁</span>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight">3 Monate gratis Premium</span>
              <span className="hidden sm:inline mx-2 opacity-60">·</span>
              <span className="block sm:inline text-white/90 text-sm sm:text-base mt-0.5 sm:mt-0">Keine Kreditkarte · Keine Kündigung nötig</span>
            </div>
          </div>
          {/* Row 2: Deadline pill */}
          <div className="mt-2 sm:mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium text-center">
              <span>🗓️</span>
              <span>Gilt für alle Anmeldungen bis zum <strong className="ml-1">30. April 2026</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Linke Seite: Text */}
            <div className="space-y-6 animate-fade-in flex flex-col items-center md:items-start">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 text-center md:text-left">
                Finde liebevolle<br />
                <span className="text-primary-600 font-bold">Tierbetreuung</span><br />
                in deiner Nähe
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xl text-center md:text-left">
                tigube verbindet Tierhalter:innen mit geprüften, engagierten Betreuungspersonen. Egal ob Hund, Katze oder Kleintier – hier findest du zuverlässige Hilfe für Alltag, Urlaub & Notfälle.
              </p>
              <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4 max-w-xl w-full">

                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="service" className="text-sm font-medium text-gray-700 mb-1">Ich suche</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="service"
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${service ? 'text-gray-900' : 'text-gray-400'}`}
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                    >
                      <option value="" className="text-gray-400">Ich suche...</option>
                      <option value="Gassi-Service" className="text-gray-900">Gassi-Service</option>
                      <option value="Haustierbetreuung" className="text-gray-900">Haustierbetreuung</option>
                      <option value="Übernachtung" className="text-gray-900">Übernachtung</option>
                      <option value="Kurzbesuche" className="text-gray-900">Kurzbesuche</option>
                      <option value="Haussitting" className="text-gray-900">Haussitting</option>
                      <option value="Katzenbetreuung" className="text-gray-900">Katzenbetreuung</option>
                      <option value="Hundetagesbetreuung" className="text-gray-900">Hundetagesbetreuung</option>
                      <option value="Kleintierbetreuung" className="text-gray-900">Kleintierbetreuung</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1">PLZ oder Ort</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="location"
                      type="text"
                      placeholder="Dein Wohnort"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <MultiDaySelector
                    selectedDays={selectedDays}
                    onDaysChange={setSelectedDays}
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="availabilityTime" className="text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="availabilityTime"
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white ${selectedTime && selectedTime !== '' ? 'text-gray-900' : 'text-gray-400'}`}
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    >
                      {availabilityTimeOptions.map(option => (
                        <option
                          key={option.value}
                          value={option.value}
                          className={option.value === '' ? 'text-gray-400' : 'text-gray-900'}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="md:col-span-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-auto"
                >
                  <Search className="w-5 h-5" /> Finde einen Tiersitter
                </button>
              </form>
              <div className="mt-4">
                {/* Demo-Button entfernt */}
              </div>
              <div className="flex gap-4 mt-2">
              </div>
            </div>
            {/* Rechte Seite: Bild mit Overlay */}
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-primary-50 rounded-3xl scale-95 z-0" />
              <img
                src="https://images.pexels.com/photos/7210349/pexels-photo-7210349.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Frau mit Hund auf dem Arm"
                className="relative rounded-2xl shadow-xl w-full max-w-md object-cover z-10"
              />
              {/* Overlay-Badge */}
              <div className="absolute top-6 right-6 bg-white/90 rounded-xl shadow px-4 py-2 flex items-center gap-2 z-20">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                <span className="font-bold text-gray-900 text-lg">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">So funktioniert tigube?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Für Tierhalter:innen */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Für Tierhalter:innen</h3>
              <p className="text-gray-700 mb-6">
                Finde zuverlässige Betreuung für dein Tier – einfach, sicher und transparent.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Einfach & kostenlos registrieren</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Betreuungspersonen nach Ort, Tierart & Verfügbarkeit filtern</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Alle Betreuer:innen geprüft & gebrieft</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Transparente Profile</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Ideal für Berufstätige, Urlaube, Notfälle oder den Alltag</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Für Betreuungspersonen */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Für Betreuungspersonen</h3>
              <p className="text-gray-700 mb-6">
                Werde Teil unserer Community und biete deine Tierbetreuung an.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Sichtbar werden für lokale Tierhalter</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Eigene Betreuung anbieten & Profil gestalten</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Kostenlos starten – mit professioneller Unterstützung</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Verlässliches Matching & direkte Anfragen</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Teil einer wachsenden Community</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Warum tigube? */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Warum tigube?</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Vertrauen, Erfahrung und Leidenschaft für Tiere
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<UserCheck className="w-8 h-8" />}
              title="Geprüfte Betreuungspersonen"
              description="Alle Tierbetreuer:innen werden vor Freischaltung sorgfältig ausgewählt, geprüft und geschult"
            />
            <FeatureCard
              icon={<PawPrint className="w-8 h-8" />}
              title="Für alle Tiere"
              description="Ob Hund, Katze oder Meerschweinchen – bei tigube findest du passende Unterstützung"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Alltag & Notfall"
              description="Ob regelmäßig oder spontan – wir bringen euch zuverlässig zusammen"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Erfahrung aus der Praxis"
              description="tigube wurde von echten Tierprofis entwickelt – mit Herz, Verstand und jahrzehntelanger Erfahrung"
            />
          </div>
        </div>
      </section>

      {/* Von Tiermenschen für Tiermenschen */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Von Tiermenschen für Tiermenschen</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 lg:p-12">
              {/* Bilder Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="/Image/tigube_Gabriel_Haaga.jpg"
                    alt="Gabriel Haaga"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="/Image/tigube_Tamara_Pfaff.jpg"
                    alt="Tamara Pfaff"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="/Image/Boxer_Hund_Luna.jpg"
                    alt="Luna - Boxer Hund"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                  Mara und Gabriel haben tigube gegründet, denn sie wissen aus erster Hand, wie schwer es sein kann, gute Betreuung für geliebte Vierbeiner zu finden.
                </p>
                <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                  Aus ihrer langjährigen Arbeit in der eigenen Hundepension und Katzenbetreuung entstand der Wunsch, eine digitale Lösung zu schaffen – zuverlässig, menschlich und professionell.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Mit über einem Dutzend Aus- und Weiterbildungen (u. a. Hundetraining, Problemhundeberatung, Tierernährung, Sachkundenachweise, Tierschutzgesetz, …) bringen sie nicht nur Fachwissen, sondern echte Leidenschaft mit.
                </p>
              </div>
            </div>
            <div className="bg-primary-50 px-8 lg:px-12 py-6">
              <p className="text-center text-gray-700 italic">
                tigube ist das Ergebnis dieser Vision: eine Plattform, die Vertrauen schafft – und Tierliebe mit Alltag vereinbar macht.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Häufige Fragen */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Häufige Fragen</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="Welche Tiere kann ich betreuen lassen?"
              answer="tigube vermittelt Betreuung für Hunde, Katzen und andere Kleintiere."
            />
            <FAQItem
              question="Wie finde ich jemanden in meiner Nähe?"
              answer="Mit deiner Postleitzahl und Filtern zur Tierart und Verfügbarkeit findest du passende Betreuung in deiner Umgebung."
            />
            <FAQItem
              question="Wie wird sichergestellt, dass die Sitter:innen geeignet sind?"
              answer="Alle Betreuungspersonen durchlaufen einen strukturierten Check und ein Onboarding durch das tigube-Team."
            />
            <FAQItem
              question="Kann ich selbst Tierbetreuung anbieten?"
              answer="Ja! Registriere dich als Dienstleister und erstelle dein Profil."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-3 p-8 md:p-12 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-3xl font-bold">Bereit für mehr (Planungs-) Sicherheit im Alltag – für dich und dein Tier?</h2>
                </div>
                <p className="text-gray-600 mb-8 max-w-xl">
                  tigube bringt zusammen, was zusammengehört.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/registrieren')}
                  >
                    🐾 Kostenlos starten
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/registrieren?type=caretaker')}
                  >
                    Als Betreuer starten
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Kostenlose Registrierung • Keine versteckten Gebühren • Jederzeit kündbar
                </p>
              </div>
              <div className="lg:col-span-2 relative hidden lg:block">
                <img
                  src="https://images.pexels.com/photos/2123773/pexels-photo-2123773.jpeg?auto=compress&cs=tinysrgb"
                  alt="Happy dog with caretaker"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-center p-6">
      <div className="rounded-full bg-primary-50 p-4 inline-flex mb-4 text-primary-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}
