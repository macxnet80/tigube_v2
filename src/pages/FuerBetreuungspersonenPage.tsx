import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Dumbbell,
  Leaf,
  Footprints,
  Home,
  Moon,
  Clock,
  Sun,
  Rabbit,
  Search,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import type { AccordionItem } from '../components/ui/Accordion';

// Target audience cards
interface AudienceCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const audienceCards: AudienceCard[] = [
  {
    icon: <User className="w-8 h-8 text-primary-600" />,
    title: 'Privatpersonen mit Tiererfahrung',
    description:
      'Du liebst Tiere und möchtest anderen helfen? Perfekt – keine Ausbildung nötig, nur Herz und Verantwortungsbewusstsein.',
  },
  {
    icon: <GraduationCap className="w-8 h-8 text-primary-600" />,
    title: 'Professionelle Betreuungspersonen',
    description:
      'Du arbeitest bereits als Tierpfleger:in, Tierassistenz oder ähnliches? Nutze tigube, um mehr Kunden zu erreichen.',
  },
  {
    icon: <Dumbbell className="w-8 h-8 text-primary-600" />,
    title: 'Hundetrainer:innen',
    description:
      'Biete Trainings und Betreuung auf einer Plattform an und werde noch sichtbarer für Tierhalter:innen.',
  },
  {
    icon: <Leaf className="w-8 h-8 text-primary-600" />,
    title: 'Nebenberuf oder Hobby',
    description:
      'Du möchtest dein Hobby zum Nebenberuf machen? tigube macht das einfach.',
  },
];

// Service types
interface ServiceType {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const serviceTypes: ServiceType[] = [
  {
    icon: <Footprints className="w-7 h-7 text-primary-600" />,
    title: 'Gassi-Service',
    description: 'Tägliche Spaziergänge',
  },
  {
    icon: <Home className="w-7 h-7 text-primary-600" />,
    title: 'Haussitting',
    description: 'Du betreust das Tier bei Besitzer:innen zuhause',
  },
  {
    icon: <Moon className="w-7 h-7 text-primary-600" />,
    title: 'Übernachtungsbetreuung',
    description: 'Das Tier schläft bei dir',
  },
  {
    icon: <Clock className="w-7 h-7 text-primary-600" />,
    title: 'Kurzbesuche',
    description: 'Zwischendurch vorbeischauen',
  },
  {
    icon: <Sun className="w-7 h-7 text-primary-600" />,
    title: 'Hundetagesbetreuung',
    description: 'Ganztages-Betreuung bei dir',
  },
  {
    icon: <Rabbit className="w-7 h-7 text-primary-600" />,
    title: 'Kleintierbetreuung',
    description: 'Kaninchen, Katzen, Meerschweinchen etc.',
  },
];

// Feature points
interface FeaturePoint {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const featurePoints: FeaturePoint[] = [
  {
    icon: <Search className="w-8 h-8 text-primary-600" />,
    title: 'Neue Kunden finden',
    description: 'Tierhalter:innen in deiner Region finden dich direkt über tigube.',
  },
  {
    icon: <ClipboardList className="w-8 h-8 text-primary-600" />,
    title: 'Dein eigenes Profil',
    description: 'Präsentiere dich mit Fotos, Beschreibung, Tierarten und Services.',
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
    title: 'Direkte Anfragen',
    description: 'Interessierte Tierhalter:innen kontaktieren dich über die Plattform.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
    title: 'Vertrauen durch Verifizierung',
    description: 'tigube prüft Profile – das stärkt das Vertrauen bei Tierhalter:innen.',
  },
];

// Registration steps
interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Als Betreuungsperson registrieren',
    description: "Wähle beim Registrieren die Rolle 'Betreuungsperson' aus.",
  },
  {
    number: 2,
    title: 'Profil ausfüllen',
    description:
      'Gib an, welche Tiere du betreust, welche Services du anbietest und wo du erreichbar bist.',
  },
  {
    number: 3,
    title: 'Anfragen erhalten',
    description:
      'Sobald du freigeschaltet bist, können Tierhalter:innen dein Profil finden und dich kontaktieren.',
  },
];

// FAQ data
const faqItems: AccordionItem[] = [
  {
    id: 'faq-1',
    title: 'Muss ich professionell ausgebildet sein?',
    content: (
      <p className="text-gray-700">
        Nein. tigube steht sowohl Privatpersonen als auch professionellen Betreuungspersonen offen.
        Wichtig sind Erfahrung und Zuverlässigkeit.
      </p>
    ),
  },
  {
    id: 'faq-2',
    title: 'Wie bekomme ich Anfragen?',
    content: (
      <p className="text-gray-700">
        Nach deiner Freischaltung wirst du in der Suche sichtbar. Tierhalter:innen können dein
        Profil finden und dich direkt kontaktieren.
      </p>
    ),
  },
  {
    id: 'faq-3',
    title: 'Was kostet die Mitgliedschaft als Betreuungsperson?',
    content: (
      <p className="text-gray-700">
        Du startest mit 3 Monaten gratis Premium (Anmeldung bis 30. April 2026). Danach kannst du
        zwischen verschiedenen Mitgliedschaftsoptionen wählen.
      </p>
    ),
  },
  {
    id: 'faq-4',
    title: 'Kann ich mehrere Tierarten und Services anbieten?',
    content: (
      <p className="text-gray-700">
        Ja! Du kannst in deinem Profil beliebig viele Tierarten und Betreuungsarten hinterlegen –
        und sie jederzeit anpassen.
      </p>
    ),
  },
];

export default function FuerBetreuungspersonenPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* 1. Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Betreue Tiere. Gewinne Kunden.
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            tigube gibt dir die Sichtbarkeit, die du verdient hast – egal ob Privatperson oder
            Profi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registrieren?type=caretaker">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-primary-700 hover:bg-gray-100 font-semibold w-full sm:w-auto"
              >
                Jetzt als Betreuungsperson registrieren
              </Button>
            </Link>
            <a href="#so-funktionierts">
              <Button
                variant="outline"
                size="lg"
                className="bg-primary-800 border-primary-800 text-white hover:bg-primary-900 w-full sm:w-auto"
              >
                Wie funktioniert das?
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Target Audience Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Für wen ist tigube als Betreuungsperson geeignet?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {audienceCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="mb-4">{card.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welche Betreuungsarten kannst du anbieten?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {serviceTypes.map((service) => (
              <div
                key={service.title}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="flex-shrink-0 rounded-full bg-primary-50 p-3">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Benefits Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Deine Vorteile auf tigube
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featurePoints.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-white p-3 shadow-sm">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Registration Steps */}
      <section id="so-funktionierts" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              So läuft die Registrierung ab
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mb-4 flex-shrink-0">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Promo Banner */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-base sm:text-lg font-medium text-center sm:text-left">
            ⏰ Früh dabei sein zahlt sich aus – 3 Monate Premium gratis bis 30. April 2026
          </p>
          <Link to="/registrieren?type=caretaker" className="flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-amber-600 hover:bg-amber-50 font-semibold whitespace-nowrap"
            >
              Jetzt registrieren
            </Button>
          </Link>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Häufige Fragen von Betreuungspersonen
            </h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Bereit, Tiere zu betreuen und neue Kunden zu gewinnen?
          </h2>
          <Link to="/registrieren?type=caretaker">
            <Button variant="primary" size="lg">
              Jetzt kostenlos registrieren
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Ich bin Tierhalter:in →{' '}
            <Link
              to="/fuer-tierhalter"
              className="text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Zur Seite für Tierhalter:innen
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}
