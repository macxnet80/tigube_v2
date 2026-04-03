import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, GraduationCap, Lightbulb, Handshake } from 'lucide-react';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm sm:text-base md:text-lg font-semibold text-primary-200 mb-3 uppercase tracking-widest">
              Über uns
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-1">
              Von Tiermenschen für Tiermenschen
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-primary-50 px-0 sm:px-2">
              tigube ist mehr als eine Vermittlungsplattform – es ist eine Idee, die aus echter
              Tierliebe, persönlicher Frustration und dem unbedingten Willen entstanden ist, es
              besser zu machen.
            </p>
          </div>
        </div>
      </div>

      {/* Unsere Geschichte: Text zuerst, große Bilder darunter */}
      <div className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Wie alles begann</h2>
            <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base">
              Jahrelang haben Mara und Gabriel in ihrer eigenen Hundepension und Katzenbetreuung
              gearbeitet – täglich nah an Tieren und Menschen. Was sie dabei immer wieder erlebt
              haben: Tierhalterinnen und Tierhalter, die verzweifelt nach einer verlässlichen
              Betreuung suchen. Und Betreuende, die ihre Dienste kaum sichtbar machen können.
            </p>
            <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base">
              Diese Lücke hat sie nicht losgelassen. Statt zu warten, dass jemand anderes sie
              schließt, haben sie tigube ins Leben gerufen – eine Plattform, die beide Seiten
              zusammenbringt. Nicht anonym, nicht beliebig, sondern persönlich und mit dem
              Anspruch auf echte Qualität.
            </p>
            <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base">
              Hinter tigube steckt also keine große Unternehmensgruppe, die Tierbetreuung als
              Markt entdeckt hat – sondern zwei Menschen, die selbst jeden Tag mit Tieren leben
              und genau wissen, worauf es dabei ankommt.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6 lg:gap-8 xl:gap-10">
              <div className="space-y-3">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                  <img
                    src="/Image/tigube_Gabriel_Haaga.jpg"
                    alt="Gabriel Haaga – Mitgründer tigube"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-center text-sm font-medium text-gray-600 sm:text-base">
                  Gabriel Haaga
                </p>
              </div>
              <div className="space-y-3">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                  <img
                    src="/Image/tigube_Tamara_Pfaff.jpg"
                    alt="Mara Pfaff – Mitgründerin tigube"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-center text-sm font-medium text-gray-600 sm:text-base">
                  Mara Pfaff
                </p>
              </div>
              <div className="space-y-3">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                  <img
                    src="/Image/Boxer_Hund_Luna.jpg"
                    alt="Luna – Boxer Hündin"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <p className="text-center text-sm font-medium text-gray-600 sm:text-base">
                  Luna – immer dabei
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fachliche Tiefe */}
      <div className="bg-white py-10 sm:py-14 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Fachwissen, das den Unterschied macht
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-1">
              „Tiermensch sein" bedeutet für uns nicht nur Herzblut – sondern auch
              fundiertes Wissen. Mara und Gabriel haben über ein Dutzend Aus- und
              Weiterbildungen absolviert, darunter:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[
              'Hundetraining',
              'Problemhundeberatung',
              'Tierernährung',
              'Sachkundenachweise §11 TierSchG',
              'Tierschutzgesetz',
              'Katzenbetreuung & -verhalten',
            ].map((item) => (
              <div key={item} className="flex items-start sm:items-center gap-2.5 sm:gap-3 bg-primary-50 rounded-lg px-3 sm:px-4 py-3 min-h-[3rem] sm:min-h-0">
                <GraduationCap className="h-5 w-5 text-primary-600 shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-gray-700 text-sm font-medium leading-snug">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 text-sm">
            … und weitere. Die Liste wächst, weil Stillstand für uns keine Option ist.
          </p>
        </div>
      </div>

      {/* Werte */}
      <div className="py-10 sm:py-14 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Wofür wir stehen</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex gap-4 sm:gap-5">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Echte Leidenschaft</h3>
                <p className="text-gray-600 leading-relaxed">
                  Wir machen das nicht, weil Tierbetreuung ein attraktiver Markt ist. Wir machen
                  es, weil wir selbst Tiermenschen sind – und das jeden Tag spüren.
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-5">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Handshake className="h-6 w-6 text-primary-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vertrauen als Grundlage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Wer sein Tier in fremde Hände gibt, braucht mehr als eine App – er braucht das
                  Gefühl, dass da jemand aufpasst. Das ist der Maßstab, an dem wir uns messen.
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-5">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <GraduationCap className="h-6 w-6 text-primary-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualität vor Quantität</h3>
                <p className="text-gray-600 leading-relaxed">
                  tigube soll keine Masse sein, sondern Klasse. Lieber weniger Betreuende auf der
                  Plattform – dafür solche, denen man wirklich vertrauen kann.
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-5">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Lightbulb className="h-6 w-6 text-primary-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Praxis statt Theorie</h3>
                <p className="text-gray-600 leading-relaxed">
                  Jede Entscheidung bei tigube fußt auf echter Erfahrung aus dem Alltag mit
                  Tieren – nicht auf Marktanalysen oder Trendberichten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="bg-white border-t border-gray-100 py-10 sm:py-14 lg:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Schreib uns</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-[15px] sm:text-base leading-relaxed">
            Du hast eine Frage, eine Idee oder einfach etwas Nettes zu sagen? Wir freuen uns
            über jede Nachricht – wirklich.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
            <a
              href="mailto:info@tigube.de"
              className="btn btn-primary w-full sm:w-auto justify-center min-h-[48px] px-4 py-3"
            >
              info@tigube.de
            </a>
            <Link
              to="/kontakt"
              className="btn btn-outline w-full sm:w-auto justify-center min-h-[48px] px-4 py-3"
            >
              Kontaktformular
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
