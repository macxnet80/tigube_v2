// Dienstleister-Kategorie-Karte für die Suche

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DienstleisterKategorieCardProps {
  kategorie: {
    id: number;
    name: string;
    beschreibung: string;
    icon: string;
    anzahl?: number;
  };
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Icon-Mapping für Lucide Icons
const iconMap: Record<string, LucideIcon> = {
  'paw-print': require('lucide-react').PawPrint,
  'stethoscope': require('lucide-react').Stethoscope,
  'graduation-cap': require('lucide-react').GraduationCap,
  'scissors': require('lucide-react').Scissors,
  'activity': require('lucide-react').Activity,
  'apple': require('lucide-react').Apple,
  'camera': require('lucide-react').Camera,
  'more-horizontal': require('lucide-react').MoreHorizontal,
  'heart': require('lucide-react').Heart,
  'users': require('lucide-react').Users,
  'calendar': require('lucide-react').Calendar,
  'star': require('lucide-react').Star,
  'settings': require('lucide-react').Settings,
  'briefcase': require('lucide-react').Briefcase,
  'alert-triangle': require('lucide-react').AlertTriangle,
  'clipboard': require('lucide-react').Clipboard,
  'trending-up': require('lucide-react').TrendingUp,
  'image': require('lucide-react').Image,
  'images': require('lucide-react').Images,
  'message-circle': require('lucide-react').MessageCircle
};

export const DienstleisterKategorieCard: React.FC<DienstleisterKategorieCardProps> = ({
  kategorie,
  isSelected = false,
  onClick,
  className
}) => {
  const IconComponent = iconMap[kategorie.icon] || iconMap['more-horizontal'];

  return (
    <div
      className={cn(
        'group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary-200 hover:shadow-md',
        isSelected 
          ? 'border-primary-500 bg-primary-50 shadow-md' 
          : 'border-gray-200 bg-white hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200',
          isSelected 
            ? 'bg-primary-100 text-primary-600' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600'
        )}>
          <IconComponent className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              'text-lg font-semibold transition-colors duration-200',
              isSelected ? 'text-primary-900' : 'text-gray-900 group-hover:text-primary-900'
            )}>
              {kategorie.name}
            </h3>
            
            {kategorie.anzahl !== undefined && (
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                isSelected 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800 group-hover:bg-primary-100 group-hover:text-primary-800'
              )}>
                {kategorie.anzahl}
              </span>
            )}
          </div>
          
          <p className={cn(
            'mt-1 text-sm transition-colors duration-200',
            isSelected ? 'text-primary-700' : 'text-gray-600 group-hover:text-primary-700'
          )}>
            {kategorie.beschreibung}
          </p>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-4 flex items-center text-sm text-primary-600">
          <div className="mr-2 h-2 w-2 rounded-full bg-primary-600"></div>
          Ausgewählt
        </div>
      )}
    </div>
  );
};



