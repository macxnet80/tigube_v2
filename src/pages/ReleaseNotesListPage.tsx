import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedContent, type ContentItem } from '../lib/supabase/blogService';

function ReleaseNotesListPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await getPublishedContent({ type: 'release', limit: 50, offset: 0 });
        if (err) {
          setError(err);
          return;
        }
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Was ist neu</h1>
        <p className="text-gray-600 mt-2">
          Die letzten Updates und Verbesserungen auf tigube – chronologisch sortiert.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-600">Lade Updates…</div>
      ) : error ? (
        <div className="py-16 text-center text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-600">Noch keine Einträge veröffentlicht.</div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={`/was-ist-neu/${item.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  {item.published_at && (
                    <time className="text-sm text-gray-500" dateTime={item.published_at}>
                      {new Date(item.published_at).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  )}
                </div>
                {item.excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>}
                <span className="mt-3 inline-block text-sm font-medium text-primary-700">Weiterlesen</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReleaseNotesListPage;
