import React from 'react';

export default function DienstleisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dienstleister finden
          </h1>
          <p className="text-gray-600">
            Finde qualifizierte Tierärzte, Trainer, Friseure und andere Experten in deiner Nähe
          </p>
        </div>

        {/* Kategorie-Auswahl */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Wähle eine Kategorie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary-200 hover:shadow-md border-gray-200 bg-white hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-200">
                  <span className="text-2xl">🐾</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-900 transition-colors duration-200">
                    Betreuer
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-primary-700 transition-colors duration-200">
                    Haustierbetreuung und -pflege
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary-200 hover:shadow-md border-gray-200 bg-white hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-200">
                  <span className="text-2xl">🩺</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-900 transition-colors duration-200">
                    Tierarzt
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-primary-700 transition-colors duration-200">
                    Medizinische Versorgung und Gesundheit
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary-200 hover:shadow-md border-gray-200 bg-white hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-200">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-900 transition-colors duration-200">
                    Hundetrainer
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-primary-700 transition-colors duration-200">
                    Training und Verhaltensberatung
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary-200 hover:shadow-md border-gray-200 bg-white hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-200">
                  <span className="text-2xl">✂️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-900 transition-colors duration-200">
                    Tierfriseur
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-primary-700 transition-colors duration-200">
                    Pflege und Styling
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-gray-600">
            Die Dienstleister-Suche ist in Entwicklung. Bald findest du hier qualifizierte Tierärzte, Trainer und andere Experten in deiner Nähe.
          </p>
        </div>
      </div>
    </div>
  );
}
