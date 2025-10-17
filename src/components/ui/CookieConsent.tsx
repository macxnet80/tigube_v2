/**
 * Cookie Consent Banner
 * DSGVO-konforme Cookie-Einverständnis-Komponente
 */

import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings, Check, AlertCircle } from 'lucide-react';
import Button from './Button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentProps {
  onConsentChange: (preferences: CookiePreferences) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export default function CookieConsent({ onConsentChange, onAcceptAll, onRejectAll }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Immer true, da notwendig
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Prüfe ob bereits eine Einverständnis-Entscheidung getroffen wurde
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Lade gespeicherte Präferenzen
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        onConsentChange(savedPreferences);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, [onConsentChange]);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    onAcceptAll();
    onConsentChange(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    onRejectAll();
    onConsentChange(onlyNecessary);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    onConsentChange(preferences);
    setIsVisible(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Necessary cookies können nicht deaktiviert werden
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Cookie className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Cookie-Einstellungen
            </h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showDetails ? (
            // Simple view
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-gray-700">
                    Wir verwenden Cookies, um dir die beste Erfahrung auf unserer Website zu bieten. 
                    Einige Cookies sind notwendig, andere helfen uns dabei, die Website zu verbessern.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Alle akzeptieren
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1"
                >
                  Nur notwendige
                </Button>
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
              </div>
            </div>
          ) : (
            // Detailed view
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cookie-Kategorien
                </h3>
                <p className="text-gray-600 text-sm">
                  Wähle aus, welche Cookies du akzeptieren möchtest:
                </p>
              </div>

              {/* Necessary Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Notwendige Cookies</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="ml-2 text-sm text-gray-600">Immer aktiv</span>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Analyse-Cookies</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Verwendet: Google Analytics
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Marketing-Cookies</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Diese Cookies werden verwendet, um dir relevante Werbung zu zeigen.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Verwendet: Meta Pixel, Facebook Ads
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        preferences.marketing ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Präferenzen speichern
                </Button>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Zurück
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
