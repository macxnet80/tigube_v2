import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  BadgeCheck, 
  Ban, 
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Star,
  Image,
  Heart,
  PawPrint,
  Globe,
  Award,
  Building,
  CreditCard,
  Clock,
  MapPin as MapPinIcon,
  Languages,
  FileText,
  Home,
  Briefcase,
  Star as StarIcon,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  Edit
} from 'lucide-react';
import { AdminUserDetails } from '../../lib/supabase/adminClient';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface UserDetailModalProps {
  user: AdminUserDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, userId: string) => Promise<void>;
  actionLoading: string | null;
  onShowActionModal: (modal: { type: string; userId: string }) => void;
  onEditUser: (user: AdminUserDetails) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onAction,
  actionLoading,
  onShowActionModal,
  onEditUser
}) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserTypeBadge = (userType: string, isAdmin: boolean, adminRole?: string) => {
    if (isAdmin || adminRole) {
      return <Badge variant="danger" className="flex items-center gap-1">
        <Crown className="h-3 w-3" />
        {adminRole || 'Administrator'}
      </Badge>;
    }
    
    switch (userType) {
      case 'owner':
        return <Badge variant="success">Besitzer</Badge>;
      case 'caretaker':
        return <Badge variant="primary">Betreuer</Badge>;
      default:
        return <Badge variant="secondary">{userType}</Badge>;
    }
  };

  const getStatusBadge = (user: AdminUserDetails) => {
    switch (user.subscription_status) {
      case 'active':
        return <Badge variant="warning" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          Premium
        </Badge>;
      case 'trial':
        return <Badge variant="primary">Trial</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Gekündigt</Badge>;
      case 'expired':
        return <Badge variant="danger">Abgelaufen</Badge>;
      default:
        return <Badge variant="secondary">Kostenlos</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                 {/* Header */}
         <div className="flex items-center justify-between p-6 border-b">
           <div className="flex items-center gap-3">
                           {user.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-primary-100 shadow"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center shadow">
                  <span className="text-2xl font-medium text-gray-600">
                    {user.first_name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
             <div>
               <h2 className="text-xl font-semibold text-gray-900">
                 {user.first_name} {user.last_name}
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
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Left Column - Basic Info & Profile */}
             <div className="space-y-6">
                               {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Grundinformationen</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                     <User className="h-4 w-4 text-gray-400" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Name</p>
                       <p className="text-sm text-gray-600">{user.first_name} {user.last_name}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Mail className="h-4 w-4 text-gray-400" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">E-Mail</p>
                       <p className="text-sm text-gray-600">{user.email}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Phone className="h-4 w-4 text-gray-400" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Telefon</p>
                       <p className="text-sm text-gray-600">{user.phone_number || 'Nicht angegeben'}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <MapPin className="h-4 w-4 text-gray-400" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Adresse</p>
                       <p className="text-sm text-gray-600">
                         {user.street ? `${user.street}, ` : ''}
                         {user.plz} {user.city}
                       </p>
                     </div>
                   </div>
                   {user.date_of_birth && (
                     <div className="flex items-center gap-3">
                       <Calendar className="h-4 w-4 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Geburtsdatum</p>
                         <p className="text-sm text-gray-600">{formatDate(user.date_of_birth)}</p>
                       </div>
                     </div>
                   )}
                   {user.gender && (
                     <div className="flex items-center gap-3">
                       <User className="h-4 w-4 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Geschlecht</p>
                         <p className="text-sm text-gray-600">{user.gender}</p>
                       </div>
                     </div>
                   )}
                   {user.date_of_birth && (
                     <div className="flex items-center gap-3">
                       <Calendar className="h-4 w-4 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Geburtsdatum</p>
                         <p className="text-sm text-gray-600">{new Date(user.date_of_birth).toLocaleDateString('de-DE')}</p>
                       </div>
                     </div>
                   )}
                   {user.gender && (
                     <div className="flex items-center gap-3">
                       <User className="h-4 w-4 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Geschlecht</p>
                         <p className="text-sm text-gray-600">
                           {user.gender === 'male' && 'Männlich'}
                           {user.gender === 'female' && 'Weiblich'}
                           {user.gender === 'other' && 'Divers'}
                           {user.gender === 'prefer_not_to_say' && 'Keine Angabe'}
                         </p>
                       </div>
                     </div>
                   )}
                   {user.emergency_contact && (
                     <div className="flex items-center gap-3">
                       <AlertTriangle className="h-4 w-4 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Notfallkontakt</p>
                         <p className="text-sm text-gray-600">{user.emergency_contact}</p>
                         {user.emergency_phone && (
                           <p className="text-sm text-gray-600">{user.emergency_phone}</p>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               {/* Status & Typ */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Typ</h3>
                 <div className="space-y-3">
                   <div>
                     <p className="text-sm font-medium text-gray-900 mb-2">Benutzertyp</p>
                     {getUserTypeBadge(user.user_type, user.is_admin, user.admin_role)}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-900 mb-2">Abonnement-Status</p>
                     {getStatusBadge(user)}
                   </div>
                   {user.user_type === 'caretaker' && (
                     <div>
                       <p className="text-sm font-medium text-gray-900 mb-2">Freigabe-Status</p>
                       {user.approval_status === 'approved' && (
                         <Badge variant="success">Freigegeben</Badge>
                       )}
                       {user.approval_status === 'pending' && (
                         <Badge variant="warning">Wartend</Badge>
                       )}
                       {user.approval_status === 'rejected' && (
                         <Badge variant="danger">Abgelehnt</Badge>
                       )}
                       {!user.approval_status && (
                         <Badge variant="secondary">Nicht angefordert</Badge>
                       )}
                     </div>
                   )}
                 </div>
               </div>

               {/* Caretaker Profile Details */}
               {user.user_type === 'caretaker' && user.caretaker_profile && (
                 <div className="bg-gray-50 rounded-lg p-4">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Betreuer-Profil</h3>
                   <div className="space-y-3">
                     {user.caretaker_profile.short_about_me && (
                       <div>
                         <p className="text-sm font-medium text-gray-900 mb-1">Kurze Beschreibung</p>
                         <p className="text-sm text-gray-600">{user.caretaker_profile.short_about_me}</p>
                       </div>
                     )}
                     {user.caretaker_profile.long_about_me && (
                       <div>
                         <p className="text-sm font-medium text-gray-900 mb-1">Ausführliche Beschreibung</p>
                         <p className="text-sm text-gray-600">{user.caretaker_profile.long_about_me}</p>
                       </div>
                     )}
                     {user.caretaker_profile.experience_years && (
                       <div className="flex items-center gap-3">
                         <Award className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Erfahrung</p>
                           <p className="text-sm text-gray-600">{user.caretaker_profile.experience_years} Jahre</p>
                         </div>
                       </div>
                     )}
                     {user.caretaker_profile.hourly_rate && (
                       <div className="flex items-center gap-3">
                         <CreditCard className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Stundensatz</p>
                           <p className="text-sm text-gray-600">€{user.caretaker_profile.hourly_rate}/h</p>
                         </div>
                       </div>
                     )}
                     {user.caretaker_profile.service_radius && (
                       <div className="flex items-center gap-3">
                         <MapPinIcon className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Service-Radius</p>
                           <p className="text-sm text-gray-600">{user.caretaker_profile.service_radius} km</p>
                         </div>
                       </div>
                     )}
                     {user.caretaker_profile.languages && user.caretaker_profile.languages.length > 0 && (
                       <div className="flex items-center gap-3">
                         <Languages className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Sprachen</p>
                           <p className="text-sm text-gray-600">{user.caretaker_profile.languages.join(', ')}</p>
                         </div>
                       </div>
                     )}
                     {user.caretaker_profile.animal_types && user.caretaker_profile.animal_types.length > 0 && (
                       <div className="flex items-center gap-3">
                         <PawPrint className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Tierarten</p>
                           <p className="text-sm text-gray-600">{user.caretaker_profile.animal_types.join(', ')}</p>
                         </div>
                       </div>
                     )}
                     {user.caretaker_profile.qualifications && user.caretaker_profile.qualifications.length > 0 && (
                       <div className="flex items-center gap-3">
                         <FileText className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Qualifikationen</p>
                           <p className="text-sm text-gray-600">{user.caretaker_profile.qualifications.join(', ')}</p>
                         </div>
                       </div>
                     )}
                     {user.caretaker_profile.is_commercial && (
                       <div className="flex items-center gap-3">
                         <Building className="h-4 w-4 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-gray-900">Gewerblich</p>
                           <p className="text-sm text-gray-600">Ja</p>
                           {user.caretaker_profile.company_name && (
                             <p className="text-sm text-gray-600">Firma: {user.caretaker_profile.company_name}</p>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               )}

                               {/* Owner Profile Details */}
                {user.user_type === 'owner' && user.owner_profile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Besitzer-Profil</h3>
                    <div className="space-y-4">
                      {/* Haustiere */}
                      {user.owner_profile.pets && user.owner_profile.pets.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Haustiere ({user.owner_profile.pets.length})</p>
                          <div className="space-y-2">
                            {user.owner_profile.pets.map((pet, index) => (
                              <div key={pet.id} className="bg-white rounded p-3 border">
                                <div className="flex items-center gap-3">
                                  {pet.photo_url && (
                                    <img 
                                      src={pet.photo_url} 
                                      alt={pet.name} 
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{pet.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {pet.type} {pet.breed && `(${pet.breed})`}
                                      {pet.age && `, ${pet.age} Jahre`}
                                      {pet.gender && `, ${pet.gender}`}
                                      {pet.neutered !== undefined && `, ${pet.neutered ? 'Kastriert' : 'Nicht kastriert'}`}
                                    </p>
                                    {pet.description && (
                                      <p className="text-sm text-gray-500 mt-1">{pet.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Betreuungswünsche */}
                      {user.owner_profile.preferences && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Betreuungswünsche</p>
                          <div className="space-y-2">
                            {user.owner_profile.preferences.services && user.owner_profile.preferences.services.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Gewünschte Leistungen:</p>
                                <div className="flex flex-wrap gap-1">
                                  {user.owner_profile.preferences.services.map((service, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {user.owner_profile.preferences.other_services && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Weitere Leistungen:</p>
                                <p className="text-sm text-gray-900">{user.owner_profile.preferences.other_services}</p>
                              </div>
                            )}
                            {user.owner_profile.preferences.care_instructions && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Pflegeanweisungen:</p>
                                <p className="text-sm text-gray-900">{user.owner_profile.preferences.care_instructions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tierarzt-Informationen */}
                      {user.owner_profile.preferences?.vet_info && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Tierarzt-Informationen</p>
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm text-gray-900">{user.owner_profile.preferences.vet_info}</p>
                          </div>
                        </div>
                      )}

                      {/* Notfallkontakt */}
                      {(user.owner_profile.preferences?.emergency_contact_name || user.owner_profile.preferences?.emergency_contact_phone) && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Notfallkontakt</p>
                          <div className="bg-white rounded p-3 border">
                            {user.owner_profile.preferences.emergency_contact_name && (
                              <p className="text-sm text-gray-900">{user.owner_profile.preferences.emergency_contact_name}</p>
                            )}
                            {user.owner_profile.preferences.emergency_contact_phone && (
                              <p className="text-sm text-gray-600">{user.owner_profile.preferences.emergency_contact_phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>

                           {/* Right Column - Images & Actions */}
              <div className="space-y-6">

               {/* Caretaker Images */}
               {user.user_type === 'caretaker' && user.caretaker_profile?.home_photos && user.caretaker_profile.home_photos.length > 0 && (
                 <div className="bg-gray-50 rounded-lg p-4">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Umgebungsbilder</h3>
                   <div className="grid grid-cols-2 gap-2">
                     {user.caretaker_profile.home_photos.map((photo, index) => (
                       <img 
                         key={index}
                         src={photo} 
                         alt={`Umgebungsbild ${index + 1}`} 
                         className="w-full h-24 object-cover rounded-lg border border-gray-200"
                       />
                     ))}
                   </div>
                 </div>
               )}

                               {/* Services & Availability */}
                {user.user_type === 'caretaker' && user.caretaker_profile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Leistungen & Verfügbarkeit</h3>
                    <div className="space-y-4">
                      {/* Leistungen & Preise */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Leistungen & Preise</p>
                        {user.caretaker_profile.services_with_categories && Array.isArray(user.caretaker_profile.services_with_categories) && user.caretaker_profile.services_with_categories.length > 0 ? (
                          <div className="space-y-2">
                            {user.caretaker_profile.services_with_categories.map((service, index) => (
                              <div key={index} className="flex justify-between items-center bg-white rounded p-2 border">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900">{service.name}</span>
                                  {service.category_name && service.category_name !== 'Allgemein' && (
                                    <span className="text-xs text-gray-500">{service.category_name}</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  {service.price !== undefined ? (
                                    <span className="text-sm font-medium text-gray-900">€{service.price}</span>
                                  ) : (
                                    <span className="text-sm text-gray-500">Kein Preis</span>
                                  )}
                                  {service.price_type && (
                                    <div className="text-xs text-gray-500">
                                      {service.price_type === 'per_hour' ? '/h' : 
                                       service.price_type === 'per_visit' ? '/Besuch' : 
                                       service.price_type === 'per_day' ? '/Tag' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">Keine Leistungen angegeben</p>
                        )}
                      </div>

                      {/* Stundensatz */}
                      {user.caretaker_profile.hourly_rate && (
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Stundensatz</p>
                            <p className="text-sm text-gray-600">€{user.caretaker_profile.hourly_rate}/h</p>
                          </div>
                        </div>
                      )}

                      {/* Verfügbarkeit */}
                      {user.caretaker_profile.short_term_available && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Kurzfristig verfügbar</p>
                            <p className="text-sm text-gray-600">Ja</p>
                          </div>
                        </div>
                      )}

                      {/* Bewertungen */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Bewertungen</p>
                        <div className="space-y-2">
                          {user.caretaker_profile.rating ? (
                            <div className="flex items-center gap-3">
                              <StarIcon className="h-4 w-4 text-yellow-500" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  {user.caretaker_profile.rating}/5 Sterne
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.caretaker_profile.review_count || 0} Bewertungen
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">Noch keine Bewertungen</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

               {/* Actions */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Aktionen</h3>
                 <div className="space-y-3">
                   {/* Edit action */}
                   <Button
                     onClick={() => onEditUser(user)}
                     className="w-full justify-center"
                     variant="primary"
                   >
                     <Edit className="h-4 w-4 mr-2" />
                     Benutzer bearbeiten
                   </Button>

                   {/* Caretaker-specific actions */}
                   {user.user_type === 'caretaker' && (
                     <>
                       {user.approval_status === 'pending' && (
                         <Button
                           onClick={() => onAction('approve', user.id)}
                           disabled={actionLoading === 'approve'}
                           className="w-full justify-center"
                           variant="success"
                         >
                           <CheckCircle className="h-4 w-4 mr-2" />
                           Freigeben
                         </Button>
                       )}
                       {user.approval_status === 'approved' && (
                         <Button
                           onClick={() => onAction('reject', user.id)}
                           disabled={actionLoading === 'reject'}
                           className="w-full justify-center"
                           variant="danger"
                         >
                           <XCircle className="h-4 w-4 mr-2" />
                           Ablehnen
                         </Button>
                       )}
                       {(!user.approval_status || user.approval_status === 'rejected') && (
                         <Button
                           onClick={() => onAction('approve', user.id)}
                           disabled={actionLoading === 'approve'}
                           className="w-full justify-center"
                           variant="success"
                         >
                           <CheckCircle className="h-4 w-4 mr-2" />
                           {!user.approval_status ? 'Direkt freigeben' : 'Freigeben'}
                         </Button>
                       )}
                       <Button
                         onClick={() => onAction('verify', user.id)}
                         disabled={actionLoading === 'verify'}
                         className="w-full justify-center"
                         variant="primary"
                       >
                         <BadgeCheck className="h-4 w-4 mr-2" />
                         Verifizieren
                       </Button>
                     </>
                   )}

                   {/* Delete action */}
                   <Button
                     onClick={() => onShowActionModal({ type: 'delete', userId: user.id })}
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
            
            {/* Timestamps - Full Width at Bottom */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Zeitstempel</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Registriert</p>
                    <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Letzter Login</p>
                    <p className="text-sm text-gray-600">
                      {user.last_login_at ? formatDate(user.last_login_at) : 'Nie'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aktualisiert</p>
                    <p className="text-sm text-gray-600">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
       </div>
     </div>
   );
 };

export default UserDetailModal;
