import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getContentBySlug, type ContentItem } from '../lib/supabase/blogService';

function ReleaseNotePage() {
  const { slug } = useParams();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await getContentBySlug(slug);
        if (err) {
          setError(err);
          return;
        }
        if (data && data.type !== 'release') {
          setItem(null);
          return;
        }
        setItem(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="container-custom py-16 text-center text-gray-600">Lade Eintrag…</div>;
  }
  if (error) {
    return <div className="container-custom py-16 text-center text-red-600">{error}</div>;
  }
  if (!item) {
    return <div className="container-custom py-16 text-center text-gray-600">Eintrag nicht gefunden.</div>;
  }

  return (
    <article className="container-custom py-8">
      <div className="mb-6">
        <Link to="/was-ist-neu" className="text-sm text-primary-700 hover:underline">
          ← Zurück zu „Was ist neu“
        </Link>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-primary-800 bg-primary-50 px-2 py-1 rounded">
        Release
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-3">{item.title}</h1>
      {item.published_at && (
        <p className="text-gray-500 text-sm mt-1">
          {new Date(item.published_at).toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
      {item.cover_image_url && (
        <img src={item.cover_image_url} alt={item.title} className="w-full h-80 object-cover rounded-lg mt-6" />
      )}

      <div className="prose prose-lg max-w-none mt-8">
        <p className="whitespace-pre-wrap text-gray-800">{item.content}</p>
      </div>
    </article>
  );
}

export default ReleaseNotePage;
