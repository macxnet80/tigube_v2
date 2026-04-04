import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  ownerJobService,
  getUnreadOwnerJobNotices,
  markOwnerJobNoticeRead,
  type OwnerJobWithPets,
  type OwnerJobNoticeRow,
} from '../../lib/supabase/ownerJobService';
import { OWNER_SERVICE_TAGS } from '../../lib/constants/ownerServices';

interface OwnerDashboardJobsTabProps {
  userId: string;
  pets: { id: string; name: string }[];
  isPremiumUser: boolean;
}

type Draft = {
  title: string;
  description: string;
  date_from: string;
  date_to: string;
  location_text: string;
  budget_hint: string;
  service_tags: string[];
  pet_ids: string[];
  status: 'open' | 'closed' | 'filled';
};

const emptyDraft = (): Draft => ({
  title: '',
  description: '',
  date_from: '',
  date_to: '',
  location_text: '',
  budget_hint: '',
  service_tags: [],
  pet_ids: [],
  status: 'open'
});

function jobToDraft(j: OwnerJobWithPets): Draft {
  return {
    title: j.title,
    description: j.description,
    date_from: j.date_from || '',
    date_to: j.date_to || '',
    location_text: j.location_text || '',
    budget_hint: j.budget_hint || '',
    service_tags: j.service_tags || [],
    pet_ids: j.pet_ids,
    status: j.status as Draft['status']
  };
}

