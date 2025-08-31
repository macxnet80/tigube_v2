import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Crown, 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Star,
  Settings,
  Trash2,
  Ban,
  Unlock
} from 'lucide-react';
import { EnhancedAdminService, AdminRole } from '../../lib/admin/enhancedAdminService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface UserEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentAdminId: string;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  currentAdminId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    // Basic info
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    street: user?.street || '',
    plz: user?.plz || '',
    city: user?.city || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    emergency_contact: user?.emergency_contact || '',
    emergency_phone: user?.emergency_phone || '',
    
    // Admin settings
    admin_role: user?.admin_role || null,
    is_suspended: user?.is_suspended || false,
    suspension_reason: user?.suspension_reason || '',
    
    // Subscription
    subscription_status: user?.subscription_status || null,
    
    // Caretaker specific
    approval_status: user?.approval_status || null,
    approval_notes: user?.approval_notes || '',
    
    // Caretaker profile
    short_about_me: user?.caretaker_profile?.short_about_me || '',
    long_about_me: user?.caretaker_profile?.long_about_me || '',
    experience_years: user?.caretaker_profile?.experience_years || '',
    hourly_rate: user?.caretaker_profile?.hourly_rate || '',
    service_radius: user?.caretaker_profile?.service_radius || '',
    languages: user?.caretaker_profile?.languages || [],
    animal_types: user?.caretaker_profile?.animal_types || [],
    qualifications: user?.caretaker_profile?.qualifications || [],
    is_commercial: user?.caretaker_profile?.is_commercial || false,
    company_name: user?.caretaker_profile?.company_name || '',
    short_term_available: user?.caretaker_profile?.short_term_available || false,
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newAnimalType, setNewAnimalType] = useState('');
  const [newQualification, setNewQualification] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        street: user.street || '',
        plz: user.plz || '',
        city: user.city || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        emergency_contact: user.emergency_contact || '',
        emergency_phone: user.emergency_phone || '',
        admin_role: user.admin_role || null,
        is_suspended: user.is_suspended || false,
        suspension_reason: user.suspension_reason || '',
        subscription_status: user.subscription_status || null,
        approval_status: user.approval_status || null,
        approval_notes: user.approval_notes || '',
        short_about_me: user.caretaker_profile?.short_about_me || '',
        long_about_me: user.caretaker_profile?.long_about_me || '',
        experience_years: user.caretaker_profile?.experience_years || '',
        hourly_rate: user.caretaker_profile?.hourly_rate || '',
        service_radius: user.caretaker_profile?.service_radius || '',
        languages: user.caretaker_profile?.languages || [],
        animal_types: user.caretaker_profile?.animal_types || [],
        qualifications: user.caretaker_profile?.qualifications || [],
        is_commercial: user.caretaker_profile?.is_commercial || false,
        company_name: user.caretaker_profile?.company_name || '',
        short_term_available: user.caretaker_profile?.short_term_available || false,
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addArrayItem = (field: 'languages' | 'animal_types' | 'qualifications', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'languages' | 'animal_types' | 'qualifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Update basic user profile
      await EnhancedAdminService.updateUserProfile(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        street: formData.street,
        plz: formData.plz,
        city: formData.city,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,
      }, currentAdminId);

      // Update admin role
      await EnhancedAdminService.updateUserRole(
        user.id,
        formData.admin_role,
        currentAdminId
      );

      // Update suspension status
      await EnhancedAdminService.updateUserSuspension(
        user.id,
        formData.is_suspended,
        currentAdminId,
        formData.suspension_reason
      );

      // Update subscription status
      await EnhancedAdminService.updateUserSubscription(
        user.id,
        formData.subscription_status,
        currentAdminId
      );

      // Update caretaker approval if applicable
      if (user.user_type === 'caretaker') {
        await EnhancedAdminService.updateCaretakerApproval(
          user.id,
          formData.approval_status,
          currentAdminId,
          formData.approval_notes
        );

        // Update caretaker profile
        await EnhancedAdminService.updateCaretakerProfile(user.id, {
          short_about_me: formData.short_about_me,
          long_about_me: formData.long_about_me,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          service_radius: formData.service_radius ? parseInt(formData.service_radius) : null,
          languages: formData.languages,
          animal_types: formData.animal_types,
          qualifications: formData.qualifications,
          is_commercial: formData.is_commercial,
          company_name: formData.company_name,
          short_term_available: formData.short_term_available,
        }, currentAdminId);
      }

      setSuccess('Benutzerprofil erfolgreich aktualisiert!');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Fehler beim Aktualisieren des Benutzerprofils');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer unwiderruflich löschen möchten?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await EnhancedAdminService.deleteUser(user.id, currentAdminId, 'Gelöscht durch Admin');
      
      setSuccess('Benutzer erfolgreich gelöscht!');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Fehler beim Löschen des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Benutzer bearbeiten: {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info & Admin Settings */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Grundinformationen
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Straße</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                      <input
                        type="text"
                        value={formData.plz}
                        onChange={(e) => handleInputChange('plz', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Geschlecht</label>
                       <select
                         value={formData.gender}
                         onChange={(e) => handleInputChange('gender', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                       >
                         <option value="">Bitte wählen</option>
                         <option value="male">Männlich</option>
                         <option value="female">Weiblich</option>
                         <option value="other">Divers</option>
                         <option value="prefer_not_to_say">Keine Angabe</option>
                       </select>
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notfallkontakt</label>
                    <input
                      type="text"
                      value={formData.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notfalltelefon</label>
                    <input
                      type="tel"
                      value={formData.emergency_phone}
                      onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Admin-Einstellungen
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin-Rolle</label>
                    <select
                      value={formData.admin_role || ''}
                      onChange={(e) => handleInputChange('admin_role', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Keine Admin-Rolle</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abonnement-Status</label>
                    <select
                      value={formData.subscription_status || ''}
                      onChange={(e) => handleInputChange('subscription_status', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Kostenlos</option>
                      <option value="trial">Trial</option>
                      <option value="active">Aktiv</option>
                      <option value="cancelled">Gekündigt</option>
                      <option value="expired">Abgelaufen</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_suspended"
                      checked={formData.is_suspended}
                      onChange={(e) => handleInputChange('is_suspended', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_suspended" className="text-sm font-medium text-gray-700">
                      Benutzer gesperrt
                    </label>
                  </div>

                  {formData.is_suspended && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sperrgrund</label>
                      <textarea
                        value={formData.suspension_reason}
                        onChange={(e) => handleInputChange('suspension_reason', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Grund für die Sperrung..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Profile Specific & Actions */}
            <div className="space-y-6">
              {/* Caretaker Specific Settings */}
              {user.user_type === 'caretaker' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Betreuer-Einstellungen
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Freigabe-Status</label>
                      <select
                        value={formData.approval_status || ''}
                        onChange={(e) => handleInputChange('approval_status', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Nicht angefordert</option>
                        <option value="pending">Wartend</option>
                        <option value="approved">Freigegeben</option>
                        <option value="rejected">Abgelehnt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Freigabe-Notizen</label>
                      <textarea
                        value={formData.approval_notes}
                        onChange={(e) => handleInputChange('approval_notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Notizen zur Freigabe..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Erfahrung (Jahre)</label>
                        <input
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => handleInputChange('experience_years', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stundensatz (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.hourly_rate}
                          onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service-Radius (km)</label>
                      <input
                        type="number"
                        value={formData.service_radius}
                        onChange={(e) => handleInputChange('service_radius', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="short_term_available"
                        checked={formData.short_term_available}
                        onChange={(e) => handleInputChange('short_term_available', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="short_term_available" className="text-sm font-medium text-gray-700">
                        Kurzfristig verfügbar
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_commercial"
                        checked={formData.is_commercial}
                        onChange={(e) => handleInputChange('is_commercial', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_commercial" className="text-sm font-medium text-gray-700">
                        Gewerblich
                      </label>
                    </div>

                    {formData.is_commercial && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname</label>
                        <input
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kurze Beschreibung</label>
                      <textarea
                        value={formData.short_about_me}
                        onChange={(e) => handleInputChange('short_about_me', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Kurze Beschreibung..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ausführliche Beschreibung</label>
                      <textarea
                        value={formData.long_about_me}
                        onChange={(e) => handleInputChange('long_about_me', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ausführliche Beschreibung..."
                      />
                    </div>

                    {/* Languages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sprachen</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Neue Sprache"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button
                          onClick={() => {
                            addArrayItem('languages', newLanguage);
                            setNewLanguage('');
                          }}
                          variant="primary"
                          className="px-4"
                        >
                          Hinzufügen
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {lang}
                            <button
                              onClick={() => removeArrayItem('languages', index)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Animal Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tierarten</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newAnimalType}
                          onChange={(e) => setNewAnimalType(e.target.value)}
                          placeholder="Neue Tierart"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button
                          onClick={() => {
                            addArrayItem('animal_types', newAnimalType);
                            setNewAnimalType('');
                          }}
                          variant="primary"
                          className="px-4"
                        >
                          Hinzufügen
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.animal_types.map((animal, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {animal}
                            <button
                              onClick={() => removeArrayItem('animal_types', index)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qualifikationen</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newQualification}
                          onChange={(e) => setNewQualification(e.target.value)}
                          placeholder="Neue Qualifikation"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button
                          onClick={() => {
                            addArrayItem('qualifications', newQualification);
                            setNewQualification('');
                          }}
                          variant="primary"
                          className="px-4"
                        >
                          Hinzufügen
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.qualifications.map((qual, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {qual}
                            <button
                              onClick={() => removeArrayItem('qualifications', index)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Aktionen
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full justify-center"
                    variant="primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Speichern...' : 'Änderungen speichern'}
                  </Button>

                  <Button
                    onClick={handleDeleteUser}
                    disabled={loading}
                    className="w-full justify-center"
                    variant="danger"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Benutzer löschen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
