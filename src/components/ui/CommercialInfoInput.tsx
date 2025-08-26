import React, { useState, useEffect } from 'react';
import { Building2, FileText, Hash, CheckCircle, AlertCircle } from 'lucide-react';

interface CommercialInfoInputProps {
  isCommercial: boolean;
  companyName: string;
  taxNumber: string;
  vatId: string;
  onIsCommercialChange: (value: boolean) => void;
  onCompanyNameChange: (value: string) => void;
  onTaxNumberChange: (value: string) => void;
  onVatIdChange: (value: string) => void;
  errors: {
    taxNumber?: string;
  };
}

// EU-Länder mit ihren USt-IdNr.-Formaten
const EU_VAT_FORMATS: Record<string, { pattern: RegExp; example: string }> = {
  'AT': { pattern: /^ATU\d{8}$/, example: 'ATU12345678' }, // Österreich
  'BE': { pattern: /^BE0\d{9}$/, example: 'BE0123456789' }, // Belgien
  'BG': { pattern: /^BG\d{9,10}$/, example: 'BG123456789' }, // Bulgarien
  'HR': { pattern: /^HR\d{11}$/, example: 'HR12345678901' }, // Kroatien
  'CY': { pattern: /^CY\d{8}[A-Z]$/, example: 'CY12345678A' }, // Zypern
  'CZ': { pattern: /^CZ\d{8,10}$/, example: 'CZ12345678' }, // Tschechien
  'DK': { pattern: /^DK\d{8}$/, example: 'DK12345678' }, // Dänemark
  'EE': { pattern: /^EE\d{9}$/, example: 'EE123456789' }, // Estland
  'FI': { pattern: /^FI\d{8}$/, example: 'FI12345678' }, // Finnland
  'FR': { pattern: /^FR[A-Z0-9]{2}\d{9}$/, example: 'FR12345678901' }, // Frankreich
  'DE': { pattern: /^DE\d{9}$/, example: 'DE123456789' }, // Deutschland
  'GR': { pattern: /^EL\d{9}$/, example: 'EL123456789' }, // Griechenland
  'HU': { pattern: /^HU\d{8}$/, example: 'HU12345678' }, // Ungarn
  'IE': { pattern: /^IE\d{7}[A-Z]{1,2}$/, example: 'IE1234567A' }, // Irland
  'IT': { pattern: /^IT\d{11}$/, example: 'IT12345678901' }, // Italien
  'LV': { pattern: /^LV\d{11}$/, example: 'LV12345678901' }, // Lettland
  'LT': { pattern: /^LT\d{9,12}$/, example: 'LT123456789' }, // Litauen
  'LU': { pattern: /^LU\d{8}$/, example: 'LU12345678' }, // Luxemburg
  'MT': { pattern: /^MT\d{8}$/, example: 'MT12345678' }, // Malta
  'NL': { pattern: /^NL\d{9}B\d{2}$/, example: 'NL123456789B12' }, // Niederlande
  'PL': { pattern: /^PL\d{10}$/, example: 'PL1234567890' }, // Polen
  'PT': { pattern: /^PT\d{9}$/, example: 'PT123456789' }, // Portugal
  'RO': { pattern: /^RO\d{2,10}$/, example: 'RO12345678' }, // Rumänien
  'SK': { pattern: /^SK\d{10}$/, example: 'SK1234567890' }, // Slowakei
  'SI': { pattern: /^SI\d{8}$/, example: 'SI12345678' }, // Slowenien
  'ES': { pattern: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/, example: 'ES12345678A' }, // Spanien
  'SE': { pattern: /^SE\d{10}01$/, example: 'SE123456789001' }, // Schweden
};

