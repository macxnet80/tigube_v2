// Cross-Service-Empfehlungen Komponente (Premium-Feature)

import React from 'react';
import { ArrowRight, Star, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CrossServiceEmpfehlung } from '../../lib/types/dienstleister';

interface CrossServiceEmpfehlungenProps {
  empfehlungen: CrossServiceEmpfehlung[];
  onEmpfehlungClick?: (kategorieId: number) => void;
  className?: string;
}

export const CrossServiceEmpfehlungen: React.FC<CrossServiceEmpfehlungenProps> = ({
  empfehlungen,
  onEmpfehlungClick,
  className
}) => {
  if (!empfehlungen || empfehlungen.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-2">
        <Star className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Verwandte Services
        </h3>
        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
          Premium
        </span>
      </div>

      <div className="grid gap-3">
        {empfehlungen.map((empfehlung) => (
          <div
            key={empfehlung.id}
            className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-primary-200 hover:shadow-sm"
            onClick={() => onEmpfehlungClick?.(empfehlung.empfohlene_kategorie_id)}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <ArrowRight className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-900">
                    {empfehlung.empfohlene_kategorie?.name || 'Verwandter Service'}
                  </h4>
                  
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                </div>
                
                <p className="mt-1 text-sm text-gray-600 group-hover:text-primary-700">
                  {empfehlung.empfehlung_text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium-Hinweis */}
      <div className="rounded-lg bg-primary-50 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
            <Star className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-primary-900">
              Intelligente Empfehlungen
            </h4>
            <p className="mt-1 text-sm text-primary-700">
              Diese Empfehlungen basieren auf deiner aktuellen Suche und helfen dir, 
              verwandte Services zu finden, die zu deinen Bedürfnissen passen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
