import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plane, AlertCircle, Star, Dog, Cat, Rabbit, Bird } from 'lucide-react';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import type { AccordionItem } from '../components/ui/Accordion';

// Situation cards data
interface SituationCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const situationCards: SituationCard[] = [
  {
    icon: <Briefcase className="w-8 h-8 text-primary-600" />,
    title: 'Berufstätige',
    description:
      'Du arbeitest lange oder unregelmäßig? Finde jemanden, der deinen Hund Gassi führt oder deine Katze versorgt.',
  },
  {
    icon: <Plane className="w-8 h-8 text-primary-600" />,
    title: 'Urlaub & Reisen',
    description:
      'Damit du entspannt verreisen kannst – mit einer Betreuungsperson, die du kennst und vertraust.',
  },
  {
    icon: <AlertCircle className="w-8 h-8 text-primary-600" />,
    title: 'Notfall',
    description:
      'Manchmal kommt es unerwartet. tigube hilft dir, auch kurzfristig Betreuung zu finden.',
  },
  {
    icon: <Star className="w-8 h-8 text-primary-600" />,
    title: 'Regelmäßige Unterstützung',
    description:
      'Du brauchst verlässliche Hilfe im Alltag? Bau eine langfristige Beziehung mit deiner Betreuungsperson auf.',
  },
];

// Animal types data
interface AnimalType {
  icon: React.ReactNode;
  label: string;
  services: string;
}

const animalTypes: AnimalType[] = [
  {
    icon: <Dog className="w-10 h-10 text-primary-600" />,
    label: 'Hunde',
    services: 'Gassi, Tagesbetreuung, Übernachtung',
  },
  {
    icon: <Cat className="w-10 h-10 text-primary-600" />,
    label: 'Katzen',
    services: 'Hausbesuche, Übernachtungsbetreuung',
  },
  {
    icon: <Rabbit className="w-10 h-10 text-primary-600" />,
    label: 'Kleintiere',
    services: 'Kaninchen, Meerschweinchen, Hamster',
  },
  {
    icon: <Bird className="w-10 h-10 text-primary-600" />,
    label: 'Vögel & weitere',
    services: 'Weitere Tierarten in Planung',
  },
];

// Steps data
interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Registrieren',
    description:
      'Erstelle dein kostenloses Profil und gib an, welche Tiere du hast.',
  },
  {
    number: 2,
    title: 'Betreuungspersonen finden',
    description:
      'Suche in deiner Region nach passenden Betreuungspersonen und lies ihre Profile.',
  },
  {
    number: 3,
    title: 'Kontakt aufnehmen',
    description:
      'Schreib direkt über tigube – und vereinbare Betreuung ganz unkompliziert.',
  },
];

// FAQ data
const faqItems: AccordionItem[] = [
  {
    id: 'faq-1',
    title: 'Wie finde ich eine Betreuungsperson in meiner Nähe?',
    content: (
      <p className="text-gray-700">
        Nach der Registrierung kannst du Betreuungspersonen in deiner Region suchen und ihre
        Profile ansehen. Du entscheidest, wen du kontaktierst.
      </p>
    ),
  },
  {
    id: 'faq-2',
    title: 'Was passiert, wenn es in meiner Region noch wenige Angebote gibt?',
    content: (
      <p className="text-gray-700">
        Der Startpool wächst täglich. Registriere dich jetzt – du wirst automatisch
        benachrichtigt, wenn neue Betreuungspersonen in deiner Nähe aktiv werden.
      </p>
    ),
  },
  {
    id: 'faq-3',
    title: 'Muss ich sofort buchen?',
    content: (
      <p className="text-gray-700">
        Nein. Du kannst Profile entdecken, Kontakt aufnehmen und in Ruhe entscheiden –
        ganz ohne Druck.
      </p>
    ),
  },
  {
    id: 'faq-4',
    title: 'Was kostet die Nutzung für Tierhalter:innen?',
    content: (
      <p className="text-gray-700">
        Die Basis-Nutzung ist kostenlos. Mit der Premium-Mitgliedschaft bekommst du Zugang
        zu erweiterten Funktionen.
      </p>
    ),
  },
];

export default function FuerTierhalterPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* 1. Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Tierbetreuung, der du vertraust
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            tigube verbindet dich mit erfahrenen Betreuungspersonen in deiner Nähe –
            für Alltag, Urlaub oder den Notfall.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registrieren">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-primary-700 hover:bg-gray-100 font-semibold w-full sm:w-auto"
              >
                Jetzt kostenlos registrieren
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

      {/* 2. Situationen-Sektion */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Für welche Situationen ist tigube sinnvoll?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {situationCards.map((card) => (
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

      {/* 3. Welche Tiere werden betreut? */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Für welche Tiere?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {animalTypes.map((animal) => (
              <div key={animal.label} className="flex flex-col items-center text-center p-4">
                <div className="rounded-full bg-primary-50 p-4 mb-4 inline-flex">
                  {animal.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{animal.label}</h3>
                <p className="text-sm text-gray-500">{animal.services}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. So funktioniert es */}
      <section id="so-funktionierts" className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              So funktioniert es
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

      {/* 5. Promo-Banner */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-base sm:text-lg font-medium text-center sm:text-left">
            ⏰ Jetzt registrieren und 3 Monate Premium kostenlos sichern – Angebot gilt bis 30. April 2026
          </p>
          <Link to="/registrieren" className="flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-amber-600 hover:bg-amber-50 font-semibold whitespace-nowrap"
            >
              Jetzt kostenlos starten
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Häufige Fragen von Tierhalter:innen
            </h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* 7. Abschluss-CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Bereit, die passende Betreuung zu finden?
          </h2>
          <Link to="/registrieren">
            <Button variant="primary" size="lg">
              Kostenlos registrieren
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Ich bin Betreuungsperson →{' '}
            <Link
              to="/fuer-betreuungspersonen"
              className="text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Zur Seite für Betreuungspersonen
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}
