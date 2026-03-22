import { Link } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, Euro, PawPrint, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

export interface OwnerJobCardModel {
  id: string;
  owner_id?: string;
  title: string;
  description: string;
  date_from: string | null;
  date_to: string | null;
  location_text: string | null;
  service_tags: string[] | null;
  budget_hint: string | null;
  pets: { id: string; name: string }[];
}

function formatJobDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return d;
  }
}

interface OwnerJobCardProps {
  job: OwnerJobCardModel;
  /** Für „Profil“-Link bei Jobs-Übersicht */
  ownerId?: string;
  ownerLabel?: string;
  showOwnerLine?: boolean;
  canApply?: boolean;
  onApply?: () => void;
  applying?: boolean;
  applyBlockedHint?: string;
  className?: string;
}

export default function OwnerJobCard({
  job,
  ownerId,
  ownerLabel,
  showOwnerLine,
  canApply,
  onApply,
  applying,
  applyBlockedHint,
  className
}: OwnerJobCardProps) {
  const dateRange =
    job.date_from || job.date_to
      ? [formatJobDate(job.date_from), formatJobDate(job.date_to)].filter(Boolean).join(' – ')
      : null;

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col gap-3 min-w-0',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <Briefcase className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
          <h3 className="font-semibold text-gray-900 leading-snug break-words">{job.title}</h3>
        </div>
      </div>

      {showOwnerLine && ownerId && ownerLabel && (
        <p className="text-sm text-gray-600">
          Tierhalter:{' '}
          <Link to={`/owner/${ownerId}`} className="text-primary-600 hover:underline font-medium">
            {ownerLabel}
          </Link>
        </p>
      )}

      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{job.description}</p>

      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        {dateRange && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg max-w-full break-words">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">{dateRange}</span>
          </span>
        )}
        {job.location_text && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg max-w-full break-words">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">{job.location_text}</span>
          </span>
        )}
        {job.budget_hint && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg max-w-full break-words">
            <Euro className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">{job.budget_hint}</span>
          </span>
        )}
      </div>

      {job.service_tags && job.service_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.service_tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {job.pets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <PawPrint className="h-4 w-4 text-primary-500 shrink-0" />
          <span>{job.pets.map((p) => p.name).join(', ')}</span>
        </div>
      )}

      {canApply && onApply && (
        <div className="pt-1">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={onApply}
            disabled={applying}
          >
            <MessageCircle className="h-4 w-4" />
            {applying ? 'Wird geöffnet…' : 'Per Chat bewerben'}
          </Button>
        </div>
      )}

      {!canApply && applyBlockedHint && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {applyBlockedHint}
        </p>
      )}
    </div>
  );
}
