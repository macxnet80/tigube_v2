import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { getPublishedContent, type ContentItem } from '../../lib/supabase/blogService';

const STORAGE_KEY = 'tigube_dismissed_release_slug';

function DashboardReleaseTeaser() {
  const [latest, setLatest] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedForSlug, setDismissedForSlug] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await getPublishedContent({ type: 'release', limit: 1, offset: 0 });
        if (cancelled || error || !data?.[0]) return;
        const row = data[0];
        setLatest(row);
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored === row.slug) {
            setDismissedForSlug(row.slug);
          } else {
            setOpen(true);
          }
        } catch {
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFocusableRef.current?.focus(), 0);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const dismiss = useCallback(() => {
    if (latest) {
      try {
        localStorage.setItem(STORAGE_KEY, latest.slug);
      } catch {
        /* ignore */
      }
      setDismissedForSlug(latest.slug);
    }
    setOpen(false);
  }, [latest]);

  if (loading || !latest || dismissedForSlug === latest.slug) {
    return null;
  }

  const summary =
    latest.excerpt?.trim() ||
    (latest.content.length > 160 ? `${latest.content.slice(0, 157)}…` : latest.content);

  return (
    <div className="fixed bottom-6 right-6 z-[38] flex flex-col items-end gap-2">
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="release-teaser-title"
          className="w-[min(100vw-2rem,20rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-primary-700">
              <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
              <span id="release-teaser-title" className="font-semibold text-gray-900 text-sm">
                Neuigkeiten
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-expanded={open}
                aria-label="Hinweis minimieren"
              >
                <span className="sr-only">Minimieren</span>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">{latest.title}</p>
          <p className="mt-1 text-sm text-gray-600 line-clamp-4">{summary}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              ref={firstFocusableRef}
              to={`/was-ist-neu/${latest.slug}`}
              className="inline-flex justify-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Zum Artikel
            </Link>
            <Link
              to="/was-ist-neu"
              className="inline-flex justify-center text-sm font-medium text-primary-700 hover:underline"
            >
              Alle Updates
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-gray-500 hover:text-gray-800 hover:underline"
            >
              Nicht mehr anzeigen
            </button>
          </div>
        </div>
      ) : null}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-expanded={false}
          aria-label="Neuigkeiten öffnen"
        >
          <Sparkles className="h-6 w-6" aria-hidden />
        </button>
      )}
    </div>
  );
}

export default DashboardReleaseTeaser;
