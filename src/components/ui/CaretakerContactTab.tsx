import { useEffect, useState } from 'react';
import { Calendar, MapPin, Phone, User, Edit } from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { userService } from '../../lib/supabase/db';

interface CaretakerContactState {
  street: string;
  plz: string;
  city: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

function CaretakerContactTab() {
  const { user, userProfile, updateProfileState } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<CaretakerContactState>({
    street: '',
    plz: '',
    city: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: ''
  });

  useEffect(() => {
    if (!userProfile) return;
    setState({
      street: userProfile.street || '',
      plz: userProfile.plz || '',
      city: userProfile.city || '',
      phoneNumber: userProfile.phone_number || '',
      dateOfBirth: userProfile.date_of_birth || '',
      gender: userProfile.gender || ''
    });
  }, [userProfile]);

  const handleChange = (key: keyof CaretakerContactState, value: string) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { data: updated, error: updateError } = await userService.updateUserProfile(user.id, {
        street: state.street,
        plz: state.plz,
        city: state.city,
        phoneNumber: state.phoneNumber,
        dateOfBirth: state.dateOfBirth || null,
        gender: state.gender || null,
      });
      if (updateError) {
        setError('Fehler beim Speichern der Kontaktdaten.');
        return;
      }
      if (updated) updateProfileState(Array.isArray(updated) ? updated[0] : updated);
      setEditing(false);
    } catch (e) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4 relative">
        <h2 className="text-xl font-semibold text-gray-900">Kontaktdaten</h2>
        {!editing && (
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            onClick={() => setEditing(true)}
            aria-label="Kontaktdaten bearbeiten"
            title="Bearbeiten"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {!editing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div className="text-gray-700">
              {state.street && <div>{state.street}</div>}
              <div>
                {state.plz && state.city ? `${state.plz} ${state.city}` : state.plz || state.city || '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{state.phoneNumber || '—'}</span>
          </div>
          {state.dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{new Date(state.dateOfBirth).toLocaleDateString('de-DE')}</span>
            </div>
          )}
          {state.gender && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{
                state.gender === 'male' ? 'Männlich' :
                state.gender === 'female' ? 'Weiblich' :
                state.gender === 'other' ? 'Divers' :
                state.gender === 'prefer_not_to_say' ? 'Keine Angabe' : state.gender
              }</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Straße & Hausnummer</label>
            <input className="input w-full" type="text" value={state.street} onChange={e => handleChange('street', e.target.value)} placeholder="Straße und Hausnummer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <input className="input w-full" type="text" value={state.plz} onChange={e => handleChange('plz', e.target.value)} placeholder="PLZ" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input className="input w-full" type="text" value={state.city} onChange={e => handleChange('city', e.target.value)} placeholder="Ort" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
            <input className="input w-full" type="tel" value={state.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} placeholder="+49 123 456789" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
              <input className="input w-full" type="date" value={state.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geschlecht</label>
              <select className="input w-full" value={state.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="">Bitte wählen</option>
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
                <option value="other">Divers</option>
                <option value="prefer_not_to_say">Keine Angabe</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm disabled:opacity-50" onClick={handleSave} disabled={saving}>
              {saving ? 'Speichert…' : 'Speichern'}
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm" onClick={() => setEditing(false)}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaretakerContactTab;