export default function OwnerDashboardJobsTab({ userId, pets, isPremiumUser }: OwnerDashboardJobsTabProps) {
  const [jobs, setJobs] = useState<OwnerJobWithPets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [notices, setNotices] = useState<OwnerJobNoticeRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [jobsRes, noticesRes] = await Promise.all([
      ownerJobService.listJobsByOwner(userId),
      getUnreadOwnerJobNotices(userId),
    ]);
    if (jobsRes.error) setError(jobsRes.error);
    setJobs(jobsRes.data);
    if (!noticesRes.error) setNotices(noticesRes.data);
    setLoading(false);
  }, [userId]);

  const dismissNotice = async (noticeId: string) => {
    const { error: err } = await markOwnerJobNoticeRead(noticeId, userId);
    if (err) {
      setMsg(err);
      return;
    }
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

  useEffect(() => {
    if (!isPremiumUser) {
      setLoading(false);
      return;
    }
    void load();
  }, [isPremiumUser, load]);

  const openCreate = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setMode('create');
    setMsg(null);
  };

  const openEdit = (j: OwnerJobWithPets) => {
    setDraft(jobToDraft(j));
    setEditingId(j.id);
    setMode('edit');
    setMsg(null);
  };

  const cancelForm = () => {
    setMode('list');
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const toggleService = (s: string) => {
    setDraft((d) => ({
      ...d,
      service_tags: d.service_tags.includes(s)
        ? d.service_tags.filter((x) => x !== s)
        : [...d.service_tags, s]
    }));
  };

  const togglePet = (id: string) => {
    setDraft((d) => ({
      ...d,
      pet_ids: d.pet_ids.includes(id) ? d.pet_ids.filter((x) => x !== id) : [...d.pet_ids, id]
    }));
  };

  const submit = async () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      setMsg('Bitte Titel und Beschreibung ausfüllen.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      if (mode === 'create') {
        const { error: err } = await ownerJobService.createJob({
          ownerId: userId,
          title: draft.title,
          description: draft.description,
          date_from: draft.date_from || null,
          date_to: draft.date_to || null,
          location_text: draft.location_text || null,
          service_tags: draft.service_tags,
          budget_hint: draft.budget_hint || null,
          pet_ids: draft.pet_ids
        });
        if (err) setMsg(err);
        else {
          setMode('list');
          await load();
        }
      } else if (mode === 'edit' && editingId) {
        const { error: err } = await ownerJobService.updateJob(editingId, userId, {
          title: draft.title,
          description: draft.description,
          status: draft.status,
          date_from: draft.date_from || null,
          date_to: draft.date_to || null,
          location_text: draft.location_text || null,
          service_tags: draft.service_tags,
          budget_hint: draft.budget_hint || null,
          pet_ids: draft.pet_ids
        });
        if (err) setMsg(err);
        else {
          setMode('list');
          setEditingId(null);
          await load();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const removeJob = async (id: string) => {
    if (!window.confirm('Dieses Gesuch wirklich löschen?')) return;
    const { error: err } = await ownerJobService.deleteJob(id, userId);
    if (err) setMsg(err);
    else await load();
  };

  if (!isPremiumUser) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <Briefcase className="h-10 w-10 text-amber-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Gesuche für Tierhalter</h2>
        <p className="text-gray-700 text-sm mb-4 max-w-md mx-auto">
          Mit Premium kannst du Gesuche einstellen, die auf deinem Profil und in der Gesuche-Übersicht erscheinen.
          Betreuer mit Premium können sich per Chat bewerben.
        </p>
        <Link
          to="/mitgliedschaften"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          Zu den Mitgliedschaften
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900 min-w-0">
          <Briefcase className="h-5 w-5 text-primary-600 shrink-0" />
          Meine Gesuche
        </h2>
        {mode === 'list' && (
          <Button type="button" variant="primary" size="sm" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto shrink-0" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Neues Gesuch
          </Button>
        )}
      </div>

      {notices.length > 0 && (
        <div className="space-y-3" role="region" aria-label="Hinweise zu Gesuchen">
          {notices.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <p className="font-semibold">
                Gesuch von tigube entfernt{' '}
                {n.job_title_snapshot ? `„${n.job_title_snapshot}“` : ''}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-amber-900">{n.reason}</p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-amber-950 underline hover:no-underline"
                onClick={() => void dismissNotice(n.id)}
              >
                Hinweis gelesen / ausblenden
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {msg && <div className="text-amber-800 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{msg}</div>}

      {(mode === 'create' || mode === 'edit') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 min-w-0">
          <h3 className="font-medium text-gray-900">{mode === 'create' ? 'Neues Gesuch anlegen' : 'Gesuch bearbeiten'}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="z. B. Hundebetreuung erste Maiwoche"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y"
              placeholder="Was brauchst du, wann, Besonderheiten …"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Von (Datum)</label>
              <input
                type="date"
                value={draft.date_from}
                onChange={(e) => setDraft((d) => ({ ...d, date_from: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bis (Datum)</label>
              <input
                type="date"
                value={draft.date_to}
                onChange={(e) => setDraft((d) => ({ ...d, date_to: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ort / PLZ</label>
            <input
              type="text"
              value={draft.location_text}
              onChange={(e) => setDraft((d) => ({ ...d, location_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="z. B. 10115 Berlin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (freier Text)</label>
            <input
              type="text"
              value={draft.budget_hint}
              onChange={(e) => setDraft((d) => ({ ...d, budget_hint: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="z. B. bis 25 €/Tag"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Gewünschte Leistungen</span>
            <div className="flex flex-wrap gap-2">
              {OWNER_SERVICE_TAGS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    draft.service_tags.includes(s)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Betroffene Haustiere</span>
            {pets.length === 0 ? (
              <p className="text-sm text-gray-500">Noch keine Tiere — lege welche unter „Meine Tiere“ an.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePet(p.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      draft.pet_ids.includes(p.id)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as Draft['status'] }))
                }
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="open">Offen</option>
                <option value="closed">Geschlossen</option>
                <option value="filled">Vermittelt</option>
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
            <Button type="button" variant="primary" className="w-full sm:w-auto justify-center" onClick={() => void submit()} disabled={saving}>
              {saving ? 'Speichern…' : 'Speichern'}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto justify-center" onClick={cancelForm} disabled={saving}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      {mode === 'list' && (
        <>
          {jobs.length === 0 ? (
            <p className="text-gray-600 text-sm">Noch keine Gesuche. Lege eines an, damit Betreuer dich finden.</p>
          ) : (
            <ul className="space-y-4">
              {jobs.map((j) => (
                <li
                  key={j.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0"
                >
                  <div className="min-w-0 flex-1 pr-0 sm:pr-2">
                    <div className="font-semibold text-gray-900">{j.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Status:{' '}
                      {j.status === 'open' ? 'Offen' : j.status === 'filled' ? 'Vermittelt' : 'Geschlossen'}
                    </div>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3 whitespace-pre-wrap">{j.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0 justify-end sm:justify-start">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-primary-600 rounded-lg border border-gray-200"
                      title="Bearbeiten"
                      onClick={() => openEdit(j)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-red-600 rounded-lg border border-gray-200"
                      title="Löschen"
                      onClick={() => void removeJob(j.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {j.status === 'open' ? (
                      <button
                        type="button"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-gray-200"
                        title="Als vermittelt markieren"
                        onClick={async () => {
                          await ownerJobService.updateJob(j.id, userId, { status: 'filled' });
                          await load();
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                        title="Wieder öffnen"
                        onClick={async () => {
                          await ownerJobService.updateJob(j.id, userId, { status: 'open' });
                          await load();
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500">
            Öffentlich sichtbar sind nur Gesuche mit Status <strong>Offen</strong>.{' '}
            <Link to={`/owner/${userId}`} className="text-primary-600 hover:underline">
              Profil ansehen
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
