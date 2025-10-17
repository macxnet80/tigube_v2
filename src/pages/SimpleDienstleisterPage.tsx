import React from 'react';

export const SimpleDienstleisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dienstleister finden
        </h1>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kategorien</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">🐾</div>
              <h3 className="font-semibold text-lg mb-2">Betreuer</h3>
              <p className="text-gray-600 text-sm">Haustierbetreuung und -pflege</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">🩺</div>
              <h3 className="font-semibold text-lg mb-2">Tierarzt</h3>
              <p className="text-gray-600 text-sm">Medizinische Versorgung und Gesundheit</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-lg mb-2">Hundetrainer</h3>
              <p className="text-gray-600 text-sm">Training und Verhaltensberatung</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">✂️</div>
              <h3 className="font-semibold text-lg mb-2">Tierfriseur</h3>
              <p className="text-gray-600 text-sm">Pflege und Styling</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-gray-600">
            Die Dienstleister-Suche ist in Entwicklung. Bald findest du hier qualifizierte Tierärzte, Trainer und andere Experten in deiner Nähe.
          </p>
        </div>
      </div>
    </div>
  );
};
