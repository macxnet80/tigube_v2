import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useSubscription } from '../lib/auth/useSubscription';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import OwnerJobCard from '../components/owner/OwnerJobCard';
import { ownerJobService, type OpenJobListItem } from '../lib/supabase/ownerJobService';
import { applyToOwnerJobViaChat } from '../lib/supabase/ownerJobApply';
import { OWNER_SERVICE_TAGS } from '../lib/constants/ownerServices';
import { isCaretakerLikeUserType } from '../lib/utils';

function formatOwnerLabel(first: string | null, last: string | null): string {
  if (!first && !last) return 'Tierhalter';
  if (!last) return first || 'Tierhalter';
  return `${first || ''} ${last.charAt(0)}.`.trim();
}

export default function OwnerJobsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { isPremiumUser, hasFeature } = useSubscription();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<OpenJobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationQ, setLocationQ] = useState('');
  const [serviceTag, setServiceTag] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const canApply =
    !!user &&
    isCaretakerLikeUserType(userProfile?.user_type) &&
    isPremiumUser &&
    hasFeature('apply_owner_jobs');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await ownerJobService.listOpenJobs({
      locationQuery: locationQ || undefined,
      serviceTag: serviceTag || undefined,
      dateFrom: dateFrom || undefined
    });
    if (err) setError(err);
    setJobs(data);
    setLoading(false);
  }, [locationQ, serviceTag, dateFrom]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/anmelden?redirect=${encodeURIComponent('/gesuche')}`);
      return;
    }
    void load();
  }, [authLoading, user, navigate, load]);

  const handleApply = async (job: OpenJobListItem) => {
    if (!user || !canApply) return;
    if (job.owner_id === user.id) return;
    setApplyingId(job.id);
    try {
      const result = await applyToOwnerJobViaChat({
        ownerId: job.owner_id,
        caretakerId: user.id,
        jobId: job.id,
        jobTitle: job.title
      });
      if ('error' in result) {
        setError(result.error);
        return;
      }
      navigate(`/nachrichten/${result.conversationId}`);
    } finally {
      setApplyingId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12 sm:pb-16">
      <div className="container-custom py-5 sm:py-8">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap min-w-0">
            <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600 shrink-0" />
            <span className="break-words min-w-0">Gesuche von Tierhaltern</span>
          </h1>
          <p className="text-gray-600 text-sm mt-2 sm:mt-1 leading-relaxed">
            Offene Gesuche von Premium-Tierhaltern. Als Premium-Betreuer kannst du dich per Chat bewerben.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
          <div className="min-w-0 sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Ort / PLZ</label>
            <input
              type="text"
              value={locationQ}
              onChange={(e) => setLocationQ(e.target.value)}
              className="w-full min-w-0 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Filter …"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Leistung</label>
            <select
              value={serviceTag}
              onChange={(e) => setServiceTag(e.target.value)}
              className="w-full min-w-0 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">Alle</option>
              {OWNER_SERVICE_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Noch offen ab</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full min-w-0 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end sm:col-span-2 md:col-span-1">
            <button
              type="button"
              onClick={() => void load()}
              className="w-full px-4 py-2.5 sm:py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 touch-manipulation"
            >
              Filtern
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-gray-600 text-center py-12">Keine offenen Gesuche gefunden.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const isOwn = user.id === job.owner_id;
              const showApply = canApply && !isOwn;
              let hint: string | undefined;
              if (isOwn) hint = undefined;
              else if (!isCaretakerLikeUserType(userProfile?.user_type))
                hint = 'Nur für Betreuer und Dienstleister.';
              else if (!isPremiumUser || !hasFeature('apply_owner_jobs'))
                hint = 'Mit Premium kannst du dich per Chat auf Gesuche bewerben.';

              return (
                <OwnerJobCard
                  key={job.id}
                  job={job}
                  ownerId={job.owner_id}
                  ownerLabel={formatOwnerLabel(job.owner_first_name, job.owner_last_name)}
                  showOwnerLine
                  canApply={showApply}
                  onApply={() => void handleApply(job)}
                  applying={applyingId === job.id}
                  applyBlockedHint={!showApply && !isOwn ? hint : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
