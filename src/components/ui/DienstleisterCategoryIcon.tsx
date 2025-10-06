import { 
  Stethoscope, 
  GraduationCap, 
  Scissors, 
  Activity, 
  Apple, 
  Camera,
  PawPrint,
  MoreHorizontal,
  Briefcase,
  Heart,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DienstleisterCategoryIconProps {
  iconName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5', 
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

/**
 * Zentrale Icon-Komponente für Dienstleister-Kategorien
 * Unterstützt alle definierten Kategorie-Icons mit konsistenter Größe und Styling
 */
export default function DienstleisterCategoryIcon({ 
  iconName, 
  className = '', 
  size = 'md' 
}: DienstleisterCategoryIconProps) {
  
  const icons: Record<string, React.ComponentType<any>> = {
    // Medizinische Icons
    'stethoscope': Stethoscope,        // Tierarzt
    'activity': Activity,              // Physiotherapeut
    'heart': Heart,                    // Alternativ für medizinische Services
    
    // Training & Bildung
    'graduation-cap': GraduationCap,   // Hundetrainer
    'zap': Zap,                        // Alternativ für Training/Energie
    
    // Pflege & Styling
    'scissors': Scissors,              // Tierfriseur
    'camera': Camera,                  // Tierfotograf
    
    // Ernährung & Beratung
    'apple': Apple,                    // Ernährungsberater
    
    // Allgemeine Icons
    'paw-print': PawPrint,            // Betreuer (Haustierbetreuung)
    'briefcase': Briefcase,           // Business/Professional
    'more-horizontal': MoreHorizontal, // Sonstige
  };
  
  const IconComponent = icons[iconName] || Briefcase;
  const sizeClass = iconSizes[size];
  
  return (
    <IconComponent 
      className={cn(sizeClass, className)} 
      aria-label={`Icon für ${iconName}`}
    />
  );
}

/**
 * Hilfsfunktion: Ermittelt das passende Icon für eine Dienstleister-Kategorie
 */
export function getCategoryIconName(categoryName: string): string {
  const categoryIconMap: Record<string, string> = {
    'Betreuer': 'paw-print',
    'Tierarzt': 'stethoscope',
    'Hundetrainer': 'graduation-cap',
    'Tierfriseur': 'scissors',
    'Physiotherapeut': 'activity',
    'Ernährungsberater': 'apple',
    'Tierfotograf': 'camera',
    'Sonstige': 'more-horizontal'
  };
  
  return categoryIconMap[categoryName] || 'briefcase';
}

/**
 * Hilfsfunktion: Ermittelt die Farbe für eine Dienstleister-Kategorie
 */
export function getCategoryColor(categoryName: string): string {
  const categoryColorMap: Record<string, string> = {
    'Betreuer': 'text-blue-600',
    'Tierarzt': 'text-red-600',
    'Hundetrainer': 'text-green-600',
    'Tierfriseur': 'text-purple-600',
    'Physiotherapeut': 'text-orange-600',
    'Ernährungsberater': 'text-emerald-600',
    'Tierfotograf': 'text-pink-600',
    'Sonstige': 'text-gray-600'
  };
  
  return categoryColorMap[categoryName] || 'text-gray-600';
}

/**
 * Hilfsfunktion: Ermittelt die Hintergrundfarbe für eine Dienstleister-Kategorie
 */
export function getCategoryBgColor(categoryName: string): string {
  const categoryBgColorMap: Record<string, string> = {
    'Betreuer': 'bg-blue-100',
    'Tierarzt': 'bg-red-100',
    'Hundetrainer': 'bg-green-100',
    'Tierfriseur': 'bg-purple-100',
    'Physiotherapeut': 'bg-orange-100',
    'Ernährungsberater': 'bg-emerald-100',
    'Tierfotograf': 'bg-pink-100',
    'Sonstige': 'bg-gray-100'
  };
  
  return categoryBgColorMap[categoryName] || 'bg-gray-100';
}
