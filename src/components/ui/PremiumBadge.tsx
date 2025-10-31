import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PremiumBadge({ className, size = 'md' }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-gray-50 text-gray-700',
        sizeClasses[size],
        className
      )}
    >
      <Lock className={cn('text-gray-600', iconSizes[size])} />
      <span className="font-medium">Premium</span>
    </div>
  );
}
