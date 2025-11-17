import { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase/client';
import { useToast } from '../../hooks/useToast';

interface DienstleisterKategorie {
  id: number;
  name: string;
  beschreibung: string;
  icon: string;
}

interface DienstleisterProfileEditorProps {
  userId: string;
  initialData: {
    kategorie_id?: number;
    spezialisierungen?: string[];
    behandlungsmethoden?: string[];
    fachgebiete?: string[];
    beratungsarten?: string[];
    freie_dienstleistung?: string;
    notfall_bereitschaft?: boolean;
    portfolio_urls?: string[];
    stil_beschreibung?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function DienstleisterProfileEditor({
  userId,
  initialData,
  onSave,
  onCancel
}: DienstleisterProfileEditorProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [kategorien, setKategorien] = useState<DienstleisterKategorie[]>([]);

  // Form states
  const [selectedKategorie, setSelectedKategorie] = useState<number>(initialData.kategorie_id || 1);
  const [spezialisierungen, setSpezialisierungen] = useState<string[]>(initialData.spezialisierungen || []);
  const [behandlungsmethoden, setBehandlungsmethoden] = useState<string[]>(initialData.behandlungsmethoden || []);
  const [fachgebiete, setFachgebiete] = useState<string[]>(initialData.fachgebiete || []);
  const [beratungsarten, setBeratungsarten] = useState<string[]>(initialData.beratungsarten || []);
  const [freieDialenstleistung, setFreieDialenstleistung] = useState<string>(initialData.freie_dienstleistung || '');
  const [notfallBereitschaft, setNotfallBereitschaft] = useState<boolean>(initialData.notfall_bereitschaft || false);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(initialData.portfolio_urls || []);
  const [stilBeschreibung, setStilBeschreibung] = useState<string>(initialData.stil_beschreibung || '');

  // Input states for adding new items
  const [newSpezialisierung, setNewSpezialisierung] = useState('');
  const [newBehandlungsmethode, setNewBehandlungsmethode] = useState('');
  const [newFachgebiet, setNewFachgebiet] = useState('');
  const [newBeratungsart, setNewBeratungsart] = useState('');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  // Load kategorien
  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const { data, error } = await supabase
          .from('dienstleister_kategorien' as any)
          .select('*')
          .eq('is_active', true)
          .order('sortierung');

        if (error) throw error;
        setKategorien((data as unknown as DienstleisterKategorie[]) || []);
      } catch (error) {
        console.error('Error loading kategorien:', error);
        showError('Fehler beim Laden der Kategorien');
      }
    };

    loadKategorien();
  }, [showError]);

  const handleAddItem = (
    items: string[],
    setItems: (items: string[]) => void,
    newItem: string,
    setNewItem: (item: string) => void
  ) => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (
    items: string[],
    setItems: (items: string[]) => void,
    index: number
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData = {
        kategorie_id: selectedKategorie,
        spezialisierungen,
        behandlungsmethoden,
        fachgebiete,
        beratungsarten,
        freie_dienstleistung: freieDialenstleistung || null,
        notfall_bereitschaft: notfallBereitschaft,
        portfolio_urls: portfolioUrls.filter(url => url.trim()),
        stil_beschreibung: stilBeschreibung || null,
      };

      const { error } = await supabase
        .from('caretaker_profiles')
        .update(updateData as any)
        .eq('id', userId);

      if (error) throw error;

      showSuccess('Profil erfolgreich aktualisiert');
      onSave(updateData);
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  const ArrayInput = ({
    label,
    items,
    setItems,
    newItem,
    setNewItem,
    placeholder
  }: {
    label: string;
    items: string[];
    setItems: (items: string[]) => void;
    newItem: string;
    setNewItem: (item: string) => void;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
              {item}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(items, setItems, index)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            className="flex-1 input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem(items, setItems, newItem, setNewItem);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddItem(items, setItems, newItem, setNewItem)}
            disabled={!newItem.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Dienstleister-Profil bearbeiten
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Abbrechen
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Kategorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie *
            </label>
            <select
              value={selectedKategorie}
              onChange={(e) => setSelectedKategorie(Number(e.target.value))}
              className="input w-full"
            >
              {kategorien.map((kategorie) => (
                <option key={kategorie.id} value={kategorie.id}>
                  {kategorie.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spezialisierungen */}
          <ArrayInput
            label="Spezialisierungen"
            items={spezialisierungen}
            setItems={setSpezialisierungen}
            newItem={newSpezialisierung}
            setNewItem={setNewSpezialisierung}
            placeholder="Neue Spezialisierung hinzufügen..."
          />

          {/* Fachgebiete */}
          <ArrayInput
            label="Fachgebiete"
            items={fachgebiete}
            setItems={setFachgebiete}
            newItem={newFachgebiet}
            setNewItem={setNewFachgebiet}
            placeholder="Neues Fachgebiet hinzufügen..."
          />

          {/* Freie Dienstleistung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freie Dienstleistung
            </label>
            <textarea
              value={freieDialenstleistung}
              onChange={(e) => setFreieDialenstleistung(e.target.value)}
              placeholder="Beschreiben Sie Ihre individuellen Dienstleistungen..."
              className="input w-full"
              rows={3}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Behandlungsmethoden */}
          <ArrayInput
            label="Behandlungsmethoden"
            items={behandlungsmethoden}
            setItems={setBehandlungsmethoden}
            newItem={newBehandlungsmethode}
            setNewItem={setNewBehandlungsmethode}
            placeholder="Neue Behandlungsmethode hinzufügen..."
          />

          {/* Beratungsarten */}
          <ArrayInput
            label="Beratungsarten"
            items={beratungsarten}
            setItems={setBeratungsarten}
            newItem={newBeratungsart}
            setNewItem={setNewBeratungsart}
            placeholder="Neue Beratungsart hinzufügen..."
          />

          {/* Portfolio URLs */}
          <ArrayInput
            label="Portfolio URLs"
            items={portfolioUrls}
            setItems={setPortfolioUrls}
            newItem={newPortfolioUrl}
            setNewItem={setNewPortfolioUrl}
            placeholder="https://beispiel.com/portfolio"
          />

          {/* Notfall-Verfügbarkeit */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={notfallBereitschaft}
                onChange={(e) => setNotfallBereitschaft(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Notfall-Service verfügbar
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Ich bin auch außerhalb der regulären Zeiten für Notfälle erreichbar
            </p>
          </div>
        </div>
      </div>

      {/* Stil & Arbeitsweise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stil & Arbeitsweise
        </label>
        <textarea
          value={stilBeschreibung}
          onChange={(e) => setStilBeschreibung(e.target.value)}
          placeholder="Beschreiben Sie Ihren Arbeitsstil und Ihre Philosophie..."
          className="input w-full"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Erzählen Sie potenziellen Kunden, wie Sie arbeiten und was Sie auszeichnet
        </p>
      </div>
    </div>
  );
}
