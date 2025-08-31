import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Target, BarChart3, Calendar, Monitor, Smartphone } from 'lucide-react';
import { advertisementService, Advertisement, AdvertisementFormat } from '../../lib/supabase/advertisementService';
import ImageUploader from '../ui/ImageUploader';

interface AdvertisementManagementPanelProps {
  currentAdminId: string;
}

const AdvertisementManagementPanel: React.FC<AdvertisementManagementPanelProps> = ({ currentAdminId }) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [formats, setFormats] = useState<AdvertisementFormat[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    cta_text: 'Mehr erfahren',
    ad_type: 'search_card' as 'search_card' | 'profile_banner' | 'homepage_banner' | 'category_banner',
    format_id: '',
    target_pet_types: [] as string[],
    target_locations: [] as string[],
    target_subscription_types: [] as string[],
    start_date: '',
    end_date: '',
    is_active: true,
    priority: 0,
    max_impressions: null as number | null,
    max_clicks: null as number | null
  });

  useEffect(() => {
    loadAdvertisements();
    loadFormats();
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      const { data: ads, error } = await advertisementService.getAllAdvertisements();
      if (error) {
        console.warn('Fehler beim Laden der Werbeanzeigen:', error);
        setAdvertisements([]);
      } else {
        setAdvertisements(ads || []);
      }
    } catch (error) {
      console.warn('Fehler beim Laden der Werbeanzeigen:', error);
      // Setze leeres Array als Fallback, um Abstürze zu verhindern
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFormats = async () => {
    try {
      const { data: formatsData, error } = await advertisementService.getAdvertisementFormats();
      if (error) {
        console.warn('Fehler beim Laden der Anzeigenformate:', error);
        setFormats([]);
      } else {
        setFormats(formatsData || []);
      }
    } catch (error) {
      console.warn('Fehler beim Laden der Anzeigenformate:', error);
      setFormats([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data: analyticsData, error } = await advertisementService.getAdvertisementAnalytics();
      if (error) {
        console.warn('Fehler beim Laden der Analytics:', error);
        setAnalytics([]);
      } else {
        setAnalytics(analyticsData || []);
      }
    } catch (error) {
      console.warn('Fehler beim Laden der Analytics:', error);
      // Setze leeres Array als Fallback, um Abstürze zu verhindern
      setAnalytics([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (!currentAdminId) {
      alert('Admin-ID nicht verfügbar. Bitte melden Sie sich erneut an.');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }
    
    if (!formData.link_url || !formData.link_url.trim()) {
      alert('Bitte geben Sie eine Link-URL ein.');
      return;
    }
    
    if (!formData.format_id) {
      alert('Bitte wählen Sie ein Anzeigenformat aus.');
      return;
    }
    
    try {
      let result;
      
      // Bereite Daten vor
      const preparedData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        link_url: formData.link_url?.trim() || '',
        image_url: formData.image_url?.trim() || null,
        cta_text: formData.cta_text?.trim() || 'Mehr erfahren',
        target_pet_types: formData.target_pet_types || [],
        target_locations: formData.target_locations || [],
        target_subscription_types: formData.target_subscription_types || [],
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        priority: formData.priority || 0,
        max_impressions: formData.max_impressions || null,
        max_clicks: formData.max_clicks || null,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        // Stelle sicher, dass ad_type korrekt gesetzt ist
        ad_type: formData.ad_type || 'search_card'
      };
      
      if (editingAd) {
        // Update bestehende Werbeanzeige
        result = await advertisementService.updateAdvertisement(editingAd.id, preparedData);
      } else {
        // Erstelle neue Werbeanzeige
        const advertisementData = {
          ...preparedData,
          created_by: currentAdminId
        };
        result = await advertisementService.createAdvertisement(advertisementData);
      }
      
      if (result.error) {
        console.error('Fehler beim Speichern der Werbeanzeige:', result.error);
        alert(`Fehler beim Speichern der Werbeanzeige: ${result.error.message || 'Unbekannter Fehler'}`);
        return;
      }
      
      resetForm();
      loadAdvertisements();
      alert(editingAd ? 'Werbeanzeige erfolgreich aktualisiert!' : 'Werbeanzeige erfolgreich erstellt!');
    } catch (error) {
      console.error('Fehler beim Speichern der Werbeanzeige:', error);
      alert(`Fehler beim Speichern der Werbeanzeige: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Werbeanzeige löschen möchten?')) {
      try {
        const { error } = await advertisementService.deleteAdvertisement(id);
        if (error) {
          console.warn('Fehler beim Löschen der Werbeanzeige:', error);
          alert('Fehler beim Löschen der Werbeanzeige. Bitte versuchen Sie es später erneut.');
          return;
        }
        loadAdvertisements();
      } catch (error) {
        console.warn('Fehler beim Löschen der Werbeanzeige:', error);
        alert('Fehler beim Löschen der Werbeanzeige. Bitte versuchen Sie es später erneut.');
      }
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    try {
      const { error } = await advertisementService.updateAdvertisement(ad.id, {
        is_active: !ad.is_active
      });
      
      if (error) {
        console.warn('Fehler beim Aktualisieren des Status:', error);
        alert('Fehler beim Aktualisieren des Status. Bitte versuchen Sie es später erneut.');
        return;
      }
      
      loadAdvertisements();
    } catch (error) {
      console.warn('Fehler beim Aktualisieren des Status:', error);
      alert('Fehler beim Aktualisieren des Status. Bitte versuchen Sie es später erneut.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      cta_text: 'Mehr erfahren',
      ad_type: 'search_card' as 'search_card' | 'profile_banner' | 'homepage_banner' | 'category_banner',
      format_id: '',
      target_pet_types: [],
      target_locations: [],
      target_subscription_types: [],
      start_date: '',
      end_date: '',
      is_active: true,
      priority: 0,
      max_impressions: null,
      max_clicks: null
    });
    setShowCreateForm(false);
    setEditingAd(null);
  };

  const startEdit = (ad: Advertisement) => {
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      cta_text: ad.cta_text || 'Mehr erfahren',
      ad_type: ad.ad_type,
      format_id: ad.format_id || '',
      target_pet_types: ad.target_pet_types || [],
      target_locations: ad.target_locations || [],
      target_subscription_types: ad.target_subscription_types || [],
      start_date: ad.start_date ? new Date(ad.start_date).toISOString().split('T')[0] : '',
      end_date: ad.end_date ? new Date(ad.end_date).toISOString().split('T')[0] : '',
      is_active: ad.is_active,
      priority: ad.priority,
      max_impressions: ad.max_impressions,
      max_clicks: ad.max_clicks
    });
    setEditingAd(ad);
    setShowCreateForm(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Werbeverwaltung</h2>
        <div className="flex space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Anzeigen
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setActiveTab('list'); // Wechsle zum List-Tab wenn eine neue Anzeige erstellt wird
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Neue Anzeige</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAd ? 'Werbeanzeige bearbeiten' : 'Neue Werbeanzeige erstellen'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titel *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link-URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CTA-Text
                    </label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mehr erfahren"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Werbebild
                    </label>
                    <div className="flex bg-gray-100 rounded-md p-1">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('url')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          imageUploadMode === 'url'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        URL eingeben
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('upload')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          imageUploadMode === 'upload'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Datei hochladen
                      </button>
                    </div>
                  </div>
                  
                  {imageUploadMode === 'url' ? (
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  ) : (
                    <ImageUploader
                      onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                      currentImageUrl={formData.image_url}
                      bucketName="advertisement-images"
                      folder="ads"
                      maxSizeMB={5}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anzeigenformat *
                  </label>
                  <select
                    required
                    value={formData.format_id}
                    onChange={(e) => {
                      const selectedFormat = formats.find(f => f.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        format_id: e.target.value,
                        ad_type: selectedFormat?.ad_type as 'search_card' | 'profile_banner' | 'homepage_banner' | 'category_banner' || 'search_card'
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Format auswählen...</option>
                    {formats.map((format) => (
                      <option key={format.id} value={format.id}>
                        {format.name} ({format.width}x{format.height}px) - {format.placement}
                      </option>
                    ))}
                  </select>
                  {formData.format_id && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-600">
                        <strong>Funktion:</strong> {formats.find(f => f.id === formData.format_id)?.function_description}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Platzierung:</strong> {formats.find(f => f.id === formData.format_id)?.placement}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ziel-Haustiertypen
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'Hund', label: '🐕 Hund', description: 'Hunde aller Rassen' },
                        { value: 'Katze', label: '🐱 Katze', description: 'Katzen aller Rassen' },
                        { value: 'Vogel', label: '🦜 Vogel', description: 'Vögel und Papageien' },
                        { value: 'Kaninchen', label: '🐰 Kaninchen', description: 'Kaninchen und Hasen' },
                        { value: 'Fisch', label: '🐠 Fisch', description: 'Aquarien- und Teichfische' },
                        { value: 'Kleintier', label: '🐹 Kleintier', description: 'Hamster, Meerschweinchen, etc.' },
                        { value: 'Andere', label: '🐾 Andere', description: 'Sonstige Haustiere' }
                      ].map((petType) => (
                        <label key={petType.value} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                          <input
                            type="checkbox"
                            checked={formData.target_pet_types.includes(petType.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  target_pet_types: [...formData.target_pet_types, petType.value]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  target_pet_types: formData.target_pet_types.filter(type => type !== petType.value)
                                });
                              }
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{petType.label}</div>
                            <div className="text-xs text-gray-500">{petType.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Leer lassen für alle Haustiertypen. Mehrfachauswahl möglich.
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ziel-Abonnements
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'free', label: '🆓 Kostenlos', description: 'Nutzer mit kostenlosem Account' },
                        { value: 'premium', label: '⭐ Premium', description: 'Nutzer mit Premium-Account' }
                      ].map((subscriptionType) => (
                        <label key={subscriptionType.value} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                          <input
                            type="checkbox"
                            checked={formData.target_subscription_types.includes(subscriptionType.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  target_subscription_types: [...formData.target_subscription_types, subscriptionType.value]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  target_subscription_types: formData.target_subscription_types.filter(type => type !== subscriptionType.value)
                                });
                              }
                            }}
                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{subscriptionType.label}</div>
                            <div className="text-xs text-gray-500">{subscriptionType.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Leer lassen für alle Abonnements. Mehrfachauswahl möglich.
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ziel-Standorte
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                        <input
                          type="checkbox"
                          checked={formData.target_locations.includes('Deutschland')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                target_locations: ['Deutschland']
                              });
                            } else {
                              setFormData({
                                ...formData,
                                target_locations: formData.target_locations.filter(loc => loc !== 'Deutschland')
                              });
                            }
                          }}
                          className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">🇩🇪 Deutschland</div>
                          <div className="text-xs text-gray-500">Werbung deutschlandweit anzeigen</div>
                        </div>
                      </label>
                      
                      <div className="border-t pt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spezifische Orte (optional)
                        </label>
                        <input
                          type="text"
                          value={formData.target_locations.filter(loc => loc !== 'Deutschland').join(', ')}
                          onChange={(e) => {
                            const locations = e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                            const currentLocations = formData.target_locations.includes('Deutschland') ? ['Deutschland'] : [];
                            setFormData({ 
                              ...formData, 
                              target_locations: [...currentLocations, ...locations]
                            });
                          }}
                          placeholder="Berlin, München, Hamburg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={formData.target_locations.includes('Deutschland')}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.target_locations.includes('Deutschland') 
                            ? 'Deaktiviert wenn "Deutschland" ausgewählt ist'
                            : 'Leer lassen für alle Orte. Mehrere Orte mit Komma trennen.'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enddatum
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorität
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max. Impressionen
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_impressions || ''}
                      onChange={(e) => setFormData({ ...formData, max_impressions: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Unbegrenzt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max. Klicks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_clicks || ''}
                      onChange={(e) => setFormData({ ...formData, max_clicks: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Unbegrenzt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Aktiv</option>
                      <option value="false">Inaktiv</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingAd ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Advertisements List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Aktuelle Werbeanzeigen</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anzeige
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Targeting
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zeitraum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Limits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {advertisements.map((ad) => (
                    <tr key={ad.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {ad.image_url && (
                            <img
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              src={ad.image_url}
                              alt={ad.title}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{ad.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{ad.format_name || 'Standard'}</div>
                          <div className="text-gray-500">
                            {ad.display_width && ad.display_height ? 
                              `${ad.display_width}x${ad.display_height}px` : 
                              'Standard-Format'
                            }
                          </div>
                          {ad.placement && (
                            <div className="text-xs text-gray-400">{ad.placement}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          {ad.target_pet_types?.length > 0 ? (
                            <div>
                              <span className="font-medium">Haustiere:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ad.target_pet_types.map((petType) => (
                                  <span
                                    key={petType}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {petType}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500">Alle Haustiertypen</div>
                          )}
                          {ad.target_locations?.length > 0 && (
                            <div>
                              <span className="font-medium">Orte:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ad.target_locations.map((location) => (
                                  <span
                                    key={location}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {location}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {ad.target_subscription_types?.length > 0 ? (
                            <div>
                              <span className="font-medium">Abos:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ad.target_subscription_types.map((subscriptionType) => (
                                  <span
                                    key={subscriptionType}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {subscriptionType === 'free' ? 'Kostenlos' : 'Premium'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500">Alle Abonnements</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ad.start_date && (
                          <div>Von: {formatDate(ad.start_date)}</div>
                        )}
                        {ad.end_date && (
                          <div>Bis: {formatDate(ad.end_date)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">Priorität: {ad.priority}</div>
                        {ad.max_impressions && <div>Max. Imp.: {ad.max_impressions}</div>}
                        {ad.max_clicks && <div>Max. Klicks: {ad.max_clicks}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ad.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ad.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleActive(ad)}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              ad.is_active ? 'text-red-600' : 'text-green-600'
                            }`}
                            title={ad.is_active ? 'Deaktivieren' : 'Aktivieren'}
                          >
                            {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEdit(ad)}
                            className="p-1 rounded hover:bg-gray-100 text-blue-600"
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="p-1 rounded hover:bg-gray-100 text-red-600"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {advertisements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Keine Werbeanzeigen vorhanden. Erstellen Sie Ihre erste Anzeige!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {analytics.map((stat) => (
              <div key={stat.advertisement_id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {advertisements.find(ad => ad.id === stat.advertisement_id)?.title || 'Unbekannte Anzeige'}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.total_impressions}
                </div>
                <div className="text-sm text-gray-600">
                  Impressionen
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-blue-600 font-medium">{stat.total_clicks}</span>
                  <span className="text-gray-500"> Klicks</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  CTR: {stat.total_impressions > 0 ? ((stat.total_clicks / stat.total_impressions) * 100).toFixed(2) : 0}%
                </div>
              </div>
            ))}
          </div>
          
          {analytics.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Analytics-Daten</h3>
              <p className="text-gray-500">Es sind noch keine Analytics-Daten für Ihre Werbeanzeigen verfügbar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvertisementManagementPanel;