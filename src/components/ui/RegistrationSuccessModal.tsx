import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Heart, Search, MessageCircle, Star, PawPrint, Shield, Stethoscope, GraduationCap, Scissors, Camera, UtensilsCrossed, Activity } from 'lucide-react';
import Button from './Button';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  userType: 'owner' | 'caretaker';
  userName: string;
  categoryName?: string; // z.B. "Tierarzt", "Hundetrainer", "Betreuer"
  specificUserType?: string; // z.B. "tierarzt", "hundetrainer", "caretaker"
  onComplete: () => void;
  onSkip?: () => void;
}

const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  userType,
  userName,
  categoryName,
  specificUserType,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const ownerSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Schön, dass du da bist! tigube hilft dir dabei, vertrauensvolle Betreuer für deine geliebten Tiere zu finden.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Nächster Schritt: Dein Profil',
      subtitle: 'Erzähle uns von deinen Lieblingen',
      description: 'Erstelle Profile für dein(e) Tier(e) und teile deine Betreuungsvorlieben mit.',
      icon: <PawPrint className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'search',
      title: 'Finde den perfekten Betreuer',
      subtitle: 'Einfach und sicher',
      description: 'Durchsuche Profile von erfahrenen Tierbetreuern in deiner Nähe.',
      icon: <Search className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Direkte Kommunikation',
      subtitle: 'Lerne dich kennen',
      description: 'Chatte direkt mit potenziellen Betreuern, stelle Fragen und plane ein Kennenlernen.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'trust',
      title: 'Vertrauen durch Transparenz',
      subtitle: 'Sicherheit steht an erster Stelle',
      description: 'Bewertungen, Referenzen und verifizierte Profile geben dir die Sicherheit, die dein Tier verdient.',
      icon: <Shield className="w-12 h-12 text-primary-500" />
    }
  ];

  // Basis-Steps für allgemeine Betreuer
  const getBaseCaretakerSteps = (serviceTypeName: string = 'Tierbetreuer'): OnboardingStep[] => [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: `Großartig, dass du dabei bist! Als ${serviceTypeName} kannst du deine Leidenschaft für Tiere zum Beruf machen.`,
      icon: <PawPrint className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Profil',
      subtitle: 'Zeige deine Erfahrung',
      description: 'Vervollständige dein Profil mit Fotos, Erfahrungen und Services. Je detaillierter, desto mehr Anfragen erhältst du.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Verbinde dich mit Tierhaltern',
      subtitle: 'Neue Kunden finden',
      description: 'Tierhalter in deiner Nähe suchen nach zuverlässigen Betreuern. Chatte mit ihnen und vereinbare Kennenlerntermine.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue dein Business auf',
      subtitle: 'Bewertungen sammeln',
      description: 'Mit jeder erfolgreichen Betreuung baust du deine Reputation auf und erhältst mehr Buchungsanfragen.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Tierarzt-spezifische Steps
  const tierarztSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Großartig, dass du dabei bist! Als Tierarzt kannst du Tierhaltern eine professionelle medizinische Betreuung anbieten.',
      icon: <Stethoscope className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Praxenprofil',
      subtitle: 'Zeige deine Expertise',
      description: 'Vervollständige dein Profil mit Praxisinformationen, Spezialisierungen und Öffnungszeiten. Je detaillierter, desto mehr Tierhalter finden dich.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Erreiche Tierhalter in deiner Nähe',
      subtitle: 'Neue Patienten finden',
      description: 'Tierhalter suchen nach vertrauensvollen Tierärzten für ihre Tiere. Stelle deine Dienste vor und gewinne neue Patienten.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue deine Praxis auf',
      subtitle: 'Vertrauen aufbauen',
      description: 'Durch positive Bewertungen und Empfehlungen baust du deine Reputation auf und erhältst mehr Anfragen für Sprechstunden und Hausbesuche.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Hundetrainer-spezifische Steps
  const hundetrainerSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Großartig, dass du dabei bist! Als Hundetrainer hilfst du Hundebesitzern dabei, ihre Vierbeiner optimal zu erziehen und zu fördern.',
      icon: <GraduationCap className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Trainerprofil',
      subtitle: 'Zeige deine Methoden',
      description: 'Präsentiere deine Trainingsmethoden, Zertifikate und Erfolgsgeschichten. Je überzeugender, desto mehr Hundebesitzer wenden sich an dich.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Finde Hundebesitzer, die Hilfe suchen',
      subtitle: 'Neue Kunden gewinnen',
      description: 'Hundebesitzer suchen nach erfahrenen Trainern für Erziehung, Verhaltenstraining oder Spezialkurse. Stelle dich ihnen vor.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue deine Trainingspraxis auf',
      subtitle: 'Erfolge teilen',
      description: 'Durch erfolgreiche Trainings und positive Bewertungen baust du deine Reputation auf und erhältst mehr Anfragen für Einzel- und Gruppentraining.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Tierfriseur-spezifische Steps
  const tierfriseurSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Großartig, dass du dabei bist! Als Tierfriseur hilfst du Tierhaltern dabei, ihre Lieblinge gut gepflegt zu halten.',
      icon: <Scissors className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Salon-Profil',
      subtitle: 'Zeige deine Dienstleistungen',
      description: 'Präsentiere deine Dienstleistungen wie Fellpflege, Trimmen oder professionelles Baden. Zeige Beispiele deiner Arbeit.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Erreiche Tierhalter in deiner Region',
      subtitle: 'Neue Kunden finden',
      description: 'Tierhalter suchen nach zuverlässigen Friseuren für ihre Vierbeiner. Stelle deine Services vor und gewinne neue Stammkunden.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue deinen Tierfriseur-Service auf',
      subtitle: 'Zufriedene Kunden begeistern',
      description: 'Durch hervorragende Arbeit und positive Bewertungen baust du deine Reputation auf und erhältst mehr Terminanfragen.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Ernährungsberater-spezifische Steps
  const ernaehrungsberaterSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Großartig, dass du dabei bist! Als Ernährungsberater hilfst du Tierhaltern dabei, ihre Tiere optimal zu ernähren.',
      icon: <UtensilsCrossed className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Beraterprofil',
      subtitle: 'Zeige dein Wissen',
      description: 'Präsentiere deine Expertise in Tierernährung, Diätpläne und spezielle Ernährungsbedürfnisse. Je überzeugender, desto mehr Anfragen.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Hilf Tierhaltern bei der Ernährung',
      subtitle: 'Beratungsanfragen erhalten',
      description: 'Tierhalter suchen nach Experten für die optimale Ernährung ihrer Tiere. Stelle deine Beratungsleistungen vor.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue deine Beratungspraxis auf',
      subtitle: 'Erfolgreiche Ernährungskonzepte',
      description: 'Durch erfolgreiche Ernährungspläne und positive Bewertungen baust du deine Reputation auf und erhältst mehr Beratungsanfragen.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Tierfotograf-spezifische Steps
  const tierfotografSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Großartig, dass du dabei bist! Als Tierfotograf hältst du besondere Momente von Tieren in wunderschönen Bildern fest.',
      icon: <Camera className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Fotografen-Profil',
      subtitle: 'Zeige deine Portfolios',
      description: 'Präsentiere deine besten Tierfotos und Shootings. Zeige verschiedene Stile und Tierarten, die du fotografierst.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Erreiche Tierhalter, die Fotos suchen',
      subtitle: 'Neue Aufträge finden',
      description: 'Tierhalter suchen nach professionellen Fotografen für ihre Vierbeiner. Stelle deine Fotoshootings und Preise vor.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue deine Fotografen-Praxis auf',
      subtitle: 'Bewegende Momente festhalten',
      description: 'Durch beeindruckende Fotos und positive Bewertungen baust du deine Reputation auf und erhältst mehr Anfragen für Fotoshootings.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Physiotherapeut-spezifische Steps
  const physiotherapeutSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Willkommen bei tigube!`,
      subtitle: `Hi ${userName}! 👋`,
      description: 'Großartig, dass du dabei bist! Als Physiotherapeut hilfst du Tieren dabei, sich nach Verletzungen oder Operationen zu erholen.',
      icon: <Activity className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'profile',
      title: 'Erstelle dein Therapeuten-Profil',
      subtitle: 'Zeige deine Behandlungen',
      description: 'Präsentiere deine Therapiemethoden, Spezialisierungen und Erfolgsgeschichten. Je überzeugender, desto mehr Tierhalter vertrauen dir.',
      icon: <Star className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'connect',
      title: 'Erreiche Tierhalter mit Reha-Bedarf',
      subtitle: 'Neue Patienten finden',
      description: 'Tierhalter suchen nach erfahrenen Physiotherapeuten für ihre verletzten oder rekonvaleszenten Tiere. Stelle deine Therapien vor.',
      icon: <MessageCircle className="w-12 h-12 text-primary-500" />
    },
    {
      id: 'grow',
      title: 'Baue deine Therapiepraxis auf',
      subtitle: 'Heilungserfolge teilen',
      description: 'Durch erfolgreiche Behandlungen und positive Bewertungen baust du deine Reputation auf und erhältst mehr Anfragen für Physiotherapie.',
      icon: <Heart className="w-12 h-12 text-primary-500" />
    }
  ];

  // Bestimme die passenden Steps basierend auf der Dienstleistung
  const getCaretakerSteps = (): OnboardingStep[] => {
    if (!categoryName && !specificUserType) {
      return getBaseCaretakerSteps('Tierbetreuer');
    }

    const category = categoryName?.toLowerCase() || '';
    const specificType = specificUserType?.toLowerCase() || '';

    // Spezifische Zuordnung basierend auf Kategorie oder User-Typ
    if (category.includes('tierarzt') || specificType === 'tierarzt') {
      return tierarztSteps;
    } else if (category.includes('hundetrainer') || specificType === 'hundetrainer') {
      return hundetrainerSteps;
    } else if (category.includes('tierfriseur') || specificType === 'tierfriseur') {
      return tierfriseurSteps;
    } else if (category.includes('ernährungsberater') || specificType === 'ernaehrungsberater') {
      return ernaehrungsberaterSteps;
    } else if (category.includes('tierfotograf') || specificType === 'tierfotograf') {
      return tierfotografSteps;
    } else if (category.includes('physiotherapeut') || specificType === 'physiotherapeut') {
      return physiotherapeutSteps;
    } else {
      // Fallback: Basis-Steps mit dem Namen der Kategorie
      return getBaseCaretakerSteps(categoryName || 'Tierbetreuer');
    }
  };

  const steps = userType === 'owner' ? ownerSteps : getCaretakerSteps();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm max-w-lg w-full overflow-hidden animate-slideInUp">
        {/* Header with Skip Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
          >
            Überspringen
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center min-h-[400px] flex flex-col justify-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {currentStepData.icon}
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <h3 className="text-lg font-medium text-gray-600 mb-4">
            {currentStepData.subtitle}
          </h3>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 pt-4">
          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-primary-500 w-8'
                    : index < currentStep
                    ? 'bg-primary-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            {/* Back Button */}
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                onClick={prevStep}
                className="text-gray-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
            ) : (
              <div></div>
            )}

            {/* Next/Finish Button */}
            <Button
              variant="primary"
              onClick={nextStep}
              className="px-6"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Weiter
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'Los geht\'s!'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;
