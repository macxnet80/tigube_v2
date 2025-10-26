import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const CleverreachRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Cleverreach Parameter auswerten
    const action = searchParams.get('action');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const code = searchParams.get('code');

    // Verschiedene Cleverreach-Aktionen behandeln
    if (action === 'confirm' || status === 'confirmed') {
      // Newsletter-Bestätigung erfolgreich
      setStatus('success');
      setMessage('Ihre Newsletter-Anmeldung wurde erfolgreich bestätigt!');
    } else if (action === 'unsubscribe' || status === 'unsubscribed') {
      // Newsletter-Abmeldung erfolgreich
      setStatus('success');
      setMessage('Sie wurden erfolgreich vom Newsletter abgemeldet.');
    } else if (status === 'error' || code === 'error') {
      // Fehler bei der Verarbeitung
      setStatus('error');
      setMessage('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } else {
      // Standard-Bestätigung
      setStatus('success');
      setMessage('Ihre Anfrage wurde erfolgreich verarbeitet.');
    }

    // Nach 5 Sekunden automatisch zur Startseite weiterleiten
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [searchParams, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToNewsletter = () => {
    navigate('/#newsletter');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verarbeitung läuft...
            </h2>
            <p className="text-gray-600">
              Ihre Anfrage wird verarbeitet. Bitte warten Sie einen Moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'success' ? (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Erfolgreich!
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Fehler aufgetreten
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </p>
            </>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Zur Startseite
            </Button>

            {status === 'success' && (
              <Button
                onClick={handleGoToNewsletter}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Newsletter-Einstellungen
              </Button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Sie werden in 5 Sekunden automatisch zur Startseite weitergeleitet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleverreachRedirectPage;