// Funktion zur Validierung der USt-IdNr.
function validateVatId(vatId: string): { isValid: boolean; error?: string; country?: string } {
  if (!vatId.trim()) {
    return { isValid: true }; // Leer ist OK (optional)
  }

  const cleanVatId = vatId.trim().toUpperCase();
  
  // Prüfe Ländercode
  const countryCode = cleanVatId.substring(0, 2);
  const format = EU_VAT_FORMATS[countryCode];
  
  if (!format) {
    return { 
      isValid: false, 
      error: `Ungültiger Ländercode: ${countryCode}` 
    };
  }
  
  // Prüfe Format
  if (!format.pattern.test(cleanVatId)) {
    return { 
      isValid: false, 
      error: `Ungültiges Format`,
      country: countryCode
    };
  }
  
  return { isValid: true, country: countryCode };
}

function CommercialInfoInput({
  isCommercial,
  companyName,
  taxNumber,
  vatId,
  onIsCommercialChange,
  onCompanyNameChange,
  onTaxNumberChange,
  onVatIdChange,
  errors
}: CommercialInfoInputProps) {
  const [vatIdValidation, setVatIdValidation] = useState<{ isValid: boolean; error?: string; country?: string }>({ isValid: true });
  const [showVatIdValidation, setShowVatIdValidation] = useState(false);

  // USt-IdNr. validieren wenn sich der Wert ändert
  useEffect(() => {
    if (vatId.trim()) {
      const validation = validateVatId(vatId);
      setVatIdValidation(validation);
      setShowVatIdValidation(true);
    } else {
      setVatIdValidation({ isValid: true });
      setShowVatIdValidation(false);
    }
  }, [vatId]);

  // USt-IdNr. Handler mit Auto-Formatierung
  const handleVatIdChange = (value: string) => {
    // Entferne alle Leerzeichen und konvertiere zu Großbuchstaben
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    onVatIdChange(cleanValue);
  };
  return (
    <div className="space-y-4">
      {/* Gewerblicher Betreuer Checkbox */}
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            id="isCommercial"
            type="checkbox"
            checked={isCommercial}
            onChange={(e) => onIsCommercialChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          />
        </div>
        <div className="text-sm">
          <label htmlFor="isCommercial" className="font-medium text-gray-900">
            Gewerblicher Betreuer
          </label>
          <p className="text-gray-500">
            Ich biete Haustierbetreuung gewerblich an und habe eine Steuernummer
          </p>
        </div>
      </div>

      {/* Gewerbliche Felder - nur anzeigen wenn Checkbox aktiviert */}
      {isCommercial && (
        <div className="space-y-4 pl-7 border-l-2 border-primary-100">
          {/* Firmenname */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Firmenname <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
                className="input pl-10"
                placeholder="z.B. Müller's Haustierservice"
              />
            </div>
          </div>

          {/* Steuernummer */}
          <div>
            <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Steuernummer {!vatId.trim() ? <span className="text-red-500">*</span> : <span className="text-gray-400">(optional)</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="taxNumber"
                value={taxNumber}
                onChange={(e) => onTaxNumberChange(e.target.value)}
                className={`input pl-10 ${errors.taxNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="z.B. 123/456/78901"
                required={!vatId.trim()}
              />
            </div>
            {errors.taxNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.taxNumber}</p>
            )}
            {vatId.trim() && (
              <p className="mt-1 text-xs text-gray-500">
                Optional, da USt-IdNr. angegeben ist
              </p>
            )}
          </div>

          {/* USt-IdNr. */}
          <div>
            <label htmlFor="vatId" className="block text-sm font-medium text-gray-700 mb-1">
              USt-IdNr. <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="vatId"
                value={vatId}
                onChange={(e) => handleVatIdChange(e.target.value)}
                className={`input pl-10 ${showVatIdValidation && !vatIdValidation.isValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : showVatIdValidation && vatIdValidation.isValid ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}`}
                placeholder="z.B. DE123456789"
              />
              {/* Validierungs-Icon */}
              {showVatIdValidation && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {vatIdValidation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            
            {/* Validierungs-Nachrichten */}
            {showVatIdValidation && (
              <div className="mt-1">
                {vatIdValidation.isValid ? (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Gültige USt-IdNr. für {vatIdValidation.country}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{vatIdValidation.error}</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              Nur erforderlich wenn umsatzsteuerpflichtig
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommercialInfoInput; 