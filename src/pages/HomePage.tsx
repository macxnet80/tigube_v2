import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Clock, Heart, Users, PawPrint, CheckCircle, X, ChevronDown, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/auth/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userProfile, loading: authLoading } = useAuth();
  const [showMessage, setShowMessage] = useState(!!location.state?.message);

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

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tierbetreuung, die verbindet.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              tigube bringt Tierhalter:innen und Betreuungspersonen zusammen –
              ehrlich, verlässlich und auf Augenhöhe.
            </p>
          </div>

          {/* Hero Image */}
          <div className="flex justify-center mb-10">
            <img
              src="/Image/Boxer_Hund_Luna.jpg"
              alt="Boxer Hund Luna – glücklich betreut mit tigube"
              className="w-full max-w-2xl rounded-2xl shadow-lg object-cover h-64 md:h-80"
            />
          </div>

          {/* Zwei Einstiegskarten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Karte Tierhalter */}
            <Link to="/fuer-tierhalter" className="group">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 h-full flex flex-col items-center text-center hover:shadow-lg transition-shadow hover:border-primary-200">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ich bin Tierhalter:in</h2>
                <p className="text-gray-600 mb-6 flex-grow">
                  Finde zuverlässige Betreuung für dein Tier – für Alltag, Urlaub oder den Notfall.
                </p>
                <span className="inline-flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                  Mehr erfahren →
                </span>
              </div>
            </Link>

            {/* Karte Betreuungsperson */}
            <Link to="/fuer-betreuungspersonen" className="group">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 h-full flex flex-col items-center text-center hover:shadow-lg transition-shadow hover:border-primary-200">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ich möchte betreuen</h2>
                <p className="text-gray-600 mb-6 flex-grow">
                  Werde sichtbar, gewinne neue Kunden und betreue Tiere, die du liebst.
                </p>
                <span className="inline-flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                  Mehr erfahren →
                </span>
              </div>
            </Link>
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
          <div className="text-center mt-6">
            <Link to="/faq" className="text-primary-600 hover:text-primary-700 font-medium">
              Alle Fragen ansehen →
            </Link>
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
